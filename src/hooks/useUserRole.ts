import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export function useUserRole() {
  const [role, setRole] = useState<'admin' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  console.log('🔍 useUserRole render:', { 
    userEmail: user?.email, 
    role, 
    loading,
    isAdmin: role === 'admin'
  })

  useEffect(() => {
    console.log('🔄 useUserRole effect triggered:', { userEmail: user?.email })
    
    if (!user) {
      console.log('❌ No user, setting role to null')
      setRole(null)
      setLoading(false)
      return
    }

    console.log('👤 User found:', user.email)
    
    // Hardcoded admin check - hacer esto inmediatamente y de forma síncrona
    if (user.email === 'motog110011@gmail.com') {
      console.log('✅ Setting role to ADMIN for motog110011@gmail.com')
      setRole('admin')
      setLoading(false)
    } else {
      console.log('👥 Setting role to USER for', user.email)
      setRole('user')
      setLoading(false)
    }
    console.log('🔚 Effect complete')
  }, [user?.email]) // Cambiar dependencia a user?.email para evitar recreaciones

  const isAdmin = role === 'admin'
  
  console.log('📊 Final values:', { role, isAdmin, loading })

  return {
    role,
    isAdmin,
    loading,
    refreshRole: () => {}, // Dummy function
  }
}