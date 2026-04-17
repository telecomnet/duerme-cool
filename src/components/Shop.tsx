import React, { useState } from 'react';
import { ShoppingCart, Check, Star, Truck, Shield, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  size: string;
  image: string;
  price: number;
  badge?: string;
  badgeKey?: string;
}

const products: Product[] = [
  {
    id: 'full',
    size: 'Full',
    image: '/Product2.jpeg',
    price: 19750,
  },
  {
    id: 'queen',
    size: 'Queen',
    image: '/Product3.jpeg',
    price: 20750,
    badge: 'popular',
    badgeKey: 'shop.popular',
  },
  {
    id: 'king',
    size: 'King',
    image: '/Product1.jpeg',
    price: 21750,
    badge: 'premium',
    badgeKey: 'shop.premium',
  },
];

const Shop = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      size: product.size,
      image: product.image,
      price: product.price,
      nameKey: `shop.${product.id}.name`,
    });
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const includes = [
    { key: 'shop.controlUnit', icon: '🎛️' },
    { key: 'shop.cover', icon: '🛏️' },
    { key: 'shop.warranty', icon: '✅' },
    { key: 'shop.freeShipping', icon: '📦' },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">{t('shop.backToHome')}</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 text-center">
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
          {t('shop.title')}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {t('shop.subtitle')}
        </p>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {products.map((product, index) => {
            const isAdded = addedItems[product.id];
            const isPopular = product.badge === 'popular';
            const isPremium = product.badge === 'premium';

            return (
              <div
                key={product.id}
                className={`relative group rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${isPopular
                  ? 'bg-white ring-2 ring-blue-500 shadow-2xl shadow-blue-200/50 scale-[1.02]'
                  : 'bg-white shadow-xl hover:shadow-2xl'
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Badge */}
                {product.badgeKey && (
                  <div
                    className={`absolute top-4 right-4 z-10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isPopular
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                      }`}
                  >
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {t(product.badgeKey)}
                    </div>
                  </div>
                )}

                {/* Image Container */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={product.image}
                    alt={t(`shop.${product.id}.name`)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold text-gray-800 shadow-lg">
                      {t('shop.size')}: {product.size} — {t(`shop.${product.id}.dimensions`)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {t(`shop.${product.id}.name`)}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm mb-6 min-h-[4.5rem]">
                    {t(`shop.${product.id}.desc`)}
                  </p>

                  {/* What's Included */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      {t('shop.includes')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {includes.map((item) => (
                        <div key={item.key} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-base">{item.icon}</span>
                          <span>{t(item.key)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-gray-400 ml-1">MXN</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdded}
                      className={`w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${isAdded
                        ? 'bg-green-500 text-white'
                        : isPopular
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-300/60 transform hover:scale-[1.02]'
                          : 'bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-[1.02]'
                        }`}
                    >
                      {isAdded ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          {t('shop.addToCart')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Shield, labelKey: 'cta.guarantee' },
            { icon: Truck, labelKey: 'cta.shipping' },
            { icon: Star, labelKey: 'cta.support' },
          ].map(({ icon: Icon, labelKey }) => (
            <div
              key={labelKey}
              className="flex items-center justify-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/50"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">{t(labelKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shop;
