import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Política de Reembolsos</h1>
            <p className="text-muted-foreground">Última actualización: Julio 2025</p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              En Subastas GAP S. de R.L. de C.V., trabajamos para garantizar una experiencia segura y transparente en cada transacción. Esta política establece los lineamientos para solicitudes de reembolso.
            </p>

            <div className="space-y-6">
              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">1. Recargas de saldo</h2>
                <p className="text-muted-foreground">
                  Las recargas realizadas a través del panel de billetera son no reembolsables de forma automática, ya que el saldo puede ser utilizado indefinidamente en futuras subastas.
                </p>
              </section>

              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">2. Excepciones para reembolsos</h2>
                <p className="text-muted-foreground mb-3">Se podrá solicitar un reembolso bajo las siguientes condiciones:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>No se ha utilizado el saldo en ninguna oferta.</li>
                  <li>El saldo fue recargado en los últimos 15 días naturales.</li>
                  <li>El usuario no tiene subastas ganadas pendientes de pago o envío.</li>
                </ul>
                
                <p className="text-muted-foreground mb-3">Para solicitar un reembolso, escribe a <a href="mailto:reembolsos@subastasgap.mx" className="text-primary hover:underline">reembolsos@subastasgap.mx</a> con:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Nombre completo</li>
                  <li>Correo registrado</li>
                  <li>Comprobante de transferencia</li>
                  <li>Monto a reembolsar</li>
                  <li>Clave interbancaria (CLABE) para el depósito</li>
                </ul>
                
                <p className="text-muted-foreground">
                  Los reembolsos, si proceden, se realizarán en un plazo de 5 a 10 días hábiles.
                </p>
              </section>

              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">3. Ofertas ganadoras</h2>
                <p className="text-muted-foreground">
                  Las ofertas ganadas son vinculantes. No se otorgan reembolsos por subastas ganadas si el usuario decide no concretar la compra.
                </p>
              </section>

              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">4. Productos no entregados</h2>
                <p className="text-muted-foreground mb-3">En caso de que no podamos entregar un producto ganado por causas atribuibles a la empresa (agotamiento, error logístico), se ofrecerá:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Un producto sustituto del mismo valor, o</li>
                  <li>Reembolso completo del monto ofertado.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;