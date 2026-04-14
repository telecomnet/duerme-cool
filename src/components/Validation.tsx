import React from 'react';
import { Award, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Validation = () => {
  const { t } = useLanguage();

  const validations = [
    {
      icon: Award,
      titleKey: 'validation.v1.title',
      pointKeys: ['validation.v1.p1', 'validation.v1.p2', 'validation.v1.p3', 'validation.v1.p4'],
    },
    {
      icon: Shield,
      titleKey: 'validation.v2.title',
      pointKeys: ['validation.v2.p1', 'validation.v2.p2', 'validation.v2.p3', 'validation.v2.p4'],
    },
  ];

  const stats = [
    { value: '92%', labelKey: 'validation.stat1' },
    { value: '15+', labelKey: 'validation.stat2' },
    { value: '5', labelKey: 'validation.stat3' },
    { value: '24/7', labelKey: 'validation.stat4' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('validation.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('validation.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {validations.map((validation, index) => {
            const Icon = validation.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mr-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t(validation.titleKey)}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {validation.pointKeys.map((pointKey, pointIndex) => (
                    <li key={pointIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700">{t(pointKey)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Validation;