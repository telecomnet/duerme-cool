import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Header
  'header.howItWorks': { es: 'Cómo Funciona', en: 'How It Works' },
  'header.benefits': { es: 'Beneficios', en: 'Benefits' },
  'header.questions': { es: 'Preguntas', en: 'FAQ' },
  'header.tryNow': { es: 'Prueba Ahora', en: 'Try Now' },

  // Hero
  'hero.title1': { es: 'Descanso Perfecto con', en: 'Perfect Rest with' },
  'hero.title2': { es: 'Temperatura Ideal', en: 'Ideal Temperature' },
  'hero.subtitle': {
    es: 'Disfruta de noches placenteras con nuestro cover que ajusta automáticamente la temperatura de tu cama, garantizando un sueño profundo y reparador.',
    en: 'Enjoy pleasant nights with our cover that automatically adjusts the temperature of your bed, guaranteeing deep and restorative sleep.',
  },
  'hero.tryNow': { es: 'Prueba Ahora', en: 'Try Now' },
  'hero.seeHow': { es: 'Ver Cómo Funciona', en: 'See How It Works' },
  'hero.improvement': { es: '92% mejora desde la primera noche', en: '92% improvement from the first night' },
  'hero.precision': { es: 'Precisión ±1°C', en: '±1°C Precision' },
  'hero.tempRange': { es: 'Rango de temperatura', en: 'Temperature range' },
  'hero.silent': { es: 'Silencioso', en: 'Silent' },

  // How It Works
  'howItWorks.title': { es: 'Tu Camino al Descanso Perfecto', en: 'Your Path to Perfect Rest' },
  'howItWorks.subtitle': {
    es: 'En solo tres simples pasos, transforma tu experiencia de sueño para siempre',
    en: 'In just three simple steps, transform your sleep experience forever',
  },
  'howItWorks.step': { es: 'Paso', en: 'Step' },
  'howItWorks.step1.title': { es: 'Selecciona tu Preferencia de Temperatura', en: 'Select Your Temperature Preference' },
  'howItWorks.step1.subtitle': { es: 'Personaliza tu Experiencia de Sueño', en: 'Personalize Your Sleep Experience' },
  'howItWorks.step1.desc': {
    es: 'Responde un breve cuestionario para identificar tus preferencias de temperatura al dormir, ya sea solo o en pareja, y asegura el confort perfecto.',
    en: 'Answer a brief questionnaire to identify your sleeping temperature preferences, whether alone or with a partner, and ensure perfect comfort.',
  },
  'howItWorks.step2.title': { es: 'Elige Tamaño y Configuración', en: 'Choose Size and Configuration' },
  'howItWorks.step2.subtitle': { es: 'Selecciona el Tamaño Adecuado', en: 'Select the Right Size' },
  'howItWorks.step2.desc': {
    es: 'Elige el tamaño de tu cama, decide si necesitas una o dos zonas de temperatura y selecciona la cantidad de piezas para tu hogar.',
    en: 'Choose your bed size, decide if you need one or two temperature zones, and select the number of pieces for your home.',
  },
  'howItWorks.step3.title': { es: 'Confirmación y Envío Rápido', en: 'Confirmation and Fast Shipping' },
  'howItWorks.step3.subtitle': { es: 'Finaliza tu Compra Segura', en: 'Complete Your Secure Purchase' },
  'howItWorks.step3.desc': {
    es: 'Ingresa tus datos de envío y pago, recibe confirmación con número de guía y disfruta de tu cover en pocos días.',
    en: 'Enter your shipping and payment details, receive confirmation with tracking number, and enjoy your cover in a few days.',
  },

  // Benefits
  'benefits.benefit1.title': { es: 'Descanso Profundo, Noche Tras Noche', en: 'Deep Rest, Night After Night' },
  'benefits.benefit1.desc': {
    es: 'Nunca más pasarás noches dando vueltas por el calor. Nuestro sistema mantiene tu lado de la cama fresco, mientras tu pareja puede elegir su temperatura preferida sin conflictos.',
    en: 'Never again will you spend nights tossing and turning from the heat. Our system keeps your side of the bed cool, while your partner can choose their preferred temperature without conflicts.',
  },
  'benefits.benefit2.title': { es: 'Ajuste Automático sin Intervención', en: 'Automatic Adjustment Without Intervention' },
  'benefits.benefit2.desc': {
    es: 'El sistema aprende tus horarios y preferencias, ajustando la temperatura antes de que llegues a la cama. Sin apps complicadas ni controles manuales: solo confort inteligente que funciona solo.',
    en: 'The system learns your schedule and preferences, adjusting the temperature before you get to bed. No complicated apps or manual controls: just smart comfort that works on its own.',
  },
  'benefits.designedForYou': { es: 'Diseñado Para Ti', en: 'Designed For You' },
  'benefits.specificSolutions': {
    es: 'Soluciones específicas para diferentes necesidades de descanso',
    en: 'Specific solutions for different rest needs',
  },
  'benefits.audience1.title': { es: 'Para Parejas con Distintas Preferencias', en: 'For Couples with Different Preferences' },
  'benefits.audience1.desc': {
    es: 'Diseñado para quienes comparten cama pero no clima. Si tú prefieres fresco y tu pareja calor, nuestro sistema de doble zona garantiza confort personalizado sin negociaciones incómodas.',
    en: 'Designed for those who share a bed but not a climate. If you prefer cool and your partner prefers warm, our dual-zone system guarantees personalized comfort without awkward negotiations.',
  },
  'benefits.audience2.title': { es: 'Profesionales con Sueño Ligero', en: 'Light-Sleeping Professionals' },
  'benefits.audience2.desc': {
    es: 'Ideal para quienes sufren insomnio por estrés laboral. Regula automáticamente la temperatura para inducir un sueño profundo, ayudándote a despertar renovado y productivo.',
    en: 'Ideal for those who suffer from insomnia due to work stress. It automatically regulates the temperature to induce deep sleep, helping you wake up refreshed and productive.',
  },

  // Validation
  'validation.title': { es: 'Respaldado por Expertos', en: 'Backed by Experts' },
  'validation.subtitle': {
    es: 'La confianza de profesionales y la satisfacción de miles de usuarios',
    en: 'The trust of professionals and the satisfaction of thousands of users',
  },
  'validation.v1.title': { es: 'Tecnología Avanzada para un Descanso de Alto Rendimiento', en: 'Advanced Technology for High-Performance Rest' },
  'validation.v1.p1': {
    es: 'Diseñado en colaboración con especialistas del sueño para optimizar la recuperación física y mental',
    en: 'Designed in collaboration with sleep specialists to optimize physical and mental recovery',
  },
  'validation.v1.p2': {
    es: 'Manufacturado con estándares internacionales en una empresa transnacional con 15 años de experiencia',
    en: 'Manufactured with international standards by a transnational company with 15 years of experience',
  },
  'validation.v1.p3': {
    es: 'Sistema validado por atletas profesionales que exigen máximo rendimiento en su descanso',
    en: 'System validated by professional athletes who demand maximum performance in their rest',
  },
  'validation.v1.p4': {
    es: 'Soporte post-venta especializado para garantizar tu satisfacción continua',
    en: 'Specialized after-sales support to guarantee your continued satisfaction',
  },
  'validation.v2.title': { es: 'Innovación Probada para Dormir Inteligente', en: 'Proven Innovation for Smart Sleeping' },
  'validation.v2.p1': {
    es: 'Tecnología patentada desarrollada en instalaciones de clase mundial',
    en: 'Patented technology developed in world-class facilities',
  },
  'validation.v2.p2': {
    es: 'Recomendado por entrenadores y médicos del sueño por sus beneficios comprobados',
    en: 'Recommended by coaches and sleep doctors for its proven benefits',
  },
  'validation.v2.p3': {
    es: 'Materiales de grado médico que promueven un descanso profundo y reparador',
    en: 'Medical-grade materials that promote deep and restorative rest',
  },
  'validation.v2.p4': {
    es: 'Programa de acompañamiento post-venta "Duerme Más Inteligente" incluido',
    en: '"Sleep Smarter" post-sale support program included',
  },
  'validation.stat1': { es: 'Mejora desde la primera noche', en: 'Improvement from the first night' },
  'validation.stat2': { es: 'Años de experiencia', en: 'Years of experience' },
  'validation.stat3': { es: 'Estudios clínicos', en: 'Clinical studies' },
  'validation.stat4': { es: 'Soporte especializado', en: 'Specialized support' },

  // FAQ
  'faq.title': { es: 'Preguntas Frecuentes', en: 'Frequently Asked Questions' },
  'faq.subtitle': {
    es: 'Resolvemos las dudas más comunes sobre nuestro sistema',
    en: 'We resolve the most common questions about our system',
  },
  'faq.q1': { es: '¿Realmente funciona para regular la temperatura mientras duermo?', en: 'Does it really work to regulate temperature while I sleep?' },
  'faq.a1': {
    es: 'Absolutamente. Nuestro sistema utiliza tecnología de circulación de agua de precisión, probada para mantener la temperatura seleccionada (±1°C) durante toda la noche, adaptándose incluso a cambios climáticos.',
    en: 'Absolutely. Our system uses precision water circulation technology, proven to maintain the selected temperature (±1°C) throughout the night, adapting even to climate changes.',
  },
  'faq.q2': { es: '¿Es complicado de instalar?', en: 'Is it complicated to install?' },
  'faq.a2': {
    es: 'No requiere instalación profesional. Solo colócalo sobre el colchón (como un cubrecolchón), conecta la unidad de control a un enchufe y listo. El proceso toma menos de 3 minutos.',
    en: 'No professional installation required. Just place it on the mattress (like a mattress pad), connect the control unit to an outlet, and you\'re done. The process takes less than 3 minutes.',
  },
  'faq.q3': { es: '¿Hace ruido al funcionar?', en: 'Does it make noise when operating?' },
  'faq.a3': {
    es: 'Es casi silencioso (<20dB, equivalente a un susurro). La bomba de agua utiliza tecnología de absorción de vibraciones, imperceptible durante el sueño.',
    en: 'It\'s almost silent (<20dB, equivalent to a whisper). The water pump uses vibration absorption technology, imperceptible during sleep.',
  },
  'faq.q4': { es: '¿Qué pasa si mi pareja y yo tenemos preferencias de temperatura opuestas?', en: 'What if my partner and I have opposite temperature preferences?' },
  'faq.a4': {
    es: 'El sistema de doble zona permite que cada lado de la cama mantenga temperaturas independientes (desde 18°C hasta 40°C), sin afectar la otra zona.',
    en: 'The dual-zone system allows each side of the bed to maintain independent temperatures (from 18°C to 40°C), without affecting the other zone.',
  },
  'faq.q5': { es: '¿Es seguro usar agua cerca de la cama?', en: 'Is it safe to use water near the bed?' },
  'faq.a5': {
    es: 'Totalmente. El circuito es cerrado y hermético, con materiales anti-fugas. Además, cuenta con certificación internacional de seguridad eléctrica (UL Listed).',
    en: 'Totally. The circuit is closed and sealed, with anti-leak materials. In addition, it has international electrical safety certification (UL Listed).',
  },
  'faq.q6': { es: '¿Cómo afecta al colchón? ¿Lo daña con el tiempo?', en: 'How does it affect the mattress? Does it damage it over time?' },
  'faq.a6': {
    es: 'No. El diseño distribuye el peso uniformemente y usa materiales transpirables que evitan humedad. Es compatible con todo tipo de colchones (incluyendo viscoelásticos).',
    en: 'No. The design distributes weight evenly and uses breathable materials that prevent moisture. It is compatible with all types of mattresses (including memory foam).',
  },
  'faq.q7': { es: '¿Qué tan rápido nota los beneficios?', en: 'How quickly do you notice the benefits?' },
  'faq.a7': {
    es: 'Desde la primera noche. El 92% de usuarios reportan mejoras inmediatas en la calidad del sueño, según estudios clínicos independientes.',
    en: 'From the first night. 92% of users report immediate improvements in sleep quality, according to independent clinical studies.',
  },
  'faq.q8': { es: '¿Requiere mantenimiento constante?', en: 'Does it require constant maintenance?' },
  'faq.a8': {
    es: 'Solo llenar el depósito de agua cada 6-8 semanas (como una planta). El sistema incluye autolimpieza y alertas cuando necesita atención.',
    en: 'Just fill the water tank every 6-8 weeks (like a plant). The system includes self-cleaning and alerts when it needs attention.',
  },

  // CTA
  'cta.title': { es: 'Transforma Tu Sueño Esta Misma Noche', en: 'Transform Your Sleep Tonight' },
  'cta.subtitle': {
    es: 'Únete a miles de personas que ya disfrutan del descanso perfecto. Tu mejor noche de sueño está a solo un clic de distancia.',
    en: 'Join thousands of people who already enjoy perfect rest. Your best night of sleep is just one click away.',
  },
  'cta.tryComfort': { es: 'Prueba el Confort Inteligente', en: 'Try Smart Comfort' },
  'cta.moreInfo': { es: 'Ver Más Información', en: 'More Information' },
  'cta.guarantee': { es: 'Garantía de satisfacción', en: 'Satisfaction guarantee' },
  'cta.shipping': { es: 'Envío rápido a toda México', en: 'Fast shipping across Mexico' },
  'cta.support': { es: 'Soporte especializado 24/7', en: '24/7 Specialized support' },

  // Footer
  'footer.desc': {
    es: 'Revolucionando el descanso con tecnología inteligente de regulación térmica. Tu mejor noche de sueño comienza aquí.',
    en: 'Revolutionizing rest with intelligent thermal regulation technology. Your best night of sleep starts here.',
  },
  'footer.product': { es: 'Producto', en: 'Product' },
  'footer.howItWorks': { es: 'Cómo Funciona', en: 'How It Works' },
  'footer.benefits': { es: 'Beneficios', en: 'Benefits' },
  'footer.specs': { es: 'Especificaciones', en: 'Specifications' },
  'footer.warranty': { es: 'Garantía', en: 'Warranty' },
  'footer.supportTitle': { es: 'Soporte', en: 'Support' },
  'footer.faq': { es: 'Preguntas Frecuentes', en: 'FAQ' },
  'footer.installation': { es: 'Instalación', en: 'Installation' },
  'footer.maintenance': { es: 'Mantenimiento', en: 'Maintenance' },
  'footer.contact': { es: 'Contacto', en: 'Contact' },
  'footer.rights': { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },

  // Shop
  'shop.title': { es: 'Nuestra Colección', en: 'Our Collection' },
  'shop.subtitle': {
    es: 'Elige el tamaño perfecto para tu cama y transforma tu descanso',
    en: 'Choose the perfect size for your bed and transform your rest',
  },
  'shop.full.name': { es: 'Cover Duerme.cool — Full', en: 'Duerme.cool Cover — Full' },
  'shop.full.desc': {
    es: 'Ideal para camas individuales amplias. Incluye unidad de control inteligente y cover con tecnología de circulación de agua de precisión. Perfecto para una persona.',
    en: 'Ideal for wide single beds. Includes smart control unit and cover with precision water circulation technology. Perfect for one person.',
  },
  'shop.full.dimensions': { es: '137 × 190 cm', en: '54 × 75 in' },
  'shop.queen.name': { es: 'Cover Duerme.cool — Queen', en: 'Duerme.cool Cover — Queen' },
  'shop.queen.desc': {
    es: 'El más popular. Sistema de doble zona para parejas con distintas preferencias de temperatura. Cada lado ajustable de forma independiente de 18°C a 40°C.',
    en: 'The most popular. Dual-zone system for couples with different temperature preferences. Each side independently adjustable from 18°C to 40°C.',
  },
  'shop.queen.dimensions': { es: '152 × 203 cm', en: '60 × 80 in' },
  'shop.king.name': { es: 'Cover Duerme.cool — King', en: 'Duerme.cool Cover — King' },
  'shop.king.desc': {
    es: 'Máximo espacio y confort. Sistema premium de doble zona con cobertura extendida. La experiencia definitiva para parejas que buscan descanso de lujo.',
    en: 'Maximum space and comfort. Premium dual-zone system with extended coverage. The ultimate experience for couples seeking luxury rest.',
  },
  'shop.king.dimensions': { es: '193 × 203 cm', en: '76 × 80 in' },
  'shop.addToCart': { es: 'Agregar al Carrito', en: 'Add to Cart' },
  'shop.size': { es: 'Tamaño', en: 'Size' },
  'shop.popular': { es: 'Más Popular', en: 'Most Popular' },
  'shop.premium': { es: 'Premium', en: 'Premium' },
  'shop.includes': { es: 'Incluye', en: 'Includes' },
  'shop.controlUnit': { es: 'Unidad de control inteligente', en: 'Smart control unit' },
  'shop.cover': { es: 'Cover con tecnología térmica', en: 'Thermal technology cover' },
  'shop.warranty': { es: 'Garantía de satisfacción', en: 'Satisfaction guarantee' },
  'shop.freeShipping': { es: 'Envío gratis', en: 'Free shipping' },
  'shop.backToHome': { es: '← Volver al inicio', en: '← Back to home' },

  // Toast (AddedToCartToast)
  'toast.addedToCart':      { es: '¡Producto agregado!',  en: 'Product added!' },
  'toast.continueShopping': { es: 'Seguir comprando',     en: 'Continue Shopping' },
  'toast.viewCart':         { es: 'Ver carrito',          en: 'View Cart' },

  // Cart Drawer
  'cart.title':        { es: 'Tu Carrito',                              en: 'Your Cart' },
  'cart.empty':        { es: 'Carrito vacío',                          en: 'Your cart is empty' },
  'cart.emptySubtitle':{ es: 'Agrega productos para comenzar',         en: 'Add products to get started' },
  'cart.browseProd':   { es: 'Ver Productos',                          en: 'Browse Products' },
  'cart.subtotal':     { es: 'Subtotal',                               en: 'Subtotal' },
  'cart.shippingNote': { es: 'Envío gratis a toda la República',       en: 'Free shipping across Mexico' },
  'cart.checkout':     { es: 'Ir al Checkout',                         en: 'Proceed to Checkout' },

  // Header cart icon
  'header.cart': { es: 'Carrito', en: 'Cart' },

  // Checkout page
  'checkout.title':             { es: 'Finalizar Compra',                                                       en: 'Checkout' },
  'checkout.step1':             { es: 'Contacto',                                                               en: 'Contact' },
  'checkout.step2':             { es: 'Envío',                                                                  en: 'Shipping' },
  'checkout.step3':             { es: 'Pago',                                                                   en: 'Payment' },
  'checkout.contactTitle':      { es: 'Información de Contacto',                                               en: 'Contact Information' },
  'checkout.paymentTitle':      { es: 'Detalles de Pago',                                                      en: 'Payment Details' },
  'checkout.email':             { es: 'Correo electrónico',                                                     en: 'Email address' },
  'checkout.emailPlaceholder':  { es: 'tu@correo.com',                                                         en: 'you@email.com' },
  'checkout.emailError':        { es: 'Por favor ingresa un correo válido',                                     en: 'Please enter a valid email address' },
  'checkout.phone':             { es: 'Teléfono',                                                               en: 'Phone' },
  'checkout.phonePlaceholder':  { es: '+52 55 1234 5678',                                                      en: '+52 55 1234 5678' },
  'checkout.phoneOptional':     { es: 'Opcional',                                                               en: 'Optional' },
  'checkout.phoneHint':         { es: 'Para coordinar tu envío',                                               en: 'To coordinate your delivery' },
  'checkout.newsletter':        { es: 'Recibir descuentos y novedades',                                        en: 'Receive discounts and news' },
  'checkout.newsletterDesc':    { es: 'Sé el primero en conocer nuestras ofertas exclusivas y nuevos productos', en: 'Be the first to know about exclusive discounts and new products' },
  'checkout.newsletterConfirm': { es: 'Suscrito a ofertas',                                                    en: 'Subscribed to offers' },
  'checkout.continueToPayment': { es: 'Continuar al Pago',                                                     en: 'Continue to Payment' },
  'checkout.back':              { es: 'Volver',                                                                 en: 'Back' },
  'checkout.orderSummary':      { es: 'Resumen del Pedido',                                                    en: 'Order Summary' },
  'checkout.shipping':          { es: 'Envío',                                                                  en: 'Shipping' },
  'checkout.shippingFree':      { es: 'Gratis',                                                                 en: 'Free' },
  'checkout.total':             { es: 'Total',                                                                  en: 'Total' },
  'checkout.securePayment':     { es: 'Pago 100 % seguro con SSL',                                            en: '100% Secure SSL Payment' },
  'checkout.payNow':            { es: 'Pagar',                                                                  en: 'Pay' },
  'checkout.setupRequired':     { es: 'Configuración de Stripe requerida',                                     en: 'Stripe Setup Required' },
  'checkout.setupDesc':         { es: 'Configura tu cuenta de Stripe y el endpoint del servidor para procesar pagos.', en: 'Configure your Stripe account and server endpoint to process payments.' },

  // Checkout — shipping form
  'checkout.shippingTitle':          { es: 'Dirección de Envío',            en: 'Shipping Address' },
  'checkout.fullName':               { es: 'Nombre completo',               en: 'Full name' },
  'checkout.fullNamePlaceholder':    { es: 'Juan García López',             en: 'John Smith' },
  'checkout.addressLine1':           { es: 'Calle y número exterior',       en: 'Street address' },
  'checkout.addressLine1Placeholder':{ es: 'Av. Reforma 123',               en: '123 Main Street' },
  'checkout.addressLine2':           { es: 'Interior, piso, etc.',          en: 'Apt, suite, floor, etc.' },
  'checkout.addressLine2Placeholder':{ es: 'Int. 4B',                       en: 'Apt 4B' },
  'checkout.city':                   { es: 'Ciudad',                        en: 'City' },
  'checkout.cityPlaceholder':        { es: 'Ciudad de México',              en: 'Mexico City' },
  'checkout.state':                  { es: 'Estado',                        en: 'State' },
  'checkout.statePlaceholder':       { es: 'Selecciona un estado',          en: 'Select a state' },
  'checkout.zip':                    { es: 'Código postal',                 en: 'ZIP code' },
  'checkout.zipPlaceholder':         { es: '06600',                         en: '06600' },
  'checkout.zipError':               { es: 'Ingresa un código de 5 dígitos', en: 'Enter a valid 5-digit ZIP code' },
  'checkout.country':                { es: 'País',                          en: 'Country' },
  'checkout.fieldRequired':          { es: 'Campo requerido',               en: 'Required field' },
  'checkout.continueToShipping':     { es: 'Continuar',                     en: 'Continue' },

  // Success / failure page
  'success.title':            { es: '¡Pedido Confirmado!',                                                                    en: 'Order Confirmed!' },
  'success.subtitle':         { es: 'Tu pago fue procesado exitosamente.',                                                    en: 'Your payment was processed successfully.' },
  'success.emailNotice':      { es: 'Recibirás un correo de confirmación en breve con los detalles de tu pedido.',            en: 'You will receive a confirmation email shortly with your order details.' },
  'success.shippingNotice':   { es: 'Tu pedido llegará en 3–5 días hábiles a la dirección indicada.',                         en: 'Your order will arrive within 3–5 business days to the provided address.' },
  'success.orderRef':         { es: 'Referencia de pago',                                                                     en: 'Payment reference' },
  'success.continueShopping': { es: 'Seguir Comprando',                                                                       en: 'Continue Shopping' },
  'success.failed.title':     { es: 'Pago no completado',                                                                     en: 'Payment not completed' },
  'success.failed.subtitle':  { es: 'Hubo un problema al procesar tu pago. Por favor intenta de nuevo.',                      en: 'There was a problem processing your payment. Please try again.' },
  'success.failed.retry':     { es: 'Intentar de nuevo',                                                                      en: 'Try Again' },

  // Auth modal
  'auth.login':            { es: 'Iniciar sesión',                                          en: 'Sign in' },
  'auth.register':         { es: 'Crear cuenta',                                            en: 'Register' },
  'auth.loginTitle':       { es: 'Bienvenido de vuelta',                                    en: 'Welcome back' },
  'auth.registerTitle':    { es: 'Crear tu cuenta',                                         en: 'Create your account' },
  'auth.email':            { es: 'Correo electrónico',                                      en: 'Email address' },
  'auth.password':         { es: 'Contraseña',                                              en: 'Password' },
  'auth.confirmPassword':  { es: 'Confirmar contraseña',                                    en: 'Confirm password' },
  'auth.fullName':         { es: 'Nombre completo',                                         en: 'Full name' },
  'auth.loginBtn':         { es: 'Entrar',                                                  en: 'Sign in' },
  'auth.registerBtn':      { es: 'Crear cuenta',                                            en: 'Create account' },
  'auth.noAccount':        { es: '¿No tienes cuenta?',                                      en: "Don't have an account?" },
  'auth.registerLink':     { es: 'Regístrate',                                              en: 'Sign up' },
  'auth.hasAccount':       { es: '¿Ya tienes cuenta?',                                      en: 'Already have an account?' },
  'auth.loginLink':        { es: 'Inicia sesión',                                           en: 'Sign in' },
  'auth.checkEmail':       { es: '¡Revisa tu correo!',                                      en: 'Check your email!' },
  'auth.checkEmailDesc':   { es: 'Te enviamos un enlace de verificación a',                 en: 'We sent a verification link to' },
  'auth.closeBtn':         { es: 'Cerrar',                                                  en: 'Close' },
  'auth.passwordMismatch': { es: 'Las contraseñas no coinciden',                            en: 'Passwords do not match' },
  'auth.passwordMinLength':{ es: 'La contraseña debe tener al menos 8 caracteres',          en: 'Password must be at least 8 characters' },
  'auth.myOrders':         { es: 'Mis Pedidos',                                             en: 'My Orders' },
  'auth.myProfile':        { es: 'Mi Perfil',                                               en: 'My Profile' },
  'auth.adminDashboard':   { es: 'Panel Admin',                                             en: 'Admin Dashboard' },
  'auth.signOut':          { es: 'Cerrar sesión',                                           en: 'Sign out' },

  // Buyer dashboard
  'dashboard.title':           { es: 'Mis Pedidos',                  en: 'My Orders' },
  'dashboard.backToShop':      { es: 'Volver a la tienda',           en: 'Back to shop' },
  'dashboard.noOrders':        { es: 'Aún no tienes pedidos',        en: 'You have no orders yet' },
  'dashboard.shopNow':         { es: 'Ir a la tienda',               en: 'Go to shop' },
  'dashboard.items':           { es: 'Productos',                    en: 'Products' },
  'dashboard.qty':             { es: 'Cant.',                         en: 'Qty' },
  'dashboard.tracking':        { es: 'Seguimiento',                  en: 'Tracking' },
  'dashboard.trackingLink':    { es: 'Rastrear envío',               en: 'Track shipment' },
  'dashboard.noTracking':      { es: 'Número de rastreo pendiente',  en: 'Tracking number pending' },
  'dashboard.shippingAddress': { es: 'Dirección de envío',           en: 'Shipping address' },
  'dashboard.status.pending':  { es: 'Pendiente',                    en: 'Pending' },
  'dashboard.status.paid':     { es: 'Pagado',                       en: 'Paid' },
  'dashboard.status.shipped':  { es: 'Enviado',                      en: 'Shipped' },
  'dashboard.status.delivered':{ es: 'Entregado',                    en: 'Delivered' },

  // Dashboard — tabs & profile
  'dashboard.tab.orders':              { es: 'Mis Pedidos',                             en: 'My Orders' },
  'dashboard.tab.profile':             { es: 'Mi Perfil',                               en: 'My Profile' },
  'dashboard.paymentRef':              { es: 'Ref. de pago',                            en: 'Payment ref.' },
  'dashboard.orderDate':               { es: 'Fecha',                                   en: 'Date' },
  'dashboard.total':                   { es: 'Total',                                   en: 'Total' },

  'dashboard.profile.title':           { es: 'Información de Perfil',                   en: 'Profile Information' },
  'dashboard.profile.name':            { es: 'Nombre completo',                         en: 'Full name' },
  'dashboard.profile.phone':           { es: 'Teléfono',                                en: 'Phone' },
  'dashboard.profile.phonePlaceholder':{ es: '+52 55 0000 0000',                        en: '+52 55 0000 0000' },
  'dashboard.profile.language':        { es: 'Idioma preferido',                        en: 'Preferred language' },
  'dashboard.profile.langEs':          { es: 'Español',                                 en: 'Spanish' },
  'dashboard.profile.langEn':          { es: 'Inglés',                                  en: 'English' },
  'dashboard.profile.newsletter':      { es: 'Suscrito al newsletter',                  en: 'Newsletter subscriber' },
  'dashboard.profile.newsletterDesc':  { es: 'Recibir ofertas exclusivas y novedades',  en: 'Receive exclusive offers and news' },
  'dashboard.profile.save':            { es: 'Guardar cambios',                         en: 'Save changes' },
  'dashboard.profile.saving':          { es: 'Guardando…',                              en: 'Saving…' },
  'dashboard.profile.saved':           { es: '¡Cambios guardados!',                     en: 'Changes saved!' },
  'dashboard.profile.error':           { es: 'Error al guardar. Intenta de nuevo.',     en: 'Error saving. Please try again.' },

  // Admin dashboard
  'admin.title':           { es: 'Panel de Administración',   en: 'Admin Dashboard' },
  'admin.backHome':        { es: 'Ir al inicio',              en: 'Back home' },
  'admin.orders':          { es: 'Pedidos',                   en: 'Orders' },
  'admin.customers':       { es: 'Clientes',                  en: 'Customers' },
  'admin.newsletter':      { es: 'Newsletter',                en: 'Newsletter' },
  'admin.noOrders':        { es: 'Sin pedidos todavía',       en: 'No orders yet' },
  'admin.noCustomers':     { es: 'Sin clientes todavía',      en: 'No customers yet' },
  'admin.noSubscribers':   { es: 'Sin suscriptores todavía',  en: 'No subscribers yet' },
  'admin.addTracking':     { es: 'Agregar tracking',          en: 'Add tracking' },
  'admin.addTrackingTitle':{ es: 'Agregar número de rastreo', en: 'Add tracking number' },
  'admin.trackingNumber':  { es: 'Número de rastreo',         en: 'Tracking number' },
  'admin.trackingUrl':     { es: 'URL de rastreo (opcional)', en: 'Tracking URL (optional)' },
  'admin.trackingNotes':   { es: 'Notas (opcional)',           en: 'Notes (optional)' },
  'admin.save':            { es: 'Guardar',                   en: 'Save' },
  'admin.cancel':          { es: 'Cancelar',                  en: 'Cancel' },
  'admin.name':            { es: 'Nombre',                    en: 'Name' },
  'admin.email':           { es: 'Correo',                    en: 'Email' },
  'admin.phone':           { es: 'Teléfono',                  en: 'Phone' },
  'admin.joined':          { es: 'Se unió',                   en: 'Joined' },
  'admin.actions':         { es: 'Acciones',                  en: 'Actions' },
  'admin.confirmed':       { es: 'Confirmado',                en: 'Confirmed' },
  'admin.yes':             { es: 'Sí',                        en: 'Yes' },
  'admin.no':              { es: 'No',                        en: 'No' },
  'admin.pending':         { es: 'Pendiente',                 en: 'Pending' },
  'admin.date':            { es: 'Fecha',                     en: 'Date' },
  'admin.language':        { es: 'Idioma',                    en: 'Language' },
  'admin.exportCSV':       { es: 'Descargar CSV',             en: 'Download CSV' },
  'admin.confirmEmailSuccess': { es: 'Email confirmado correctamente', en: 'Email confirmed successfully' },
  'admin.confirmEmailError':   { es: 'Error al confirmar el email', en: 'Error confirming email' },

  // ── Pricing & Tax ──────────────────────────────────────────────────────────
  'checkout.subtotal':  { es: 'Subtotal (sin IVA)', en: 'Subtotal (excl. tax)' },
  'checkout.tax':       { es: 'IVA 16%', en: 'VAT 16%' },
  'checkout.totalWith': { es: 'Total', en: 'Total' },

  // Post-checkout account prompt
  'success.createAccount':     { es: '¿Deseas guardar tu compra?',                                                               en: 'Want to save your purchase?' },
  'success.createAccountDesc': { es: 'Crea una cuenta en segundos con el correo de tu compra y rastrea tu pedido fácilmente.',   en: 'Create an account in seconds using your purchase email to track your order.' },
  'success.setPassword':       { es: 'Elige una contraseña',                                                                      en: 'Choose a password' },
  'success.createAccountBtn':  { es: 'Crear mi cuenta',                                                                           en: 'Create my account' },
  'success.accountCreated':    { es: '¡Cuenta creada! Revisa tu correo para verificarla.',                                        en: 'Account created! Check your email to verify it.' },

  // ── Newsletter ─────────────────────────────────────────────────────────────
  'newsletter.title':                { es: '¿Quieres dormir mejor?',                        en: 'Want to sleep better?' },
  'newsletter.subtitle':             { es: 'Suscríbete para recibir consejos y ofertas',   en: 'Subscribe for tips and exclusive offers' },
  'newsletter.namePlaceholder':      { es: 'Tu nombre (opcional)',                          en: 'Your name (optional)' },
  'newsletter.emailPlaceholder':     { es: 'tu@correo.com',                               en: 'you@email.com' },
  'newsletter.optInLabel':           { es: 'Acepto recibir correos de Duerme.cool',        en: 'I agree to receive emails from Duerme.cool' },
  'newsletter.submitBtn':            { es: 'Suscribirme',                                  en: 'Subscribe' },
  'newsletter.submitting':           { es: 'Enviando…',                                   en: 'Sending…' },
  'newsletter.successTitle':         { es: '¡Casi listo!',                                en: 'Almost done!' },
  'newsletter.successDesc':          { es: 'Revisa tu correo y confirma tu suscripción',  en: 'Check your email and confirm your subscription' },
  'newsletter.errorGeneric':         { es: 'Algo salió mal. Inténtalo de nuevo.',          en: 'Something went wrong. Please try again.' },
  'newsletter.confirm.loading':      { es: 'Confirmando suscripción…',                    en: 'Confirming subscription…' },
  'newsletter.confirm.successTitle': { es: '¡Suscripción confirmada!',                    en: 'Subscription confirmed!' },
  'newsletter.confirm.successDesc':  { es: 'Ya eres parte de la comunidad Duerme.cool',   en: 'You are now part of the Duerme.cool community' },
  'newsletter.confirm.errorTitle':   { es: 'Enlace no válido',                             en: 'Invalid link' },
  'newsletter.confirm.errorDesc':    { es: 'Este enlace ya fue usado o expiró.',           en: 'This link has already been used or has expired.' },
  'newsletter.confirm.cta':          { es: 'Ver productos',                               en: 'View products' },
  'newsletter.optInRequired':        { es: 'Debes aceptar para suscribirte',               en: 'You must agree to subscribe' },

  // ── Coupon system ──────────────────────────────────────────────────────────
  'coupon.label':                    { es: 'Código de descuento',                          en: 'Discount code' },
  'coupon.placeholder':              { es: 'INGRESA TU CÓDIGO',                            en: 'ENTER CODE' },
  'coupon.apply':                    { es: 'Aplicar',                                      en: 'Apply' },
  'coupon.remove':                   { es: 'Eliminar cupón',                               en: 'Remove coupon' },
  'coupon.discount':                 { es: 'Descuento',                                    en: 'Discount' },
  'coupon.emailRequired':            { es: 'Ingresa tu correo primero',                    en: 'Please enter your email first' },
  'coupon.error.notFound':           { es: 'Código no encontrado',                         en: 'Code not found' },
  'coupon.error.expired':            { es: 'Este código ha expirado',                      en: 'This code has expired' },
  'coupon.error.usedUp':             { es: 'Este código ya no está disponible',            en: 'This code is no longer available' },
  'coupon.error.notEligible':        { es: 'Este código no aplica para tu correo',         en: 'This code does not apply to your email' },
  'coupon.error.belowMinimum':       { es: 'El pedido no alcanza el mínimo requerido',     en: 'Order does not meet the minimum required' },
  'coupon.error.exceedsMaxDiscount': { es: 'El descuento es demasiado grande (mínimo $10)', en: 'Discount is too large (minimum $10)' },
  'coupon.error.serverError':        { es: 'Error al validar el código',                   en: 'Error validating code' },

  // ── Admin — coupons tab ────────────────────────────────────────────────────
  'admin.coupon.tab':                { es: 'Cupones',                                      en: 'Coupons' },
  'admin.coupon.new':                { es: 'Nuevo cupón',                                  en: 'New coupon' },
  'admin.coupon.formTitle':          { es: 'Crear cupón',                                  en: 'Create coupon' },
  'admin.coupon.none':               { es: 'Sin cupones todavía',                          en: 'No coupons yet' },
  'admin.coupon.code':               { es: 'Código (ej. VERANO20)',                        en: 'Code (e.g. SUMMER20)' },
  'admin.coupon.description':        { es: 'Descripción (opcional)',                       en: 'Description (optional)' },
  'admin.coupon.typePercentage':     { es: 'Porcentaje (%)',                               en: 'Percentage (%)' },
  'admin.coupon.typeFixed':          { es: 'Monto fijo (MXN)',                             en: 'Fixed amount (MXN)' },
  'admin.coupon.valuePct':           { es: 'Valor (1-100)',                                en: 'Value (1-100)' },
  'admin.coupon.valueMXN':           { es: 'Valor en pesos (ej. 50)',                      en: 'Value in pesos (e.g. 50)' },
  'admin.coupon.minOrder':           { es: 'Monto mínimo de pedido (MXN)',                 en: 'Minimum order amount (MXN)' },
  'admin.coupon.targetEmail':        { es: 'Email específico (opcional)',                  en: 'Specific email (optional)' },
  'admin.coupon.maxUses':            { es: 'Usos máximos (vacío = ilimitado)',             en: 'Max uses (empty = unlimited)' },
  'admin.coupon.active':             { es: 'Activo',                                       en: 'Active' },
  'admin.coupon.inactive':           { es: 'Inactivo',                                     en: 'Inactive' },
  'admin.coupon.activate':           { es: 'Activar',                                      en: 'Activate' },
  'admin.coupon.deactivate':         { es: 'Desactivar',                                   en: 'Deactivate' },
  'admin.coupon.delete':             { es: 'Eliminar',                                     en: 'Delete' },
  'admin.coupon.deleteConfirm':      { es: '¿Eliminar este cupón?',                        en: 'Delete this coupon?' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
