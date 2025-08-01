import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/integrations/supabase/client'

export function useUserRole() {
  const [role, setRole] = useState<'admin' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setRole(null)
      setLoading(false)
      setReady(true)
      return
    }

    fetchUserRole()
  }, [user?.id])

  const fetchUserRole = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Use the existing database function to get user role
      const { data, error } = await (supabase as any).rpc('get_current_user_role')

      console.log('🔍 Role fetch result:', { data, error })

      if (error) {
        console.error('Error fetching user role:', error)
        setRole('user') // Default to user role on error
      } else {
        // The function returns app_role enum
        const userRole = data as 'admin' | 'user' | null
        console.log('✅ Setting role to:', userRole || 'user')
        setRole(userRole || 'user')
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error)
      setRole('user')
    } finally {
      setLoading(false)
      setReady(true)
    }
  }

  const refreshRole = () => {
    if (user) {
      fetchUserRole()
    }
  }

  const isAdmin = role === 'admin'

  return {
    role,
    isAdmin,
    loading,
    ready,
    refreshRole,
  }
}