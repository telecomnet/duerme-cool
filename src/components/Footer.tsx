import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import NewsletterForm from './NewsletterForm';

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
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.specs')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.warranty')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.supportTitle')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#preguntas" className="hover:text-white transition-colors">{t('footer.faq')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.installation')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.maintenance')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
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

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2026 duerme.cool. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;