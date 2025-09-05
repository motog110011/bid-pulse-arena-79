import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, DollarSign, Users, Clock, TrendingUp, Search, Crown, User, Shield, Edit2, Mail, Ban, Trash2, MoreHorizontal, Key } from 'lucide-react'
import { AdminRoleManager } from '@/components/AdminRoleManager'
import { AuctionManagement } from '@/components/AuctionManagement'

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

interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
  user_id: string | null
}

interface BankDetails {
  bank_name: string
  account_holder: string
  account_number: string
  clabe: string
  reference_instructions: string
}

interface DetailedUser {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
  last_sign_in_at: string | null
  role: string
  balance: number
  transaction_count: number
  full_name: string | null
}

interface EditingBalance {
  userId: string
  currentBalance: number
  newBalance: string
  notes: string
}

interface EditingPassword {
  userId: string
  userEmail: string
  newPassword: string
}

export function AdminPanelModal() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([])
  const [userWallets, setUserWallets] = useState<UserWallet[]>([])
  const [detailedUsers, setDetailedUsers] = useState<DetailedUser[]>([])
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all')
  const [editingBankDetails, setEditingBankDetails] = useState(false)
  const [editingBalance, setEditingBalance] = useState<EditingBalance | null>(null)
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false)
  const [editingPassword, setEditingPassword] = useState<EditingPassword | null>(null)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

  const fetchData = () => {
    fetchRechargeRequests()
    fetchUserWallets()
    fetchDetailedUsers()
    fetchNotifications()
    fetchBankDetails()
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchRechargeRequests = async () => {
    try {
      // Fetch requests first
      const { data: requests, error } = await supabase
        .from('wallet_recharge_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get profiles for all user_ids
      const userIds = requests?.map((r: any) => r.user_id) || []
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      // Combine requests with profile data
      const requestsWithProfiles = requests?.map((request: any) => ({
        ...request,
        profiles: profiles?.find((p: any) => p.id === request.user_id) || null
      })) || []

      setRechargeRequests(requestsWithProfiles)
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
      // Fetch wallets first
      const { data: wallets, error } = await supabase
        .from('user_wallets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get profiles for all user_ids
      const userIds = wallets?.map((w: any) => w.user_id) || []
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      // Combine wallets with profile data
      const walletsWithProfiles = wallets?.map((wallet: any) => ({
        ...wallet,
        profiles: profiles?.find((p: any) => p.id === wallet.user_id) || null
      })) || []

      setUserWallets(walletsWithProfiles)
    } catch (error) {
      console.error('Error fetching user wallets:', error)
    }
  }

  const fetchDetailedUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_detailed_users')
      
      if (error) {
        console.error('Error fetching detailed users:', error)
        toast({
          title: "Error",
          description: "Failed to fetch user details",
          variant: "destructive",
        })
        return
      }
      
      setDetailedUsers(data || [])
    } catch (error) {
      console.error('Error fetching detailed users:', error)
      toast({
        title: "Error", 
        description: "Failed to fetch user details",
        variant: "destructive",
      })
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'bank_details')
        .single()

      if (error) {
        console.error('Error fetching bank details:', error)
        return
      }

      if (data?.setting_value) {
        setBankDetails(data.setting_value as unknown as BankDetails)
      }
    } catch (error) {
      console.error('Error fetching bank details:', error)
    }
  }

  const updateBankDetails = async (newDetails: BankDetails) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'bank_details',
          setting_value: newDetails as any,
          description: 'Bank details for recharge instructions'
        })

      if (error) {
        throw error
      }

      setBankDetails(newDetails)
      setEditingBankDetails(false)
      toast({
        title: "Éxito",
        description: "Datos bancarios actualizados correctamente",
      })
    } catch (error) {
      console.error('Error updating bank details:', error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos bancarios",
        variant: "destructive",
      })
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        throw error
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
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

  const handleUserAction = async (userId: string, action: string, value?: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action,
          userId,
          value,
        },
      })
      
      if (error) {
        console.error('Error performing user action:', error)
        toast({
          title: "Error",
          description: `Failed to ${action} user`,
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Success",
        description: `User ${action} completed successfully`,
      })
      
      // Refresh data
      fetchData()
    } catch (error) {
      console.error('Error performing user action:', error)
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBalanceEdit = (user: DetailedUser) => {
    setEditingBalance({
      userId: user.id,
      currentBalance: user.balance,
      newBalance: user.balance.toString(),
      notes: ''
    })
    setBalanceDialogOpen(true)
  }

  const handleBalanceUpdate = async () => {
    if (!editingBalance) return
    
    try {
      setLoading(true)
      
      const { error } = await supabase.rpc('admin_update_user_balance', {
        target_user_id: editingBalance.userId,
        new_balance: parseFloat(editingBalance.newBalance),
        admin_notes: editingBalance.notes || null
      })
      
      if (error) {
        console.error('Error updating balance:', error)
        toast({
          title: "Error",
          description: `Error updating balance: ${error.message}`,
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Éxito",
        description: "Balance actualizado correctamente",
      })
      
      setEditingBalance(null)
      setBalanceDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error updating balance:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el balance",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordEdit = (user: DetailedUser) => {
    setEditingPassword({
      userId: user.id,
      userEmail: user.email,
      newPassword: ''
    })
    setPasswordDialogOpen(true)
  }

  const handlePasswordUpdate = async () => {
    if (!editingPassword || !editingPassword.newPassword) return
    
    try {
      setLoading(true)
      
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'change_password',
          userId: editingPassword.userId,
          newPassword: editingPassword.newPassword,
        },
      })
      
      if (error) {
        console.error('Error changing password:', error)
        toast({
          title: "Error",
          description: `Error cambiando contraseña: ${error.message}`,
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Éxito",
        description: "Contraseña cambiada correctamente",
      })
      
      setEditingPassword(null)
      setPasswordDialogOpen(false)
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: "Error",
        description: "Error al cambiar la contraseña",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRechargeRequest = async (requestId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    try {
      setProcessingRequest(requestId)
      
      const request = rechargeRequests.find(r => r.id === requestId)
      if (!request) return

      if (action === 'approve') {
        // Get current user balance first
        const { data: walletData } = await supabase
          .from('user_wallets')
          .select('balance')
          .eq('user_id', request.user_id)
          .single()
        
        const currentBalance = walletData?.balance || 0
        const newBalance = currentBalance + request.amount
        
        // Update user wallet balance by adding the recharge amount
        const { error: walletError } = await supabase.rpc('admin_update_user_balance', {
          target_user_id: request.user_id,
          new_balance: newBalance,
          admin_notes: `Recarga aprobada: $${request.amount} agregados. ${adminNotes || 'Sin notas adicionales'}`
        })

        if (walletError) throw walletError
      }

      // Update request status
      const { error: requestError } = await supabase
        .from('wallet_recharge_requests')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          admin_notes: adminNotes
        })
        .eq('id', requestId)

      if (requestError) throw requestError

      toast({
        title: "Solicitud Procesada",
        description: `La solicitud ha sido ${action === 'approve' ? 'aprobada' : 'rechazada'}`,
      })

      fetchData()
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

  const filteredUsers = detailedUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const BankDetailsForm = ({ details, onSave, onCancel }: {
    details: BankDetails | null
    onSave: (details: BankDetails) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState<BankDetails>(details || {
      bank_name: '',
      account_holder: '',
      account_number: '',
      clabe: '',
      reference_instructions: ''
    })

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="bank_name">Nombre del Banco</Label>
          <Input
            id="bank_name"
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="account_holder">Titular de la Cuenta</Label>
          <Input
            id="account_holder"
            value={formData.account_holder}
            onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="account_number">Número de Cuenta</Label>
          <Input
            id="account_number"
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="clabe">CLABE</Label>
          <Input
            id="clabe"
            value={formData.clabe}
            onChange={(e) => setFormData({ ...formData, clabe: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="reference_instructions">Instrucciones de Referencia</Label>
          <Textarea
            id="reference_instructions"
            value={formData.reference_instructions}
            onChange={(e) => setFormData({ ...formData, reference_instructions: e.target.value })}
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => onSave(formData)}>Guardar</Button>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  const pendingRequests = rechargeRequests.filter(r => r.status === 'pending').length
  const totalUsers = detailedUsers.length
  const totalBalance = userWallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  const totalRecharges = rechargeRequests.filter(r => r.status === 'approved').length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recargas Aprobadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecharges}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recharge-requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="recharge-requests" className="text-xs sm:text-sm">Solicitudes</TabsTrigger>
          <TabsTrigger value="user-management" className="text-xs sm:text-sm">Usuarios</TabsTrigger>
          <TabsTrigger value="auctions" className="text-xs sm:text-sm">Subastas</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notificaciones</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Config</TabsTrigger>
          <TabsTrigger value="admin-management" className="text-xs sm:text-sm">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="recharge-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Recarga de Billetera</CardTitle>
              <CardDescription>
                Revisa y gestiona las solicitudes de recarga pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rechargeRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No hay solicitudes de recarga
                  </p>
                ) : (
                  rechargeRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {request.profiles?.full_name || 'Usuario sin nombre'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Monto: ${request.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Referencia: {request.reference_number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Contacto: {request.contact_method} - {request.contact_value}
                          </p>
                        </div>
                        <Badge variant={
                          request.status === 'pending' ? 'default' :
                          request.status === 'approved' ? 'default' : 'destructive'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleRechargeRequest(request.id, 'approve')}
                            disabled={processingRequest === request.id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRechargeRequest(request.id, 'reject')}
                            disabled={processingRequest === request.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Creado: {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="user-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra usuarios, roles y permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select value={filterRole} onValueChange={(value: 'all' | 'admin' | 'user') => setFilterRole(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Transacciones</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email || 'Sin email'}
                      </TableCell>
                      <TableCell>{user.full_name || 'Sin nombre'}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => handleRoleChange(user.id, newRole as 'admin' | 'user')}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>${user.balance.toFixed(2)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBalanceEdit(user)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{user.transaction_count}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'verify')}>
                              <Mail className="mr-2 h-4 w-4" />
                              Verificar Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')}>
                              <Ban className="mr-2 h-4 w-4" />
                              Suspender Cuenta
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'activate')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activar Cuenta
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePasswordEdit(user)}>
                              <Key className="mr-2 h-4 w-4" />
                              Cambiar Contraseña
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar Usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones del Administrador</CardTitle>
              <CardDescription>
                Notificaciones recientes del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No hay notificaciones
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border rounded-lg p-4 ${notification.read ? 'bg-muted/50' : 'bg-background'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Marcar como leída
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Bancaria</CardTitle>
              <CardDescription>
                Configura los datos bancarios para las instrucciones de recarga
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingBankDetails ? (
                <BankDetailsForm
                  details={bankDetails}
                  onSave={updateBankDetails}
                  onCancel={() => setEditingBankDetails(false)}
                />
              ) : (
                <div className="space-y-4">
                  {bankDetails ? (
                    <div className="space-y-2">
                      <p><strong>Banco:</strong> {bankDetails.bank_name}</p>
                      <p><strong>Titular:</strong> {bankDetails.account_holder}</p>
                      <p><strong>Número de Cuenta:</strong> {bankDetails.account_number}</p>
                      <p><strong>CLABE:</strong> {bankDetails.clabe}</p>
                      <p><strong>Instrucciones:</strong> {bankDetails.reference_instructions}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay datos bancarios configurados</p>
                  )}
                  <Button onClick={() => setEditingBankDetails(true)}>
                    {bankDetails ? 'Editar Datos Bancarios' : 'Configurar Datos Bancarios'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auctions" className="space-y-4">
          <AuctionManagement />
        </TabsContent>

        <TabsContent value="admin-management" className="space-y-4">
          <AdminRoleManager />
        </TabsContent>
      </Tabs>

      {/* Balance editing dialog */}
      {editingBalance && (
        <Dialog open={balanceDialogOpen} onOpenChange={(open) => {
          setBalanceDialogOpen(open)
          if (!open) setEditingBalance(null)
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Balance de Usuario</DialogTitle>
              <DialogDescription>
                Actualizar el balance de la billetera del usuario.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="currentBalance">Balance Actual</Label>
                <Input
                  id="currentBalance"
                  value={`$${editingBalance.currentBalance.toFixed(2)}`}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="newBalance">Nuevo Balance</Label>
                <Input
                  id="newBalance"
                  type="number"
                  step="0.01"
                  placeholder="Ingrese el nuevo balance"
                  value={editingBalance.newBalance}
                  onChange={(e) => setEditingBalance({
                    ...editingBalance,
                    newBalance: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notas Administrativas (Opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Razón del cambio de balance..."
                  value={editingBalance.notes}
                  onChange={(e) => setEditingBalance({
                    ...editingBalance,
                    notes: e.target.value
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setBalanceDialogOpen(false)
                  setEditingBalance(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleBalanceUpdate}
                disabled={loading || !editingBalance.newBalance}
              >
                {loading ? 'Actualizando...' : 'Actualizar Balance'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Password editing dialog */}
      {editingPassword && (
        <Dialog open={passwordDialogOpen} onOpenChange={(open) => {
          setPasswordDialogOpen(open)
          if (!open) setEditingPassword(null)
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña de Usuario</DialogTitle>
              <DialogDescription>
                Establecer una nueva contraseña para {editingPassword.userEmail}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Ingrese la nueva contraseña"
                  value={editingPassword.newPassword}
                  onChange={(e) => setEditingPassword({
                    ...editingPassword,
                    newPassword: e.target.value
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setPasswordDialogOpen(false)
                  setEditingPassword(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePasswordUpdate}
                disabled={loading || !editingPassword.newPassword || editingPassword.newPassword.length < 6}
              >
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
