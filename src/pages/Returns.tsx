import React from 'react';
import { Link } from 'react-router-dom';

const Returns: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header bar */}
      <div className="bg-gray-900 py-4 px-6">
        <Link to="/" className="flex items-center space-x-2 w-fit">
          <img src="/Duerme_cool_logo.jpeg" alt="Duerme.cool" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Envíos y Devoluciones</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: 6 de junio de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Envíos</h2>
            <p>
              Realizamos envíos a todo México. Procesamos y despachamos los pedidos en un plazo de
              <strong> 1 a 3 días hábiles</strong> después de confirmado el pago. El tiempo estimado de
              entrega es de <strong>3 a 10 días hábiles</strong>, según tu ubicación. Una vez enviado tu
              pedido, recibirás un número de guía para dar seguimiento a tu paquete.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Devoluciones y reembolsos</h2>
            <p>
              <strong>Sí aceptamos devoluciones y reembolsos.</strong> Si ya recibiste tu producto y deseas
              devolverlo, cuentas con un plazo de <strong>30 días naturales a partir de la fecha de
              entrega</strong> para solicitar la devolución. Este plazo comienza únicamente cuando el
              cliente recibe el artículo, por lo que nunca vence antes de que el paquete haya sido entregado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cómo iniciar una devolución</h2>
            <p>
              Para iniciar una devolución, escríbenos a{' '}
              <a href="mailto:contacto@duerme.cool" className="text-blue-600 hover:underline">contacto@duerme.cool</a>{' '}
              indicando tu número de pedido y el motivo de la devolución. Te confirmaremos la aprobación y
              te proporcionaremos la dirección a la que debes enviar el producto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Costo del envío de devolución</h2>
            <p>
              El <strong>costo del envío de devolución corre por cuenta del cliente</strong>. El producto
              debe enviarse a la dirección que te indicaremos al aprobar tu solicitud. Te recomendamos
              utilizar un servicio con número de guía y, si es posible, asegurar el paquete, ya que el
              artículo viaja bajo tu responsabilidad hasta que lo recibamos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Condición de los artículos</h2>
            <p>
              Debido a que se trata de un producto de alto valor compuesto por varias piezas, es
              indispensable que <strong>devuelvas el paquete completo</strong>: la unidad de control, el
              cover y todos los accesorios incluidos, en buen estado y, de ser posible, en su empaque
              original. Verificaremos que todas las piezas regresen completas antes de emitir el reembolso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Reembolso</h2>
            <p>
              Una vez que recibamos el producto y confirmemos que se encuentra completo y en buen estado,
              emitiremos el <strong>reembolso del 100%</strong> del importe pagado por el producto. El
              reembolso se realizará al mismo método de pago utilizado en la compra, dentro de un plazo de
              <strong> 5 a 10 días hábiles</strong> posteriores a la verificación. Recibirás una
              confirmación por correo cuando el reembolso haya sido procesado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Productos dañados o incorrectos</h2>
            <p>
              Si tu producto llega dañado o recibes un artículo incorrecto, contáctanos dentro de los
              primeros 7 días posteriores a la entrega en{' '}
              <a href="mailto:contacto@duerme.cool" className="text-blue-600 hover:underline">contacto@duerme.cool</a>{' '}
              y resolveremos el caso sin costo de envío para ti.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contacto</h2>
            <p>Para cualquier duda sobre envíos o devoluciones:</p>
            <div className="mt-3 bg-gray-50 rounded-lg p-4 text-sm">
              <p><strong>Duerme.cool</strong></p>
              <p>Ciudad de México, México</p>
              <p>Correo: <a href="mailto:contacto@duerme.cool" className="text-blue-600 hover:underline">contacto@duerme.cool</a></p>
              <p>Teléfono: +52 221 406 6588</p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500 flex gap-4 flex-wrap">
          <Link to="/" className="hover:text-gray-700">← Volver al inicio</Link>
          <Link to="/terminos" className="hover:text-gray-700">Términos y Condiciones</Link>
          <Link to="/privacidad" className="hover:text-gray-700">Política de Privacidad</Link>
        </div>
      </div>
    </div>
  );
};

export default Returns;
