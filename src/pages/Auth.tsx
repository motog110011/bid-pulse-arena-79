import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Gavel, ArrowLeft } from "lucide-react";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Login form
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Signup form
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Error de autenticación",
            description: "Email o contraseña incorrectos. Verifica tus datos.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error de inicio de sesión",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Hubo un problema al iniciar sesión. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error de validación",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Error de validación",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.fullName,
          }
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Usuario existente",
            description: "Ya existe una cuenta con este email. Intenta iniciar sesión.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error de registro",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "¡Cuenta creada!",
          description: "Tu cuenta ha sido creada exitosamente. Puedes iniciar sesión ahora.",
        });
        setActiveTab("login");
        setLoginData({ email: signupData.email, password: "" });
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Hubo un problema al crear la cuenta. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "demo@subastasgap.mx",
        password: "demo123456",
      });

      if (error) {
        toast({
          title: "Error con usuario demo",
          description: "No se pudo acceder con el usuario demo. Intenta crear una cuenta.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Acceso demo activado!",
          description: "Has iniciado sesión con el usuario demo.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Hubo un problema con el acceso demo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver a Subastas GAP
          </Link>
          
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Subastas GAP
              </h1>
              <p className="text-sm text-muted-foreground">Premium Auctions</p>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle>Accede a tu cuenta</CardTitle>
            <CardDescription>
              Inicia sesión o crea una cuenta para participar en las subastas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Tu contraseña"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Iniciar Sesión
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      placeholder="Repite tu contraseña"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Cuenta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;