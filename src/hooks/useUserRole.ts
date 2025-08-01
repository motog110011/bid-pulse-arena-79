import { useState, useEffect } from 'react'
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
    } else {
      setRole('user')
    }
    setLoading(false)
  }, [user])

  const isAdmin = role === 'admin'

  return {
    role,
    isAdmin,
    loading,
    refreshRole: () => {}, // Dummy function
  }
}