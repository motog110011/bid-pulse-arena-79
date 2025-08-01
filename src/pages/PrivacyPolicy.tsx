import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Política de Privacidad</h1>
            <p className="text-muted-foreground">Última actualización: Julio 2025</p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              En Subastas GAP S. de R.L. de C.V., con domicilio fiscal en Blvd. Atlixcayotl 2301, Torre JV II, Piso 14, Angelópolis, Puebla, México, valoramos y protegemos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos tu información personal.
            </p>

            <div className="space-y-6">
              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">1. Información que recopilamos</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Datos de contacto:</strong> nombre, correo electrónico, teléfono.</li>
                  <li><strong>Datos de envío:</strong> dirección completa.</li>
                  <li><strong>Información de transacciones:</strong> historial de ofertas, pagos y recargas.</li>
                  <li><strong>Información técnica:</strong> IP, navegador, tipo de dispositivo y cookies.</li>
                </ul>
              </section>

              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">2. Uso de la información</h2>
                <p className="text-muted-foreground mb-3">Utilizamos tus datos para:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Validar tu identidad y facilitar tu participación en subastas.</li>
                  <li>Gestionar recargas de saldo y transacciones.</li>
                  <li>Enviar comunicaciones relevantes sobre tu cuenta o subastas ganadas.</li>
                  <li>Mejorar nuestros servicios mediante análisis internos.</li>
                </ul>
              </section>

              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">3. Protección de datos</h2>
                <p className="text-muted-foreground">
                  Tu información está protegida con protocolos de seguridad y cifrado. No vendemos, rentamos ni compartimos tus datos con terceros sin tu consentimiento, salvo requerimiento legal.
                </p>
              </section>

              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">4. Derechos del usuario</h2>
                <p className="text-muted-foreground mb-3">Puedes:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Acceder, corregir o eliminar tus datos personales.</li>
                  <li>Solicitar la cancelación de tu cuenta.</li>
                  <li>Limitar el uso de tu información enviando un correo a <a href="mailto:privacidad@subastasgap.mx" className="text-primary hover:underline">privacidad@subastasgap.mx</a>.</li>
                </ul>
              </section>

              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">5. Cambios en esta política</h2>
                <p className="text-muted-foreground">
                  Nos reservamos el derecho de actualizar esta política. Te notificaremos sobre cambios importantes a través de la plataforma o correo electrónico.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;