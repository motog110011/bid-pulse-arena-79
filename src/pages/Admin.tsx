import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { supabase } from '@/integrations/supabase/client'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CheckCircle, XCircle, DollarSign, Users, Clock, TrendingUp } from 'lucide-react'

interface RechargeRequest {
  id: string
  user_id: string
  amount: number
  contact_method: string
  contact_value: string
  reference_number: string
  status: string
  created_at: string
  admin_notes?: string
  profiles?: {
    full_name?: string
  }
}

interface UserWallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  profiles?: {
    full_name?: string
  }
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: roleLoading } = useUserRole()
  const { toast } = useToast()
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([])
  const [userWallets, setUserWallets] = useState<UserWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    if (user && isAdmin) {
      fetchRechargeRequests()
      fetchUserWallets()
    }
  }, [user, isAdmin])

  const fetchRechargeRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_recharge_requests')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRechargeRequests(data || [])
    } catch (error) {
      console.error('Error fetching recharge requests:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes de recarga",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserWallets(data || [])
    } catch (error) {
      console.error('Error fetching user wallets:', error)
    }
  }

  const handleRechargeRequest = async (requestId: string, approve: boolean, notes?: string) => {
    try {
      setProcessingRequest(requestId)
      
      const request = rechargeRequests.find(r => r.id === requestId)
      if (!request) return

      // Update the recharge request status
      const { error: updateError } = await supabase
        .from('wallet_recharge_requests')
        .update({
          status: approve ? 'approved' : 'rejected',
          admin_notes: notes || null
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      if (approve) {
        // Update user wallet balance
        const { error: walletError } = await supabase.rpc('increment_user_balance', {
          user_id: request.user_id,
          amount: request.amount
        })

        if (walletError) {
          // If RPC doesn't exist, update manually
          const { data: wallet } = await supabase
            .from('user_wallets')
            .select('balance')
            .eq('user_id', request.user_id)
            .single()

          if (wallet) {
            const { error: updateWalletError } = await supabase
              .from('user_wallets')
              .update({ balance: Number(wallet.balance) + Number(request.amount) })
              .eq('user_id', request.user_id)

            if (updateWalletError) throw updateWalletError
          }
        }

        // Create transaction record
        const { data: walletData } = await supabase
          .from('user_wallets')
          .select('id')
          .eq('user_id', request.user_id)
          .single()

        if (walletData) {
          await supabase
            .from('balance_transactions')
            .insert({
              user_id: request.user_id,
              wallet_id: walletData.id,
              amount: request.amount,
              transaction_type: 'recharge_approved',
              description: `Recarga aprobada - Referencia: ${request.reference_number}`,
              reference_number: request.reference_number
            })
        }
      }

      toast({
        title: approve ? "Recarga Aprobada" : "Recarga Rechazada",
        description: approve 
          ? `Se ha agregado $${request.amount} al balance del usuario`
          : "La solicitud de recarga ha sido rechazada",
      })

      // Refresh data
      fetchRechargeRequests()
      fetchUserWallets()
    } catch (error) {
      console.error('Error processing recharge request:', error)
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setProcessingRequest(null)
    }
  }

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const pendingRequests = rechargeRequests.filter(r => r.status === 'pending')
  const totalBalance = userWallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona recargas y balances de usuarios</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userWallets.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recargas Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rechargeRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recharge-requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recharge-requests">Solicitudes de Recarga</TabsTrigger>
            <TabsTrigger value="user-wallets">Billeteras de Usuarios</TabsTrigger>
          </TabsList>

          <TabsContent value="recharge-requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Recarga</CardTitle>
                <CardDescription>
                  Revisa y aprueba las solicitudes de recarga de los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Cargando solicitudes...</p>
                ) : rechargeRequests.length === 0 ? (
                  <p className="text-muted-foreground">No hay solicitudes de recarga</p>
                ) : (
                  <div className="space-y-4">
                    {rechargeRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {request.profiles?.full_name || 'Usuario sin nombre'}
                              </h4>
                              <Badge variant={
                                request.status === 'pending' ? 'secondary' :
                                request.status === 'approved' ? 'default' : 'destructive'
                              }>
                                {request.status === 'pending' ? 'Pendiente' :
                                 request.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Referencia: {request.reference_number}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${request.amount}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.contact_method}: {request.contact_value}
                            </p>
                          </div>
                        </div>

                        {request.admin_notes && (
                          <div className="bg-muted p-3 rounded">
                            <p className="text-sm"><strong>Notas del admin:</strong> {request.admin_notes}</p>
                          </div>
                        )}

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleRechargeRequest(request.id, true)}
                              disabled={processingRequest === request.id}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Aprobar
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleRechargeRequest(request.id, false)}
                              disabled={processingRequest === request.id}
                              className="flex items-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-wallets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billeteras de Usuarios</CardTitle>
                <CardDescription>
                  Visualiza y gestiona los balances de todos los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userWallets.length === 0 ? (
                  <p className="text-muted-foreground">No hay usuarios registrados</p>
                ) : (
                  <div className="space-y-4">
                    {userWallets.map((wallet) => (
                      <div key={wallet.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold">
                              {wallet.profiles?.full_name || 'Usuario sin nombre'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Creado: {new Date(wallet.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${Number(wallet.balance).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Balance actual</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}