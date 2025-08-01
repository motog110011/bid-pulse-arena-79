import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export function useUserRole() {
  const [role, setRole] = useState<'admin' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setRole(null)
      setLoading(false)
      return
    }

    // Hardcoded admin check
    if (user.email === 'motog110011@gmail.com') {
      setRole('admin')
      setLoading(false)
      return
    }

    setRole('user')
    setLoading(false)
  }, [user])

  const fetchRole = async () => {
    if (!user) return

    try {
      console.log('Fetching role for user:', user.id)
      
      // @ts-ignore - Temporary fix for missing types
      const { data, error } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('Role query result:', { data, error })

      if (error) {
        console.error('Error fetching role:', error)
        setRole('user') // Default to user role
      } else if (data) {
        console.log('Setting role to:', data.role)
        setRole(data.role)
      } else {
        console.log('No role found, setting to user')
        setRole('user')
      }
    } catch (error) {
      console.error('Error fetching role:', error)
      setRole('user')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = role === 'admin'

  return {
    role,
    isAdmin,
    loading,
    refreshRole: fetchRole,
  }
}