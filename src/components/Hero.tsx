import React from 'react';
import { Thermometer, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {t('hero.title1')}{' '}
              <span className="text-blue-600">{t('hero.title2')}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to="/tienda"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center"
              >
                {t('hero.tryNow')}
              </Link>
              <a 
                href="https://www.youtube.com/watch?v=TU_VIDEO_ID" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors text-center"
              >
                {t('hero.seeHow')}
              </a>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span>{t('hero.improvement')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="h-5 w-5 text-blue-500" />
                <span>{t('hero.precision')}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative">
              <img
                src="/hero-coolwarm.jpg"
                alt="Duerme.cool - Smart Temperature Mattress Cover"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">18°C - 40°C</div>
                    <div className="text-sm text-gray-600">{t('hero.tempRange')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{"< 20dB"}</div>
                    <div className="text-sm text-gray-600">{t('hero.silent')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
};

export default Hero;