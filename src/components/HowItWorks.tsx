import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CreditCard, Search, Gavel, Trophy, Clock, Shield, CheckCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Regístrate gratis",
      description: "Crea tu cuenta con tu nombre, correo electrónico y contraseña. Solo toma un minuto.",
      icon: UserPlus,
    },
    {
      id: "02",
      title: "Agrega saldo a tu cuenta",
      description: "Para ofertar necesitas tener saldo disponible. Haz una transferencia SPEI desde tu banco al número de cuenta que te proporcionamos. Validamos tu depósito manualmente en un plazo de 12 a 24 horas.",
      icon: CreditCard,
    },
    {
      id: "03",
      title: "Explora y elige tu subasta",
      description: "Encuentra productos únicos decomisados en aeropuertos. Cada subasta muestra el monto actual y fecha de cierre.",
      icon: Search,
    },
    {
      id: "04",
      title: "Haz tu oferta",
      description: "Si tienes saldo suficiente, puedes ofertar al instante. Las ofertas son vinculantes: si ganas, el monto se descuenta automáticamente.",
      icon: Gavel,
    },
    {
      id: "05",
      title: "Gana y recibe tu producto",
      description: "Al cerrar la subasta, si tu oferta es la más alta, ganaste. Te contactaremos con los detalles de entrega o envío.",
      icon: Trophy,
    },
  ];

  const features = [
    { icon: Shield,       title: "100% Verificado",  description: "Todos los productos son verificados y auténticos" },
    { icon: Clock,        title: "Subastas 24/7",     description: "Nuevas oportunidades disponibles todo el día" },
    { icon: CheckCircle,  title: "Garantía Total",    description: "Satisfacción garantizada o devolvemos tu dinero" },
  ];

  return (
    <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-12">

        {/* Encabezado */}
        <div className="text-center space-y-3">
          {/* UX: badge sin glassmorphism — texto limpio sobre fondo claro */}
          <span className="inline-block px-4 py-1.5 rounded-full border border-gobierno-dorado text-gobierno-guinda text-sm font-semibold">
            Proceso Simple
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            ¿Cómo <span className="text-gobierno-guinda">Funciona?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Participa en nuestras subastas de productos decomisados en 5 sencillos pasos
          </p>
        </div>

        {/* Pasos */}
        {/* UX: diseño mobile-first — columna única en mobile, fila en lg */}
        <ol className="space-y-8">
          {steps.map((step, index) => (
            <li key={step.id} className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Conector vertical entre pasos — solo desktop */}
              {index < steps.length - 1 && (
                <div
                  className="hidden sm:block absolute left-8 top-16 w-0.5 h-8 bg-gobierno-dorado/40"
                  aria-hidden="true"
                />
              )}

              {/* Número */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gobierno-guinda flex items-center justify-center text-white font-bold text-lg">
                {step.id}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <step.icon className="h-5 w-5 text-gobierno-guinda flex-shrink-0" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                </div>
                {/* UX: fondo blanco limpio sin glassmorphism — legible en todos los dispositivos */}
                <p className="text-base leading-relaxed text-muted-foreground max-w-2xl">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Características */}
        {/* UX: grid 1-col en mobile, 3-col en md */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white border border-border text-center hover:border-gobierno-dorado transition-colors">
              <CardHeader className="pb-2">
                {/* UX: área de icono con color guinda — sin gradiente */}
                <div className="w-12 h-12 rounded-lg bg-gobierno-guinda flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-4">
          <h3 className="text-2xl font-bold">¿Listo para comenzar?</h3>
          <p className="text-muted-foreground">Únete a miles de usuarios que ya están ahorrando</p>
          {/* UX: h-12 = 48px mínimo para tap target en mobile */}
          <Button
            size="lg"
            className="h-12 px-8 text-base bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white"
            onClick={() => document.getElementById("auction-grid")?.scrollIntoView({ behavior: "smooth" })}
          >
            <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
            Comenzar Ahora
          </Button>
        </div>
      </div>
    </section>
  );
}
