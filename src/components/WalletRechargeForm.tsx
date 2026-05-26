import { useState, useEffect, useRef } from "react";
import { Loader2, CreditCard, Mail, Smartphone, Copy, CheckCircle, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface BankDetails {
  bank_name: string;
  account_holder: string;
  account_number: string;
  clabe: string;
  oxxo_card_number?: string;
  reference_instructions?: string;
}

const AMOUNT_PRESETS = [1000, 3000, 5000, 10000, 15000];
const CONTACT_OPTIONS = [
  { value: "email",    label: "Correo electrónico", icon: Mail },
  { value: "whatsapp", label: "WhatsApp",            icon: Smartphone },
  { value: "phone",    label: "Teléfono",            icon: Smartphone },
] as const;

function generate5DigitRef(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-2 p-1 rounded hover:bg-muted transition-colors"
      aria-label="Copiar"
    >
      {copied
        ? <CheckCircle className="h-4 w-4 text-green-600" />
        : <Copy className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

export function WalletRechargeForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 state
  const [amount, setAmount]               = useState<number>(1000);
  const [customAmount, setCustomAmount]   = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "whatsapp" | "phone">("email");
  const [contactValue, setContactValue]   = useState(user?.email ?? "");

  // Step 2 state
  const [step, setStep]             = useState<1 | 2>(1);
  const [reference, setReference]   = useState("");
  const [proofFile, setProofFile]   = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bank details from admin settings
  const [bankDetails, setBankDetails]           = useState<BankDetails | null>(null);
  const [loadingBank, setLoadingBank]           = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "bank_details")
        .single();
      if (data?.setting_value) setBankDetails(data.setting_value as BankDetails);
      setLoadingBank(false);
    })();
  }, []);

  // ── Step 1: generate reference and advance ────────────────────────────────
  function handleContinue() {
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount < 1000 || finalAmount > 15000) {
      toast({ title: "Monto inválido", description: "Ingresa un monto entre $1,000 y $15,000.", variant: "destructive" });
      return;
    }
    if (!contactValue.trim()) {
      toast({ title: "Falta tu contacto", description: "Ingresa tu correo o número.", variant: "destructive" });
      return;
    }
    setReference(generate5DigitRef());
    setStep(2);
  }

  // ── Step 2: upload proof + save request ──────────────────────────────────
  async function handleSubmit() {
    if (!user) return;
    setIsSubmitting(true);

    const finalAmount = customAmount ? Number(customAmount) : amount;
    let proofUrl: string | null = null;

    // Upload comprobante if provided
    if (proofFile) {
      const ext  = proofFile.name.split(".").pop();
      const path = `${user.id}/${reference}.${ext}`;

      const { error: uploadError } = await (supabase as any).storage
        .from("comprobantes")
        .upload(path, proofFile, { upsert: true });

      if (uploadError) {
        // Bucket may not exist yet — proceed without proof and warn admin
        console.warn("Storage upload failed:", uploadError.message);
        toast({
          title: "Comprobante no adjuntado",
          description: "No se pudo subir el archivo. La solicitud se enviará sin comprobante.",
          variant: "destructive",
        });
      } else {
        proofUrl = path;
      }
    }

    // Save recharge request
    const { error } = await (supabase as any)
      .from("wallet_recharge_requests")
      .insert({
        user_id:           user.id,
        amount:            finalAmount,
        contact_method:    contactMethod,
        contact_value:     contactValue,
        reference_number:  reference,
        payment_proof_url: proofUrl,
        status:            "pending",
      });

    if (error) {
      toast({ title: "Error al enviar", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    // Notify admin
    await (supabase as any).rpc("create_admin_notification", {
      notification_type:    "recharge_request",
      notification_title:   "Nueva solicitud de recarga",
      notification_message: `Ref. ${reference} — $${finalAmount.toLocaleString("es-MX")}`,
      notification_data:    { amount: finalAmount, reference, user_id: user.id },
      triggering_user_id:   user.id,
    }).catch(() => {/* non-critical */});

    toast({
      title: "Solicitud enviada",
      description: `Referencia ${reference}. Te avisaremos en 12–24 h cuando se acredite tu saldo.`,
    });

    // Reset
    setStep(1);
    setReference("");
    setProofFile(null);
    setCustomAmount("");
    setContactValue(user?.email ?? "");
    setIsSubmitting(false);
  }

  if (loadingBank) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gobierno-guinda" />
      </div>
    );
  }

  // ── STEP 1 ────────────────────────────────────────────────────────────────
  if (step === 1) {
    const finalAmount = customAmount ? Number(customAmount) : amount;

    return (
      <div className="space-y-6">
        {/* Monto */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Monto a recargar (MXN)</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => { setAmount(preset); setCustomAmount(""); }}
                className={`py-2.5 px-1 rounded border text-sm font-semibold transition-colors ${
                  amount === preset && !customAmount
                    ? "bg-gobierno-guinda text-white border-gobierno-guinda"
                    : "bg-white border-border text-foreground hover:border-gobierno-guinda hover:text-gobierno-guinda"
                }`}
              >
                ${preset.toLocaleString("es-MX")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Otro monto..."
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
              min={1000}
              max={15000}
              step={100}
              className="text-base h-12 bg-muted border-border"
            />
            <span className="text-sm text-muted-foreground shrink-0">MXN</span>
          </div>
          <p className="text-xs text-muted-foreground">Mínimo $1,000 · Máximo $15,000</p>
        </div>

        {/* Método de contacto */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">¿Cómo te avisamos cuando se acredite?</Label>
          <RadioGroup
            value={contactMethod}
            onValueChange={(v) => setContactMethod(v as typeof contactMethod)}
            className="space-y-2"
          >
            {CONTACT_OPTIONS.map(({ value, label, icon: Icon }) => (
              <div key={value} className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                contactMethod === value ? "border-gobierno-guinda bg-gobierno-claro" : "border-border hover:border-gobierno-guinda/50"
              }`}>
                <RadioGroupItem value={value} id={`cm-${value}`} />
                <label htmlFor={`cm-${value}`} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <Icon className="h-4 w-4 text-gobierno-gris" aria-hidden="true" />
                  {label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Valor de contacto */}
        <div className="space-y-2">
          <Label htmlFor="contact-value" className="text-sm font-semibold">
            {contactMethod === "email" ? "Tu correo electrónico" : "Tu número de teléfono"}
          </Label>
          <Input
            id="contact-value"
            type={contactMethod === "email" ? "email" : "tel"}
            inputMode={contactMethod === "email" ? "email" : "tel"}
            autoComplete={contactMethod === "email" ? "email" : "tel"}
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            placeholder={contactMethod === "email" ? "tu@correo.com" : "+52 55 1234 5678"}
            className="text-base h-12 bg-muted border-border"
          />
        </div>

        <Button
          onClick={handleContinue}
          className="w-full h-12 text-base bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white font-semibold"
        >
          <CreditCard className="mr-2 h-5 w-5" aria-hidden="true" />
          Continuar — Ver datos de depósito
        </Button>
      </div>
    );
  }

  // ── STEP 2 ────────────────────────────────────────────────────────────────
  const finalAmount = customAmount ? Number(customAmount) : amount;

  return (
    <div className="space-y-6">
      {/* Regresa */}
      <button
        type="button"
        onClick={() => setStep(1)}
        className="flex items-center gap-1.5 text-sm text-gobierno-gris hover:text-gobierno-guinda transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Cambiar monto o contacto
      </button>

      {/* Número de referencia — prominente */}
      <div className="text-center py-5 px-4 rounded-lg border-2 border-gobierno-guinda bg-gobierno-claro">
        <p className="text-xs font-semibold uppercase tracking-widest text-gobierno-gris mb-1">
          Tu número de referencia
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl font-extrabold tracking-widest text-gobierno-guinda">
            {reference}
          </span>
          <CopyButton text={reference} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Usa este número como referencia al realizar tu depósito
        </p>
      </div>

      {/* Resumen */}
      <div className="flex justify-between items-center px-1">
        <span className="text-sm text-muted-foreground">Monto a depositar</span>
        <span className="text-xl font-bold text-foreground">
          ${finalAmount.toLocaleString("es-MX")} <span className="text-sm font-normal">MXN</span>
        </span>
      </div>

      {/* Datos bancarios */}
      {bankDetails ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-gobierno-guinda px-4 py-2.5">
            <p className="text-xs font-bold uppercase tracking-widest text-white">Datos para depósito</p>
          </div>
          <div className="divide-y divide-border text-sm">
            {[
              { label: "Banco",    value: bankDetails.bank_name },
              { label: "Titular",  value: bankDetails.account_holder },
              { label: "Cuenta",   value: bankDetails.account_number },
              { label: "CLABE",    value: bankDetails.clabe },
              ...(bankDetails.oxxo_card_number
                ? [{ label: "Tarjeta OXXO", value: bankDetails.oxxo_card_number }]
                : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground font-medium w-28 shrink-0">{label}</span>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-semibold text-foreground truncate">{value}</span>
                  <CopyButton text={value} />
                </div>
              </div>
            ))}
          </div>
          {bankDetails.reference_instructions && (
            <div className="px-4 py-3 bg-amber-50 border-t border-amber-200">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">Importante: </span>
                {bankDetails.reference_instructions}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border px-4 py-6 text-center text-sm text-muted-foreground">
          El administrador aún no ha configurado los datos bancarios.
          Contacta a soporte en{" "}
          <a href="mailto:soporte@subastasgap.com.mx" className="text-gobierno-guinda">
            soporte@subastasgap.com.mx
          </a>
        </div>
      )}

      {/* Subir comprobante */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Comprobante de depósito{" "}
          <span className="text-muted-foreground font-normal">(opcional pero recomendado)</span>
        </Label>
        <div
          className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 cursor-pointer transition-colors ${
            proofFile
              ? "border-green-500 bg-green-50"
              : "border-border hover:border-gobierno-guinda hover:bg-gobierno-claro"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {proofFile ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-600" />
              <p className="text-sm font-medium text-green-700">{proofFile.name}</p>
              <p className="text-xs text-green-600">
                {(proofFile.size / 1024).toFixed(0)} KB — haz clic para cambiar
              </p>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">Subir comprobante</p>
              <p className="text-xs text-muted-foreground">JPG, PNG o PDF · máx. 5 MB</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size > 5 * 1024 * 1024) {
                toast({ title: "Archivo muy grande", description: "Máximo 5 MB.", variant: "destructive" });
                return;
              }
              if (f) setProofFile(f);
            }}
          />
        </div>
      </div>

      {/* Instrucciones */}
      <ol className="text-xs text-muted-foreground space-y-1 list-none pl-0">
        {[
          "Realiza el depósito con los datos de arriba.",
          `Usa la referencia ${reference} al hacer la transferencia.`,
          "Sube tu comprobante (opcional pero agiliza el proceso).",
          "Recibirás confirmación en 12–24 horas por tu medio de contacto.",
        ].map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold text-gobierno-guinda shrink-0">{i + 1}.</span>
            {step}
          </li>
        ))}
      </ol>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full h-12 text-base bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white font-semibold"
      >
        {isSubmitting
          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          : <CheckCircle className="mr-2 h-5 w-5" aria-hidden="true" />}
        {isSubmitting ? "Enviando solicitud..." : "Ya deposité — Enviar solicitud"}
      </Button>
    </div>
  );
}
