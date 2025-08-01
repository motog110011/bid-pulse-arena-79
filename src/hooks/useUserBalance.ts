import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export function useUserBalance() {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setBalance(0)
      setLoading(false)
      return
    }

    fetchBalance()
  }, [user])

  const fetchBalance = async () => {
    if (!user) return

    try {
      setLoading(true)
      // @ts-ignore - Temporary fix for missing types
      const { data, error } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching balance:', error)
        setBalance(0)
      } else if (data) {
        setBalance(Number(data.balance) || 0)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance(0)
    } finally {
      setLoading(false)
    }
  }

  const refreshBalance = () => {
    fetchBalance()
  }

  return {
    balance,
    loading,
    refreshBalance,
  }
}