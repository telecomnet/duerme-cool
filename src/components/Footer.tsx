import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import NewsletterForm from './NewsletterForm';

const socials = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61578307452259',
    icon: (
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8v8.44C19.61 23.08 24 18.09 24 12.07z" />
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/duermecool/',
    icon: (
      <>
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.66-.67 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13C20.32 1.35 19.65.94 18.86.63 18.1.33 17.22.13 15.95.07 14.67.01 14.26 0 12 0z" />
        <path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
        <circle cx="18.41" cy="5.59" r="1.44" />
      </>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@duermecool?lang=es-419',
    icon: (
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    ),
  },
  {
    name: 'Pinterest',
    href: 'https://mx.pinterest.com/duermecool/',
    icon: (
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.43 7.63 11.18-.11-.95-.2-2.41.04-3.45.22-.93 1.4-5.96 1.4-5.96s-.36-.72-.36-1.78c0-1.66.97-2.9 2.17-2.9 1.02 0 1.51.77 1.51 1.69 0 1.03-.66 2.57-1 4-.28 1.2.6 2.18 1.78 2.18 2.14 0 3.78-2.26 3.78-5.51 0-2.88-2.07-4.9-5.02-4.9-3.42 0-5.43 2.57-5.43 5.22 0 1.03.4 2.14.89 2.74.1.12.11.22.08.34l-.33 1.37c-.05.22-.18.27-.41.16-1.51-.7-2.46-2.91-2.46-4.69 0-3.81 2.77-7.32 7.99-7.32 4.19 0 7.45 2.99 7.45 6.98 0 4.17-2.63 7.52-6.27 7.52-1.22 0-2.37-.64-2.77-1.39l-.75 2.87c-.27 1.05-1.01 2.36-1.5 3.16C9.57 23.82 10.76 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
    ),
  },
  {
    name: 'Telegram',
    href: 'https://t.me/DuermeCoolBot',
    icon: (
      <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z" />
    ),
  },
];

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/Duerme_cool_logo.jpeg" alt="Duerme.cool" className="h-16 w-auto" />
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              {t('footer.desc')}
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>contacto@duerme.cool</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+52 221 406 6588</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Ciudad de México, México</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.product')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#como-funciona" className="hover:text-white transition-colors">{t('footer.howItWorks')}</a></li>
              <li><a href="#beneficios" className="hover:text-white transition-colors">{t('footer.benefits')}</a></li>
              <li><a href="#beneficios" className="hover:text-white transition-colors">{t('footer.specs')}</a></li>
              <li><a href="#preguntas" className="hover:text-white transition-colors">{t('footer.warranty')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.supportTitle')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#preguntas" className="hover:text-white transition-colors">{t('footer.faq')}</a></li>
              <li><a href="#como-funciona" className="hover:text-white transition-colors">{t('footer.installation')}</a></li>
              <li><a href="#preguntas" className="hover:text-white transition-colors">{t('footer.maintenance')}</a></li>
              <li><a href="mailto:contacto@duerme.cool" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-xl font-bold text-white mb-2">{t('newsletter.title')}</h3>
            <p className="text-gray-400 text-sm mb-6">{t('newsletter.subtitle')}</p>
            <NewsletterForm />
          </div>
        </div>

        {/* Social networks + app stores */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold uppercase tracking-wide text-sm text-white">{t('footer.follow')}</span>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="text-gray-300 hover:text-white border border-gray-700 hover:border-white rounded-lg p-2 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-bold uppercase tracking-wide text-sm text-white">{t('footer.downloadApp')}</span>
            <div className="flex items-center gap-3">
              <a
                href="https://apps.apple.com/us/app/123-sleep/id6760216004"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="App Store"
                className="transition-opacity hover:opacity-80"
              >
                <img src="/app-store-badge.svg" alt="Descargar en el App Store" className="h-11 w-auto" />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=uni.app.UNI0A80499"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Play"
                className="transition-opacity hover:opacity-80"
              >
                <img src="/google-play-badge.svg" alt="Disponible en Google Play" className="h-11 w-auto" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 duerme.cool. {t('footer.rights')}</p>
          <div className="mt-3 flex justify-center gap-6 text-sm">
            <Link to="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link to="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link to="/devoluciones" className="hover:text-white transition-colors">Envíos y Devoluciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;