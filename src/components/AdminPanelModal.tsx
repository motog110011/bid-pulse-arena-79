import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, DollarSign, Users, Clock, TrendingUp, Search, Crown, User, Shield } from 'lucide-react'
import { AdminRoleManager } from '@/components/AdminRoleManager'

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

interface DetailedUser {
  id: string
  email: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  created_at: string
  profile?: {
    full_name?: string
  }
  role?: {
    role: string
  }
  wallet?: {
    balance: number
  }
  transactions_count?: number
  recharge_requests_count?: number
}

export function AdminPanelModal() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([])
  const [userWallets, setUserWallets] = useState<UserWallet[]>([])
  const [detailedUsers, setDetailedUsers] = useState<DetailedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [confirmationFilter, setConfirmationFilter] = useState('all')

  const fetchData = () => {
    fetchRechargeRequests()
    fetchUserWallets()
    fetchDetailedUsers()
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchRechargeRequests = async () => {
    try {
      // @ts-ignore - Temporary fix for missing types
      const { data, error } = await (supabase as any)
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
      // @ts-ignore - Temporary fix for missing types
      const { data, error } = await (supabase as any)
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

  const fetchDetailedUsers = async () => {
    try {
      // @ts-ignore - Temporary fix for missing types
      const { data: users, error } = await (supabase as any)
        .rpc('get_detailed_users')

      if (error) {
        console.error('Error fetching detailed users:', error)
        // Fallback to basic user data if RPC function doesn't exist
        await fetchBasicUserData()
      } else {
        setDetailedUsers(users || [])
      }
    } catch (error) {
      console.error('Error fetching detailed users:', error)
      await fetchBasicUserData()
    }
  }

  const fetchBasicUserData = async () => {
    try {
      // Get auth users data from profiles, roles, and wallets
      // @ts-ignore - Temporary fix for missing types
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('*')

      // @ts-ignore - Temporary fix for missing types
      const { data: roles } = await (supabase as any)
        .from('user_roles')
        .select('*')

      // @ts-ignore - Temporary fix for missing types
      const { data: wallets } = await (supabase as any)
        .from('user_wallets')
        .select('*')

      // @ts-ignore - Temporary fix for missing types
      const { data: transactionCounts } = await (supabase as any)
        .from('balance_transactions')
        .select('user_id')

      // @ts-ignore - Temporary fix for missing types
      const { data: requestCounts } = await (supabase as any)
        .from('wallet_recharge_requests')
        .select('user_id')

      // Combine data into detailed users format
      const userMap = new Map()
      
      profiles?.forEach((profile: any) => {
        userMap.set(profile.id, {
          id: profile.id,
          email: 'N/A', // Can't access auth.users directly
          email_confirmed_at: null,
          last_sign_in_at: null,
          created_at: profile.created_at,
          profile: {
            full_name: profile.full_name
          },
          role: null,
          wallet: null,
          transactions_count: 0,
          recharge_requests_count: 0
        })
      })

      roles?.forEach((role: any) => {
        if (userMap.has(role.user_id)) {
          userMap.get(role.user_id).role = { role: role.role }
        }
      })

      wallets?.forEach((wallet: any) => {
        if (userMap.has(wallet.user_id)) {
          userMap.get(wallet.user_id).wallet = { balance: wallet.balance }
        }
      })

      // Count transactions
      const transactionCountMap = new Map()
      transactionCounts?.forEach((t: any) => {
        transactionCountMap.set(t.user_id, (transactionCountMap.get(t.user_id) || 0) + 1)
      })

      // Count recharge requests
      const requestCountMap = new Map()
      requestCounts?.forEach((r: any) => {
        requestCountMap.set(r.user_id, (requestCountMap.get(r.user_id) || 0) + 1)
      })

      userMap.forEach((user, userId) => {
        user.transactions_count = transactionCountMap.get(userId) || 0
        user.recharge_requests_count = requestCountMap.get(userId) || 0
      })

      setDetailedUsers(Array.from(userMap.values()))
    } catch (error) {
      console.error('Error fetching basic user data:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // @ts-ignore - Temporary fix for missing types
      const { error } = await (supabase as any)
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
        }, { 
          onConflict: 'user_id,role' 
        })

      if (error) throw error

      toast({
        title: "Rol Actualizado",
        description: `El rol del usuario ha sido cambiado a ${newRole}`,
      })

      fetchDetailedUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario",
        variant: "destructive",
      })
    }
  }

  const handleRechargeRequest = async (requestId: string, approve: boolean, notes?: string) => {
    try {
      setProcessingRequest(requestId)
      
      const request = rechargeRequests.find(r => r.id === requestId)
      if (!request) return

      // @ts-ignore - Temporary fix for missing types
      const { error: updateError } = await (supabase as any)
        .from('wallet_recharge_requests')
        .update({
          status: approve ? 'approved' : 'rejected',
          admin_notes: notes || null
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      if (approve) {
        // @ts-ignore - Temporary fix for missing types
        const { data: wallet } = await (supabase as any)
          .from('user_wallets')
          .select('balance')
          .eq('user_id', request.user_id)
          .single()

        if (wallet) {
          // @ts-ignore - Temporary fix for missing types
          const { error: updateWalletError } = await (supabase as any)
            .from('user_wallets')
            .update({ balance: Number(wallet.balance) + Number(request.amount) })
            .eq('user_id', request.user_id)

          if (updateWalletError) throw updateWalletError
        }

        // @ts-ignore - Temporary fix for missing types
        const { data: walletData } = await (supabase as any)
          .from('user_wallets')
          .select('id')
          .eq('user_id', request.user_id)
          .single()

        if (walletData) {
          // @ts-ignore - Temporary fix for missing types
          await (supabase as any)
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

  const pendingRequests = rechargeRequests.filter(r => r.status === 'pending')
  const totalBalance = userWallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona recargas y balances de usuarios</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <Tabs defaultValue="recharge-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recharge-requests">Solicitudes de Recarga</TabsTrigger>
          <TabsTrigger value="user-wallets">Billeteras de Usuarios</TabsTrigger>
          <TabsTrigger value="user-management">Gestión de Usuarios</TabsTrigger>
          <TabsTrigger value="admin-management">Gestión de Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="recharge-requests" className="space-y-4">
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
                <div className="space-y-4 max-h-96 overflow-y-auto">
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

        <TabsContent value="user-wallets" className="space-y-4">
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
                <div className="space-y-4 max-h-96 overflow-y-auto">
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

        <TabsContent value="user-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra usuarios, roles y visualiza información detallada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                    <SelectItem value="user">Usuarios</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={confirmationFilter} onValueChange={setConfirmationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Estado de email" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="confirmed">Confirmados</SelectItem>
                    <SelectItem value="unconfirmed">Sin confirmar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              {loading ? (
                <p>Cargando usuarios...</p>
              ) : detailedUsers.length === 0 ? (
                <p className="text-muted-foreground">No hay usuarios registrados</p>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Transacciones</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedUsers
                        .filter(user => {
                          const matchesSearch = !searchTerm || 
                            (user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                          
                          const matchesRole = roleFilter === 'all' || user.role?.role === roleFilter
                          
                          const matchesConfirmation = confirmationFilter === 'all' ||
                            (confirmationFilter === 'confirmed' && user.email_confirmed_at) ||
                            (confirmationFilter === 'unconfirmed' && !user.email_confirmed_at)
                          
                          return matchesSearch && matchesRole && matchesConfirmation
                        })
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                                  {user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {user.profile?.full_name || 'Sin nombre'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate">
                                {user.email || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role?.role === 'admin' ? 'default' : 'secondary'}>
                                <div className="flex items-center gap-1">
                                  {user.role?.role === 'admin' ? (
                                    <Crown className="h-3 w-3" />
                                  ) : (
                                    <User className="h-3 w-3" />
                                  )}
                                  {user.role?.role === 'admin' ? 'Admin' : 'Usuario'}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-right">
                                <p className="font-semibold">
                                  ${(user.wallet?.balance || 0).toLocaleString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <p className="text-sm">
                                  {user.transactions_count || 0} transacciones
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.recharge_requests_count || 0} recargas
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.email_confirmed_at ? 'default' : 'secondary'}>
                                {user.email_confirmed_at ? 'Confirmado' : 'Pendiente'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.role?.role || 'user'}
                                onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Usuario</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin-management" className="space-y-4">
          <AdminRoleManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}