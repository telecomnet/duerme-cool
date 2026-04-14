import React from 'react';
import { Settings, Ruler, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Settings,
      titleKey: 'howItWorks.step1.title',
      subtitleKey: 'howItWorks.step1.subtitle',
      descKey: 'howItWorks.step1.desc',
      color: 'blue',
    },
    {
      icon: Ruler,
      titleKey: 'howItWorks.step2.title',
      subtitleKey: 'howItWorks.step2.subtitle',
      descKey: 'howItWorks.step2.desc',
      color: 'indigo',
    },
    {
      icon: ShoppingCart,
      titleKey: 'howItWorks.step3.title',
      subtitleKey: 'howItWorks.step3.subtitle',
      descKey: 'howItWorks.step3.desc',
      color: 'purple',
    },
  ];

  const images = [
    { src: '/Product1.jpeg', alt: 'Smart Temperature Control' },
    { src: '/Product2.jpeg', alt: 'Duerme.cool System' },
    { src: '/Product3.jpeg', alt: 'Dual Zone Temperature' },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
          
          {/* Product Image Gallery */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-48 rounded-xl shadow-lg overflow-hidden group">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-blue-200 h-full">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${step.color}-100 mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-8 w-8 text-${step.color}-600`} />
                  </div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">
                    {t('howItWorks.step')} {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t(step.titleKey)}
                  </h3>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">
                    {t(step.subtitleKey)}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;