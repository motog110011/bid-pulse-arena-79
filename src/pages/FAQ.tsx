import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Preguntas Frecuentes (FAQ)</h1>
            <p className="text-muted-foreground">Encuentra respuestas a las preguntas más comunes</p>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">¿Cómo recargo saldo en mi cuenta?</h2>
              <div className="text-muted-foreground space-y-2">
                <p>Para recargar tu billetera digital, sigue estos pasos:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Ingresa a tu panel y ve a la sección "Recargar Billetera".</li>
                  <li>Completa el formulario para generar un código de referencia único, asociado a tu cuenta y transacción.</li>
                  <li>Realiza una transferencia SPEI por el monto deseado (mínimo $1,000 MXN – máximo $15,000 MXN).</li>
                  <li>Una vez realizada la transferencia, tu saldo será validado por nuestro equipo.</li>
                  <li>Opcional: Puedes enviar el comprobante al correo saldo@subastasgap.mx para agilizar el proceso.</li>
                </ol>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">¿Cuánto tiempo tarda en validarse mi saldo?</h2>
              <p className="text-muted-foreground">El proceso puede tomar entre 1 y 24 horas en días hábiles. Si tu comprobante es enviado al correo indicado, la validación suele ser más rápida.</p>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">¿Puedo usar mi saldo en cualquier subasta?</h2>
              <p className="text-muted-foreground">Sí. Tu saldo queda disponible una vez validado y puedes utilizarlo para ofertar en cualquier subasta activa.</p>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">¿Las ofertas que realizo son cancelables?</h2>
              <p className="text-muted-foreground">No. Todas las ofertas son vinculantes y definitivas. Al ofertar, te comprometes a pagar el monto ofrecido en caso de resultar ganador.</p>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">¿Qué pasa si gano una subasta?</h2>
              <div className="text-muted-foreground space-y-2">
                <p>Recibirás una notificación automática y tu compra será procesada. Luego:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Nuestro equipo verificará que el saldo cubre el monto ofertado.</li>
                  <li>Se preparará tu producto para envío.</li>
                  <li>Será enviado a la dirección de envío registrada en tu cuenta.</li>
                </ol>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">¿Puedo modificar mi dirección de envío?</h2>
              <p className="text-muted-foreground">Sí, desde tu perfil puedes actualizar tu dirección en cualquier momento. Te recomendamos verificarla antes de participar en una subasta, ya que una vez ganada, el producto se envía a esa dirección.</p>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">¿Qué pasa si no tengo suficiente saldo para cubrir una oferta ganadora?</h2>
              <p className="text-muted-foreground">No podrás participar en la subasta sin saldo suficiente. El sistema solo permite ofertar con saldo previamente validado, lo cual evita incumplimientos.</p>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">¿Puedo pedir un reembolso de mi saldo?</h2>
              <p className="text-muted-foreground">Tu saldo puede ser usado en futuras subastas sin límite de tiempo. Para solicitar un reembolso, consulta nuestra Política de Reembolsos para más detalles.</p>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">¿Puedo contactar a alguien si tengo dudas?</h2>
              <p className="text-muted-foreground">Sí. Puedes escribirnos a soporte@subastasgap.mx o a través de WhatsApp si elegiste ese método de contacto en tu cuenta.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;