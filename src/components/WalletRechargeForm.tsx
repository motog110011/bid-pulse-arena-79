import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CreditCard, Smartphone, Mail, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const rechargeSchema = z.object({
  amount: z.number()
    .min(50, "El monto mínimo es $50")
    .max(50000, "El monto máximo es $50,000"),
  contactMethod: z.enum(["email", "whatsapp", "phone"], {
    required_error: "Selecciona un método de contacto",
  }),
  contactValue: z.string().min(1, "Este campo es requerido"),
  paymentProof: z.instanceof(File).optional(),
});

type RechargeFormData = z.infer<typeof rechargeSchema>;

interface BankDetails {
  bank_name: string
  account_holder: string
  account_number: string
  clabe: string
  reference_instructions: string
}

export function WalletRechargeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loadingBankDetails, setLoadingBankDetails] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<RechargeFormData>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      amount: 500,
      contactMethod: "email",
      contactValue: "",
    },
  });

  // Fetch bank details on component mount
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        setLoadingBankDetails(true)
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
      } finally {
        setLoadingBankDetails(false)
      }
    }

    fetchBankDetails()
  }, [])

  const generateReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REC-${timestamp}-${random}`;
  };

  const onSubmit = async (data: RechargeFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para solicitar una recarga",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const referenceNumber = generateReference();
      
      // Upload payment proof if provided
      let paymentProofUrl = null
      if (data.paymentProof) {
        // For now, we'll just indicate a file was provided
        // In a real implementation, you'd upload to Supabase Storage
        paymentProofUrl = `payment-proof-${referenceNumber}`
      }

      // Save to database
      const { error } = await supabase
        .from('wallet_recharge_requests')
        .insert({
          user_id: user.id,
          amount: data.amount,
          contact_method: data.contactMethod,
          contact_value: data.contactValue,
          reference_number: referenceNumber,
          payment_proof_url: paymentProofUrl,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      // Create admin notification
      await supabase.rpc('create_admin_notification', {
        notification_type: 'recharge_request',
        notification_title: 'Nueva solicitud de recarga',
        notification_message: `Usuario solicitó recarga de $${data.amount}`,
        notification_data: { 
          amount: data.amount, 
          reference: referenceNumber,
          user_id: user.id 
        },
        triggering_user_id: user.id
      })

      toast({
        title: "Solicitud enviada",
        description: `Tu solicitud de recarga ha sido enviada. Número de referencia: ${referenceNumber}`,
      });

      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al procesar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingBankDetails) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Cargando información bancaria...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Recargar Billetera
        </CardTitle>
        <CardDescription>
          Realiza una transferencia bancaria para recargar tu billetera digital
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bankDetails && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="font-semibold text-sm mb-3 text-primary">Datos Bancarios</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Banco:</span> {bankDetails.bank_name}
              </div>
              <div>
                <span className="font-medium">Titular:</span> {bankDetails.account_holder}
              </div>
              <div>
                <span className="font-medium">Cuenta:</span> {bankDetails.account_number}
              </div>
              <div>
                <span className="font-medium">CLABE:</span> {bankDetails.clabe}
              </div>
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                <span className="font-medium">Importante:</span> {bankDetails.reference_instructions}
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto a recargar (MXN)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="500"
                      min={50}
                      max={50000}
                      step={50}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Monto mínimo: $50 - Monto máximo: $50,000
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de contacto preferido</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <label
                          htmlFor="email"
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <Mail className="h-4 w-4" />
                          Correo electrónico
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="whatsapp" id="whatsapp" />
                        <label
                          htmlFor="whatsapp"
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <Smartphone className="h-4 w-4" />
                          WhatsApp
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" />
                        <label
                          htmlFor="phone"
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <Smartphone className="h-4 w-4" />
                          Teléfono
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("contactMethod") === "email" 
                      ? "Correo electrónico" 
                      : "Número de teléfono"
                    }
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={form.watch("contactMethod") === "email" ? "email" : "tel"}
                      placeholder={
                        form.watch("contactMethod") === "email" 
                          ? "tu@email.com" 
                          : "+52 55 1234 5678"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentProof"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Comprobante de pago (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onChange(file)
                      }}
                      {...field}
                      value=""
                    />
                  </FormControl>
                  <FormDescription>
                    Sube tu comprobante de transferencia (imagen o PDF)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-glow"
              disabled={isLoading}
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CreditCard className="mr-2 h-4 w-4" />
              {isLoading ? "Enviando..." : "Enviar Solicitud"}
            </Button>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Proceso de Recarga</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Realiza la transferencia bancaria con los datos mostrados arriba</li>
                <li>2. Usa el número de referencia que recibirás al enviar este formulario</li>
                <li>3. Sube tu comprobante de pago (opcional pero recomendado)</li>
                <li>4. Tu billetera será recargada en un máximo de 24 horas</li>
              </ol>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}