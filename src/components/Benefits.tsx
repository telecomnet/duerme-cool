import React from 'react';
import { Moon, Zap, Heart, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Benefits = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Moon,
      titleKey: 'benefits.benefit1.title',
      descKey: 'benefits.benefit1.desc',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Zap,
      titleKey: 'benefits.benefit2.title',
      descKey: 'benefits.benefit2.desc',
      gradient: 'from-indigo-500 to-purple-600',
    },
  ];

  const targetAudiences = [
    {
      icon: Users,
      titleKey: 'benefits.audience1.title',
      descKey: 'benefits.audience1.desc',
    },
    {
      icon: Heart,
      titleKey: 'benefits.audience2.title',
      descKey: 'benefits.audience2.desc',
    },
  ];

  return (
    <section id="beneficios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Benefits */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 h-full">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${benefit.gradient} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {t(benefit.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {t(benefit.descKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Target Audiences */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('benefits.designedForYou')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('benefits.specificSolutions')}
          </p>
          
          {/* Featured lifestyle image */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="w-full h-64 rounded-2xl shadow-xl overflow-hidden">
              <img
                src="/sleeping-woman.jpg"
                alt="Peaceful sleep with Duerme.cool"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {targetAudiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {t(audience.titleKey)}
                    </h4>
                    <p className="text-gray-600">
                      {t(audience.descKey)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;