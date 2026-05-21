import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header bar */}
      <div className="bg-gray-900 py-4 px-6">
        <Link to="/" className="flex items-center space-x-2 w-fit">
          <img src="/Duerme_cool_logo.jpeg" alt="Duerme.cool" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones de Uso</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: 21 de mayo de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar el sitio web <strong>https://duerme.cool</strong> y sus servicios
              asociados, aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo con
              alguna parte de estos términos, te pedimos que no utilices nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descripción del servicio</h2>
            <p>
              Duerme.cool es una tienda en línea que comercializa productos de regulación térmica para
              camas, incluyendo cobertores y accesorios para un sueño más confortable. Operamos en México
              y realizamos envíos a todo el territorio nacional.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Elegibilidad</h2>
            <p>
              Para realizar compras en nuestro sitio debes tener al menos 18 años de edad o contar con
              autorización de un tutor legal. Al realizar un pedido, confirmas que cumples con este requisito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cuentas de usuario</h2>
            <p>
              Puedes crear una cuenta para gestionar tus pedidos y preferencias. Eres responsable de
              mantener la confidencialidad de tus credenciales y de todas las actividades que ocurran
              bajo tu cuenta. Notifícanos inmediatamente ante cualquier uso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Productos y precios</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Los precios están expresados en pesos mexicanos (MXN) e incluyen IVA cuando aplique.</li>
              <li>Nos reservamos el derecho de modificar precios en cualquier momento sin previo aviso.</li>
              <li>Las imágenes de productos son ilustrativas; el producto real puede tener ligeras variaciones.</li>
              <li>La disponibilidad de stock puede cambiar sin previo aviso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Proceso de compra y pago</h2>
            <p>Aceptamos los siguientes métodos de pago:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Tarjeta de crédito/débito</strong> (Visa, Mastercard) procesado por Stripe.</li>
              <li><strong>PayPal</strong> para pagos en línea seguros.</li>
              <li><strong>OXXO Pay</strong> para pago en efectivo en tiendas OXXO de México.</li>
            </ul>
            <p className="mt-3">
              Al confirmar tu pedido, recibirás un correo de confirmación. El contrato de compraventa se
              perfecciona al momento de procesar el pago exitosamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Envíos y entrega</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Enviamos a toda la República Mexicana.</li>
              <li>Los tiempos estimados de entrega son de 3 a 7 días hábiles.</li>
              <li>Los costos de envío se calculan al momento del checkout.</li>
              <li>No nos hacemos responsables de retrasos causados por la paquetería o factores externos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Devoluciones y garantía</h2>
            <p>
              Ofrecemos garantía de satisfacción en nuestros productos. Si no estás satisfecho con tu
              compra, contáctanos dentro de los 30 días naturales posteriores a la recepción del producto:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>El producto debe estar en su estado original, sin usar y con empaque.</li>
              <li>Los gastos de devolución corren a cargo del cliente, salvo en caso de defecto de fábrica.</li>
              <li>Los reembolsos se procesan en un plazo de 5 a 10 días hábiles.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Propiedad intelectual</h2>
            <p>
              Todo el contenido de este sitio web —incluyendo textos, imágenes, logotipos, diseños y
              software— es propiedad de Duerme.cool o de sus licenciantes y está protegido por las leyes
              de propiedad intelectual aplicables. No está permitida su reproducción sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitación de responsabilidad</h2>
            <p>
              Duerme.cool no será responsable por daños indirectos, incidentales o consecuentes derivados
              del uso o la imposibilidad de uso de nuestros productos o servicios. Nuestra responsabilidad
              total no excederá el monto pagado por el producto en cuestión.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Ley aplicable y jurisdicción</h2>
            <p>
              Estos Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos.
              Cualquier controversia derivada de estos términos se someterá a la jurisdicción de los
              tribunales competentes de la Ciudad de México, renunciando expresamente a cualquier
              otro fuero que pudiere corresponder.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios
              entrarán en vigor al momento de su publicación en este sitio. El uso continuado de nuestros
              servicios después de dicha publicación constituye tu aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contacto</h2>
            <p>Para cualquier duda sobre estos Términos y Condiciones:</p>
            <div className="mt-3 bg-gray-50 rounded-lg p-4 text-sm">
              <p><strong>Duerme.cool</strong></p>
              <p>Ciudad de México, México</p>
              <p>Correo: <a href="mailto:contacto@duerme.cool" className="text-blue-600 hover:underline">contacto@duerme.cool</a></p>
              <p>Teléfono: +52 221 406 6588</p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500 flex gap-4">
          <Link to="/" className="hover:text-gray-700">← Volver al inicio</Link>
          <Link to="/privacidad" className="hover:text-gray-700">Política de Privacidad</Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
