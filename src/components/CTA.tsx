import React from 'react';
import { ArrowRight, Shield, Truck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          {t('cta.title')}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {t('cta.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/tienda"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
          >
            {t('cta.tryComfort')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            {t('cta.moreInfo')}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-white">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>{t('cta.guarantee')}</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>{t('cta.shipping')}</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Star className="h-5 w-5" />
            <span>{t('cta.support')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;