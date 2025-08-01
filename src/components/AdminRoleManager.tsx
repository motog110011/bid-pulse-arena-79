import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { UserPlus } from 'lucide-react'

export function AdminRoleManager() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const makeUserAdmin = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      // Use the existing database function to make user admin
      const { error } = await (supabase as any).rpc('make_user_admin', {
        user_email: email.trim()
      })

      if (error) {
        throw error
      }

      toast({
        title: "Éxito",
        description: `El usuario ${email} ahora es administrador`,
      })
      
      setEmail('')
    } catch (error: any) {
      console.error('Error making user admin:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo otorgar permisos de administrador",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Gestión de Administradores
        </CardTitle>
        <CardDescription>
          Otorga permisos de administrador a otros usuarios del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button
            onClick={makeUserAdmin}
            disabled={loading || !email.trim()}
          >
            {loading ? 'Procesando...' : 'Hacer Admin'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          El usuario debe estar registrado en el sistema para poder otorgarle permisos de administrador.
        </p>
      </CardContent>
    </Card>
  )
}