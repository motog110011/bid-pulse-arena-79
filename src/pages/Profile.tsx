import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Upload, Truck, Gift, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const addressSchema = z.object({
  fullName: z.string().min(2, "El nombre completo es requerido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  street: z.string().min(5, "La dirección es requerida"),
  colony: z.string().min(2, "La colonia es requerida"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().min(2, "El estado es requerido"),
  zipCode: z.string().min(5, "El código postal es requerido"),
  references: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/perfil");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("shipping_full_name, shipping_phone, shipping_street, shipping_colony, shipping_city, shipping_state, shipping_zip_code, shipping_references, id_document_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        addressForm.reset({
          fullName:   data.shipping_full_name  ?? "",
          phone:      data.shipping_phone      ?? "",
          street:     data.shipping_street     ?? "",
          colony:     data.shipping_colony     ?? "",
          city:       data.shipping_city       ?? "",
          state:      data.shipping_state      ?? "",
          zipCode:    data.shipping_zip_code   ?? "",
          references: data.shipping_references ?? "",
        });
        if (data.id_document_url) setIdFileName(data.id_document_url.split("/").pop() ?? "Identificación cargada");
      });
  }, [user]);

  const handleAddressSubmit = async (data: AddressFormData) => {
    if (!user) return;
    setSavingAddress(true);
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        shipping_full_name:  data.fullName,
        shipping_phone:      data.phone,
        shipping_street:     data.street,
        shipping_colony:     data.colony,
        shipping_city:       data.city,
        shipping_state:      data.state,
        shipping_zip_code:   data.zipCode,
        shipping_references: data.references ?? null,
        updated_at:          new Date().toISOString(),
      })
      .eq("id", user.id);
    setSavingAddress(false);
    if (error) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dirección guardada", description: "Tu dirección de entrega fue actualizada." });
      setShippingCost(200);
    }
  };

  const handleIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Archivo muy grande", description: "Máximo 5 MB.", variant: "destructive" });
      return;
    }
    setIdFile(file);
    setUploadingId(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/identificacion.${ext}`;
    const { error: uploadError } = await (supabase as any).storage
      .from("identificaciones")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Error al subir identificación", description: uploadError.message, variant: "destructive" });
      setUploadingId(false);
      return;
    }
    await (supabase as any).from("profiles").update({ id_document_url: path, updated_at: new Date().toISOString() }).eq("id", user.id);
    setIdFileName(file.name);
    setUploadingId(false);
    toast({ title: "Identificación cargada", description: "Tu identificación fue guardada correctamente." });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground">
              Gestiona tu información personal y configuración de envíos
            </p>
          </div>

          <div className="grid gap-6">
            {/* Dirección de Entrega */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...addressForm}>
                  <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={addressForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Juan Pérez" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="55 1234 5678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={addressForm.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calle y número</FormLabel>
                          <FormControl>
                            <Input placeholder="Av. Principal 123, Col. Centro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={addressForm.control}
                        name="colony"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Colonia</FormLabel>
                            <FormControl>
                              <Input placeholder="Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <FormControl>
                              <Input placeholder="Ciudad de México" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={addressForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input placeholder="CDMX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código postal</FormLabel>
                            <FormControl>
                              <Input placeholder="06000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={addressForm.control}
                      name="references"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referencias (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Entre calles, puntos de referencia, indicaciones adicionales..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-gradient-primary" disabled={savingAddress}>
                      {savingAddress
                        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        : <MapPin className="h-4 w-4 mr-2" />}
                      {savingAddress ? "Guardando..." : "Guardar Dirección y Calcular Envío"}
                    </Button>
                  </form>
                </Form>

                {shippingCost && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Costo de Envío Calculado
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Envío estándar:</span>
                        <span className="font-bold">${shippingCost.toLocaleString()} MXN</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <Gift className="h-4 w-4" />
                        <span className="text-sm">
                          ¡Envío GRATUITO al comprar 3 o más productos!
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Identificación Oficial */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Identificación Oficial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      En caso de adquirir bebidas alcohólicas, será obligatorio cargar una identificación oficial vigente que acredite la mayoría de edad. No se procesarán envíos sin esta verificación.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="id-upload">Subir identificación oficial</Label>
                  <div className="mt-2">
                    <Input
                      id="id-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleIdUpload}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Acepta: INE/IFE, Pasaporte, Cédula Profesional (formato JPG, PNG o PDF)
                  </p>
                </div>

                {uploadingId && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-800">Subiendo identificación...</span>
                  </div>
                )}
                {!uploadingId && idFileName && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <Upload className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">
                      Identificación guardada: {idFileName}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;