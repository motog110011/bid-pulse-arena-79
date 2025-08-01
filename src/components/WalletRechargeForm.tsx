import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CreditCard, Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const rechargeSchema = z.object({
  amount: z.number()
    .min(1000, "El monto mínimo es $1,000")
    .max(15000, "El monto máximo es $15,000"),
  contactMethod: z.enum(["email", "whatsapp"], {
    required_error: "Selecciona un método de contacto",
  }),
  contactValue: z.string().min(1, "Este campo es requerido"),
});

type RechargeFormData = z.infer<typeof rechargeSchema>;

export function WalletRechargeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<RechargeFormData>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      amount: 1000,
      contactMethod: "email",
      contactValue: "",
    },
  });

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

      // Simulamos el envío de la solicitud
      // En un entorno real, aquí harías la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Solicitud enviada",
        description: `Tu solicitud de recarga ha sido enviada. Número de referencia: ${referenceNumber}`,
      });

      form.reset();
    } catch (error) {
      console.error('Error creating recharge request:', error);
      toast({
        title: "Error",
        description: "Error al procesar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Solicitar Recarga de Billetera
        </CardTitle>
        <CardDescription>
          Solicita una recarga a tu billetera digital. Monto mínimo: $1,000 MXN - Monto máximo: $15,000 MXN
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                      placeholder="1000"
                      min={1000}
                      max={15000}
                      step={100}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
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
                      : "Número de WhatsApp"
                    }
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={form.watch("contactMethod") === "email" ? "email" : "tel"}
                      placeholder={
                        form.watch("contactMethod") === "email" 
                          ? "tu@email.com" 
                          : "5512345678"
                      }
                      {...field}
                    />
                  </FormControl>
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
              Solicitar Recarga
            </Button>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">¿Cómo funciona?</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Envía tu solicitud con el monto deseado</li>
                <li>2. Te contactaremos con los datos bancarios y número de referencia</li>
                <li>3. Realiza tu transferencia bancaria</li>
                <li>4. Envíanos el comprobante de pago</li>
                <li>5. Tu saldo será acreditado en 12-24 horas</li>
              </ol>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}