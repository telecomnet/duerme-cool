import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header bar */}
      <div className="bg-gray-900 py-4 px-6">
        <Link to="/" className="flex items-center space-x-2 w-fit">
          <img src="/Duerme_cool_logo.jpeg" alt="Duerme.cool" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: 21 de mayo de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Información general</h2>
            <p>
              Duerme.cool ("nosotros", "nuestro") opera el sitio web <strong>https://duerme.cool</strong> y
              sus servicios relacionados. Esta Política de Privacidad describe cómo recopilamos, usamos y
              protegemos tu información personal cuando utilizas nuestro sitio web, tienda en línea y
              servicios de atención al cliente.
            </p>
            <p className="mt-3">
              Al usar nuestros servicios, aceptas las prácticas descritas en esta política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Información que recopilamos</h2>
            <p>Recopilamos la siguiente información:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Datos de contacto:</strong> nombre, correo electrónico, número de teléfono.</li>
              <li><strong>Datos de pedido:</strong> dirección de envío, productos adquiridos, historial de compras.</li>
              <li><strong>Datos de pago:</strong> procesados de forma segura por Stripe y PayPal; no almacenamos datos de tarjeta.</li>
              <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas (mediante cookies analíticas).</li>
              <li><strong>Comunicaciones:</strong> mensajes de chat, correos de soporte y consultas que nos envíes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Uso de Google APIs y OAuth</h2>
            <p>
              Nuestros sistemas internos de gestión utilizan la API de Google (incluyendo Google Sheets y
              Google Drive) exclusivamente para administrar registros de clientes, pedidos y leads de ventas.
              El acceso se realiza mediante OAuth 2.0 de Google bajo los siguientes principios:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Solo accedemos a los datos de Google necesarios para operar nuestras herramientas internas.</li>
              <li>No compartimos datos obtenidos de Google APIs con terceros.</li>
              <li>No usamos datos de Google APIs para fines publicitarios ni de segmentación.</li>
              <li>El uso cumple con la <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Política de datos de usuario de los Servicios de API de Google</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cómo usamos tu información</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Procesar y enviar tus pedidos.</li>
              <li>Brindarte soporte y atención al cliente.</li>
              <li>Enviarte información sobre tu pedido o actualizaciones del servicio.</li>
              <li>Enviarte comunicaciones de marketing si has dado tu consentimiento (puedes darte de baja en cualquier momento).</li>
              <li>Mejorar nuestro sitio web y experiencia de compra.</li>
              <li>Cumplir con obligaciones legales y fiscales aplicables en México.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Compartir información con terceros</h2>
            <p>No vendemos tu información personal. Podemos compartirla únicamente con:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Procesadores de pago:</strong> Stripe y PayPal, para gestionar transacciones.</li>
              <li><strong>Servicios de envío:</strong> para coordinar la entrega de tus pedidos.</li>
              <li><strong>Proveedores de tecnología:</strong> herramientas de CRM y automatización utilizadas internamente (Supabase, n8n, Chatwoot).</li>
              <li><strong>Autoridades legales:</strong> cuando sea requerido por ley o para proteger nuestros derechos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
            <p>
              Usamos cookies propias y de terceros para mejorar la experiencia de navegación, analizar el
              tráfico del sitio y personalizar el contenido. Puedes desactivar las cookies en la
              configuración de tu navegador, aunque esto puede afectar la funcionalidad del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Seguridad de los datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información,
              incluyendo cifrado HTTPS, acceso restringido a bases de datos y autenticación segura. Sin
              embargo, ningún sistema es completamente infalible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Tus derechos</h2>
            <p>De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de Particulares (México), tienes derecho a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Acceder a tus datos personales que poseemos.</li>
              <li>Rectificar datos incorrectos o incompletos.</li>
              <li>Cancelar o eliminar tus datos cuando no sean necesarios.</li>
              <li>Oponerte al tratamiento de tus datos para fines específicos.</li>
              <li>Revocar tu consentimiento en cualquier momento.</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, contáctanos en: <a href="mailto:contacto@duerme.cool" className="text-blue-600 hover:underline">contacto@duerme.cool</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Retención de datos</h2>
            <p>
              Conservamos tus datos personales mientras sean necesarios para los fines descritos en esta
              política o según lo requiera la ley mexicana. Los datos de pedidos se conservan por al menos
              5 años conforme a las obligaciones fiscales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos por correo
              electrónico o mediante un aviso en nuestro sitio web ante cambios significativos. La
              fecha de "última actualización" al inicio de esta página indica cuándo fue revisada por última vez.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contacto</h2>
            <p>Si tienes preguntas sobre esta Política de Privacidad, contáctanos:</p>
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
          <Link to="/terminos" className="hover:text-gray-700">Términos de servicio</Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
