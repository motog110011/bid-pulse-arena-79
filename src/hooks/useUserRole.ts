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

    fetchRole()
  }, [user])

  const fetchRole = async () => {
    if (!user) return

    try {
      setLoading(true)
      // @ts-ignore - Temporary fix for missing types
      const { data, error } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching role:', error)
        setRole('user') // Default to user role
      } else if (data) {
        setRole(data.role)
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