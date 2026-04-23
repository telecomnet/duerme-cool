// ── Types ─────────────────────────────────────────────────────────────────────
export interface EmailItem {
  id: string
  size: string
  price: number    // full MXN (e.g. 16999), NOT cents
  quantity: number
}

export interface EmailCustomer {
  email: string
  full_name: string
  phone?: string | null
  address_line1: string
  address_line2?: string | null
  city: string
  state: string
  zip: string
  country: string
}

export interface EmailOrder {
  id: string
  order_number: string
  tracking_token: string
  items: EmailItem[]
  total_amount: number   // in cents (e.g. 1699900)
  currency: string
  stripe_payment_intent_id: string
  created_at: string
  language: string
}

// ── Bilingual copy ────────────────────────────────────────────────────────────
const copy = {
  es: {
    subject:       (n: string) => `✅ Pedido Confirmado — ${n} | Duerme.cool`,
    preheader:     'Su pedido ha sido confirmado. Encuentre los detalles a continuación.',
    greeting:      (name: string) => `Estimado/a ${name},`,
    subtitle:      '¡Su pedido ha sido confirmado exitosamente!',
    orderNumber:   'Número de Pedido',
    date:          'Fecha',
    products:      'Productos',
    product:       'Producto',
    size:          'Talla',
    qty:           'Cant.',
    unitPrice:     'Precio Unitario',
    subtotal:      'Subtotal',
    shippingLabel: 'Envío',
    shippingFree:  'GRATIS',
    total:         'Total',
    paymentRef:    'Referencia de Pago',
    shippingAddr:  'Dirección de Envío',
    trackTitle:    'Seguimiento de su pedido',
    trackDesc:     'Para consultar el estado de su pedido en tiempo real, le invitamos a registrarse en nuestro sitio web (duerme.cool) utilizando el correo electrónico con el que realizó su compra. Una vez que haya creado su cuenta, podrá dar seguimiento a su envío desde su perfil de manera sencilla.',
    supportTitle:  'Atención al cliente',
    supportDesc:   'Si tiene alguna pregunta o requiere información adicional sobre su pedido, puede contactarnos directamente a través del chat en nuestro sitio web o escribirnos a contacto@duerme.cool. Con gusto le atenderemos.',
    footer1:       'Para soporte, visítenos en duerme.cool o escríbanos a contacto@duerme.cool',
    footer2:       '© 2026 Duerme.cool — Todos los derechos reservados.',
    productName:   (size: string) => `Cover Duerme.cool — ${size}`,
    country:       'México',
  },
  en: {
    subject:       (n: string) => `✅ Order Confirmed — ${n} | Duerme.cool`,
    preheader:     'Your order has been confirmed. Please find the details below.',
    greeting:      (name: string) => `Dear ${name},`,
    subtitle:      'Your order has been successfully confirmed.',
    orderNumber:   'Order Number',
    date:          'Date',
    products:      'Products',
    product:       'Product',
    size:          'Size',
    qty:           'Qty',
    unitPrice:     'Unit Price',
    subtotal:      'Subtotal',
    shippingLabel: 'Shipping',
    shippingFree:  'FREE',
    total:         'Total',
    paymentRef:    'Payment Reference',
    shippingAddr:  'Shipping Address',
    trackTitle:    'Order Tracking',
    trackDesc:     'To check the status of your order in real time, we invite you to register on our website (duerme.cool) using the email address you provided at checkout. Once your account is created, you will be able to track your shipment directly from your profile.',
    supportTitle:  'Customer Support',
    supportDesc:   'If you have any questions or need further information about your order, please do not hesitate to contact us via the chat on our website or by writing to contacto@duerme.cool. We will be happy to assist you.',
    footer1:       'For support, visit us at duerme.cool or contact us at contacto@duerme.cool',
    footer2:       '© 2026 Duerme.cool — All rights reserved.',
    productName:   (size: string) => `Duerme.cool Cover — ${size}`,
    country:       'Mexico',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtMXN(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(n)
}

function fmtDate(dateStr: string, lang: 'es' | 'en'): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-MX' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(dateStr))
}

// ── Main builder ──────────────────────────────────────────────────────────────
export function buildOrderConfirmationEmail({
  order,
  customer,
  language,
  siteUrl,
}: {
  order: EmailOrder
  customer: EmailCustomer
  language: 'es' | 'en'
  siteUrl: string
}): { subject: string; html: string } {

  const t = copy[language] ?? copy.es
  const trackingUrl = `${siteUrl}/pedido/${order.tracking_token}`
  const firstName = customer.full_name.split(' ')[0]

  // Items rows
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;">
        <strong>${t.productName(item.size)}</strong>
      </td>
      <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:center;">${item.size}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:center;">${item.quantity}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:right;">${fmtMXN(item.price)}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#1e293b;text-align:right;">${fmtMXN(item.price * item.quantity)}</td>
    </tr>`).join('')

  const addrLine2 = customer.address_line2 ? `<br>${customer.address_line2}` : ''
  const piShort = order.stripe_payment_intent_id.slice(-12).toUpperCase()

  const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${t.subject(order.order_number)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader (hidden in body, shown in inbox) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${t.preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">

      <!-- ─── CARD ─────────────────────────────────────────────────────────── -->
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

        <!-- HEADER -->
        <tr>
          <td style="background:#2563eb;padding:40px 40px 36px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:34px;font-weight:800;letter-spacing:-1.5px;">duerme.cool</h1>
            <p style="margin:8px 0 0;color:#ffffff;opacity:0.8;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Smart Comfort Technology</p>
          </td>
        </tr>

        <!-- SUCCESS BANNER -->
        <tr>
          <td style="background:linear-gradient(135deg,#059669,#10b981);padding:22px 40px;">
            <table cellpadding="0" cellspacing="0" role="presentation" align="center">
              <tr>
                <td style="background:rgba(255,255,255,0.25);border-radius:50%;width:44px;height:44px;text-align:center;vertical-align:middle;font-size:24px;line-height:44px;">✓</td>
                <td style="padding-left:14px;">
                  <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${t.subtitle}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px;">

            <!-- Greeting -->
            <h2 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#1e293b;">${t.greeting(firstName)}</h2>

            <!-- Order meta pills -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0 0;">
              <tr>
                <td width="50%" style="padding-right:8px;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;">
                    <p style="margin:0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">${t.orderNumber}</p>
                    <p style="margin:5px 0 0;font-size:20px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">${order.order_number}</p>
                  </div>
                </td>
                <td width="50%" style="padding-left:8px;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;">
                    <p style="margin:0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">${t.date}</p>
                    <p style="margin:5px 0 0;font-size:14px;font-weight:600;color:#1e293b;">${fmtDate(order.created_at, language)}</p>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Products -->
            <h3 style="margin:36px 0 14px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">${t.products}</h3>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                   style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
              <tr style="background:#f8fafc;">
                <th style="padding:12px 16px;text-align:left;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${t.product}</th>
                <th style="padding:12px 16px;text-align:center;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${t.size}</th>
                <th style="padding:12px 16px;text-align:center;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${t.qty}</th>
                <th style="padding:12px 16px;text-align:right;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${t.unitPrice}</th>
                <th style="padding:12px 16px;text-align:right;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${t.subtotal}</th>
              </tr>
              ${itemRows}
              <tr style="background:#f8fafc;">
                <td colspan="4" style="padding:12px 16px;text-align:right;font-size:13px;color:#64748b;">${t.shippingLabel}</td>
                <td style="padding:12px 16px;text-align:right;font-size:13px;font-weight:700;color:#059669;">${t.shippingFree}</td>
              </tr>
              <tr style="background:#eff6ff;">
                <td colspan="4" style="padding:18px 16px;text-align:right;font-size:15px;font-weight:700;color:#1e293b;">${t.total}</td>
                <td style="padding:18px 16px;text-align:right;font-size:22px;font-weight:800;color:#2563eb;">${fmtMXN(order.total_amount / 100)}</td>
              </tr>
            </table>

            <!-- Payment reference -->
            <div style="margin:18px 0 0;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;display:flex;align-items:center;">
              <span style="font-size:16px;margin-right:8px;">✅</span>
              <p style="margin:0;font-size:12px;color:#166534;">
                <strong>${t.paymentRef}:</strong>
                <span style="font-family:'Courier New',monospace;margin-left:6px;background:#dcfce7;padding:2px 6px;border-radius:4px;">${piShort}</span>
              </p>
            </div>

            <!-- Shipping address -->
            <h3 style="margin:36px 0 14px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">${t.shippingAddr}</h3>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:22px;">
              <p style="margin:0;font-size:16px;font-weight:700;color:#1e293b;">${customer.full_name}</p>
              ${customer.phone ? `<p style="margin:4px 0 0;font-size:13px;color:#64748b;">${customer.phone}</p>` : ''}
              <p style="margin:10px 0 0;font-size:14px;color:#475569;line-height:1.7;">
                ${customer.address_line1}${addrLine2}<br>
                ${customer.city}, ${customer.state} ${customer.zip}<br>
                ${customer.country === 'MX' ? t.country : customer.country}
              </p>
            </div>

            <!-- Tracking info -->
            <div style="margin:36px 0 0;background:linear-gradient(135deg,#eff6ff,#eef2ff);border:1px solid #c7d2fe;border-radius:18px;padding:28px;">
              <p style="margin:0 0 6px;font-size:22px;">📦</p>
              <p style="margin:0 0 10px;font-size:17px;font-weight:800;color:#1e293b;">${t.trackTitle}</p>
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">${t.trackDesc}</p>
            </div>

            <!-- Support info -->
            <div style="margin:16px 0 0;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:18px;padding:28px;">
              <p style="margin:0 0 6px;font-size:22px;">💬</p>
              <p style="margin:0 0 10px;font-size:17px;font-weight:800;color:#1e293b;">${t.supportTitle}</p>
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">${t.supportDesc}</p>
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:28px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#64748b;">${t.footer1}</p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">${t.footer2}</p>
          </td>
        </tr>

      </table>
      <!-- ─── /CARD ──────────────────────────────────────────────────────────── -->

    </td></tr>
  </table>
</body>
</html>`

  return { subject: t.subject(order.order_number), html }
}

// ── Newsletter confirmation email ──────────────────────────────────────────────
const newsletterCopy = {
  es: {
    subject:     'Confirma tu suscripción a Duerme.cool',
    greeting:    (name: string) => `Hola ${name},`,
    bodyText:    'Nos alegra que desees recibir nuestras ofertas y novedades. Para completar tu suscripción, por favor confirma tu correo haciendo clic en el botón de abajo.',
    ctaButton:   'Confirmar suscripción',
    footer1:     'Para soporte, visítenos en duerme.cool o escríbanos a contacto@duerme.cool',
    footer2:     '© 2026 Duerme.cool — Todos los derechos reservados.',
  },
  en: {
    subject:     'Confirm your Duerme.cool subscription',
    greeting:    (name: string) => `Hi ${name},`,
    bodyText:    'We\'re glad you want to receive our offers and news. To complete your subscription, please confirm your email by clicking the button below.',
    ctaButton:   'Confirm subscription',
    footer1:     'For support, visit us at duerme.cool or contact us at contacto@duerme.cool',
    footer2:     '© 2026 Duerme.cool — All rights reserved.',
  },
}

export function buildNewsletterConfirmationEmail({
  name,
  confirmUrl,
  language,
}: {
  name: string
  confirmUrl: string
  language: 'es' | 'en'
}): { subject: string; html: string } {
  const t = newsletterCopy[language] ?? newsletterCopy.es

  const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${t.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">

      <!-- ─── CARD ─────────────────────────────────────────────────────────── -->
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

        <!-- HEADER -->
        <tr>
          <td style="background:#2563eb;padding:40px 40px 36px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:34px;font-weight:800;letter-spacing:-1.5px;">duerme.cool</h1>
            <p style="margin:8px 0 0;color:#ffffff;opacity:0.8;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Smart Comfort Technology</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px;">

            <!-- Greeting -->
            <h2 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#1e293b;">${t.greeting(name)}</h2>

            <!-- Message -->
            <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#475569;">${t.bodyText}</p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" role="presentation" align="center" style="margin:0 auto;">
              <tr>
                <td style="background:#2563eb;border-radius:12px;padding:16px 40px;">
                  <a href="${confirmUrl}" style="display:inline-block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:-0.5px;">
                    ${t.ctaButton}
                  </a>
                </td>
              </tr>
            </table>

            <!-- Alternative link -->
            <p style="margin:28px 0 0;font-size:13px;color:#64748b;text-align:center;">
              ${language === 'es' ? 'O copia y pega este enlace:' : 'Or copy and paste this link:'}
              <br>
              <a href="${confirmUrl}" style="color:#2563eb;text-decoration:none;word-break:break-all;font-size:12px;">
                ${confirmUrl}
              </a>
            </p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:28px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#64748b;">${t.footer1}</p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">${t.footer2}</p>
          </td>
        </tr>

      </table>
      <!-- ─── /CARD ──────────────────────────────────────────────────────────── -->

    </td></tr>
  </table>
</body>
</html>`

  return { subject: t.subject, html }
}
