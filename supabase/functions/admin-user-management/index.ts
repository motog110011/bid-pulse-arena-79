import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface UserManagementRequest {
  action: 'delete' | 'verify' | 'change_password' | 'suspend' | 'activate'
  userId: string
  email?: string
  newPassword?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the requesting user is admin
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      throw new Error('Insufficient permissions')
    }

    const { action, userId, email, newPassword }: UserManagementRequest = await req.json()

    console.log(`Admin ${user.email} performing action: ${action} on user: ${userId}`)

    let result: any = {}

    switch (action) {
      case 'delete':
        // Delete user and all related data
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError
        
        // The cascade delete should handle related data, but let's be explicit
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId)
        await supabaseAdmin.from('user_wallets').delete().eq('user_id', userId)
        await supabaseAdmin.from('balance_transactions').delete().eq('user_id', userId)
        await supabaseAdmin.from('wallet_recharge_requests').delete().eq('user_id', userId)
        
        result = { message: 'User deleted successfully' }
        break

      case 'verify':
        // Verify user email
        const { error: verifyError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { email_confirm: true }
        )
        if (verifyError) throw verifyError
        result = { message: 'User verified successfully' }
        break

      case 'change_password':
        if (!newPassword) throw new Error('New password is required')
        
        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        )
        if (passwordError) throw passwordError
        result = { message: 'Password changed successfully' }
        break

      case 'suspend':
        // Suspend user by updating ban_duration
        const { error: suspendError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: '876000h' } // 100 years
        )
        if (suspendError) throw suspendError
        result = { message: 'User suspended successfully' }
        break

      case 'activate':
        // Activate user by removing ban
        const { error: activateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: 'none' }
        )
        if (activateError) throw activateError
        result = { message: 'User activated successfully' }
        break

      default:
        throw new Error('Invalid action')
    }

    // Log the admin action
    await supabaseAdmin.from('balance_transactions').insert({
      user_id: user.id,
      wallet_id: '00000000-0000-0000-0000-000000000000', // System transaction
      amount: 0,
      transaction_type: 'admin_action',
      description: `Admin action: ${action} on user ${userId}`,
      reference_number: `ADM-${Date.now()}`
    })

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Admin user management error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})