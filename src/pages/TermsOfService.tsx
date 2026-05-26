import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none space-y-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold">Términos y Condiciones de Uso</h1>
            <p className="text-muted-foreground">Última actualización: 29 de julio de 2025</p>
          </div>

          <div className="space-y-8">
            <p>
              Bienvenido al sitio web de Subastas GAP S. de R.L. de C.V., con domicilio fiscal en Vía Atlixcáyotl No. 3248, Torre JV II, Piso 6, Col. Reserva Territorial Atlixcáyotl, C.P. 72830, San Andrés Cholula, Puebla, México. Al acceder a este sitio web y utilizar nuestros servicios, usted acepta cumplir los siguientes términos y condiciones.
            </p>

            <section>
              <h2 className="text-2xl font-bold mb-4">1. Aceptación de los Términos</h2>
              <p>
                Al registrarse, ofertar o navegar en nuestro sitio web, usted declara que ha leído, entendido y aceptado estos Términos y Condiciones. En caso de no estar de acuerdo, debe abstenerse de utilizar el sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Registro y Cuentas de Usuario</h2>
              <p className="mb-4">
                Para participar en subastas, debe crear una cuenta proporcionando información veraz y actualizada. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.
              </p>
              <p>
                Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos o sean usadas para fines indebidos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Mecanismo de Subasta</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Cada producto tiene un tiempo límite para recibir ofertas.</li>
                <li>Las ofertas son vinculantes: si gana la subasta, se compromete a pagar el monto final.</li>
                <li>El sistema puede realizar ofertas automáticas desde cuentas validadas, según se especifique en las reglas de cada subasta.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Pagos</h2>
              <p className="mb-4">
                Actualmente, los pagos se realizan vía transferencia SPEI a la cuenta bancaria de Subastas GAP. Los datos para el pago se mostrarán una vez ganada la subasta.
              </p>
              <p className="font-semibold">
                Importante: La validación de pagos puede tomar entre 24 y 48 horas hábiles. Una vez confirmado, se autoriza el envío o recolección del producto.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Fondos en la Cuenta</h2>
              <p>
                Los usuarios pueden depositar fondos anticipadamente en su cuenta para realizar ofertas. Solo se pueden realizar ofertas si se cuenta con saldo suficiente. El saldo no es transferible ni convertible a efectivo, salvo en caso de reembolsos autorizados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Envíos y Entregas</h2>
              <p>
                Los tiempos y costos de envío varían según el producto y el destino. En ciertos casos, podrá acordarse recolección física. Subastas GAP no se responsabiliza por retrasos imputables a terceros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Reembolsos y Cancelaciones</h2>
              <p className="mb-4">Los reembolsos se otorgan únicamente en los siguientes casos:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Producto no entregado en un plazo superior a 30 días hábiles.</li>
                <li>Pago realizado por error no vinculado a una subasta.</li>
                <li>Fallas técnicas del sistema que afecten el resultado de la subasta.</li>
              </ul>
              <p>El proceso de reembolso puede tomar hasta 10 días hábiles.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Propiedad Intelectual</h2>
              <p>
                Todo el contenido del sitio (textos, imágenes, logos, software) pertenece a Subastas GAP S. de R.L. de C.V. y está protegido por derechos de autor. Queda prohibida su reproducción sin autorización.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Modificaciones</h2>
              <p>
                Subastas GAP se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página y surtirán efecto inmediato. Es responsabilidad del usuario revisarlos periódicamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Jurisdicción</h2>
              <p>
                Estos Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes en San Andrés Cholula, Puebla, México.
              </p>
            </section>

            <section className="bg-muted/30 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Contacto Legal:</h2>
              <div className="space-y-2">
                <p className="font-semibold">Subastas GAP S. de R.L. de C.V.</p>
                <p>Vía Atlixcáyotl No. 3248, Torre JV II, Piso 6</p>
                <p>Col. Reserva Territorial Atlixcáyotl, C.P. 72830</p>
                <p>San Andrés Cholula, Puebla</p>
                <p>
                  <a 
                    href="mailto:contacto@subastasgap.com.mx" 
                    className="text-primary hover:underline"
                  >
                    contacto@subastasgap.com.mx
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;