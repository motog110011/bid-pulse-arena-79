import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  CreditCard, 
  Search, 
  Gavel, 
  Trophy,
  Clock,
  Shield,
  CheckCircle 
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Regístrate gratis",
      description: "Crea tu cuenta con tu nombre, correo electrónico y contraseña. Solo toma un minuto.",
      icon: UserPlus,
      color: "bg-blue-500"
    },
    {
      id: "02", 
      title: "Agrega saldo a tu cuenta",
      description: "Para ofertar necesitas tener saldo disponible. Haz una transferencia SPEI desde tu banco al número de cuenta que te proporcionamos. Validamos tu depósito manualmente en un plazo de 12 a 24 horas y actualizamos tu saldo en el sistema.",
      icon: CreditCard,
      color: "bg-green-500"
    },
    {
      id: "03",
      title: "Explora y elige tu subasta favorita", 
      description: "Encuentra productos únicos y experiencias especiales. Cada subasta muestra el monto actual, fecha y hora de cierre.",
      icon: Search,
      color: "bg-purple-500"
    },
    {
      id: "04",
      title: "Haz tu oferta",
      description: "Si tienes saldo suficiente, puedes ofertar al instante. Las ofertas son vinculantes: si ganas, el monto se descuenta automáticamente de tu cuenta.",
      icon: Gavel,
      color: "bg-orange-500"
    },
    {
      id: "05",
      title: "Gana y recibe tu producto o experiencia",
      description: "Al cerrar la subasta, si tu oferta es la más alta, ¡ganaste! Te contactaremos con los detalles de entrega o envío.",
      icon: Trophy,
      color: "bg-yellow-500"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Todos los productos son verificados y auténticos"
    },
    {
      icon: Clock,
      title: "Subastas 24/7", 
      description: "Nuevas oportunidades disponibles todo el día"
    },
    {
      icon: CheckCircle,
      title: "Garantía Total",
      description: "Satisfacción garantizada o devolvemos tu dinero"
    }
  ];

  return (
    <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-gradient-gold text-black font-medium text-sm px-4 py-2">
            Proceso Simple
          </Badge>
          <h2 className="text-4xl font-bold">
            ¿Cómo <span className="text-primary">Funciona?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Participa en nuestras subastas de productos decomisados en 5 sencillos pasos
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Step Number and Icon */}
                <div className="flex-shrink-0 relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                    {step.id}
                  </div>
                  <div className="absolute -inset-2 rounded-full bg-gradient-primary/20 animate-pulse"></div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <step.icon className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-lg leading-relaxed max-w-2xl bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border/50">
                    {step.description}
                  </p>
                </div>

                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-10 top-20 w-px h-16 bg-gradient-to-b from-primary to-transparent"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 pt-16">
          {features.map((feature, index) => (
            <Card key={index} className="glass-card text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold">¿Listo para comenzar?</h3>
          <p className="text-muted-foreground">Únete a miles de usuarios que ya están ahorrando</p>
          <Button size="lg" className="bg-gradient-primary hover:shadow-glow text-lg px-8">
            <UserPlus className="mr-2 h-5 w-5" />
            Registrarse Gratis
          </Button>
        </div>
      </div>
    </section>
  );
}