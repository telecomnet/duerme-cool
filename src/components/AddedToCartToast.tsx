import React, { useEffect } from 'react';
import { Check, ShoppingCart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const AddedToCartToast = () => {
  const { justAddedItem, setJustAddedItem, setIsCartOpen } = useCart();
  const { t } = useLanguage();

  useEffect(() => {
    if (justAddedItem) {
      const timer = setTimeout(() => {
        setJustAddedItem(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [justAddedItem, setJustAddedItem]);

  if (!justAddedItem) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-[340px] sm:w-[400px]">
        {/* Close button */}
        <button
          onClick={() => setJustAddedItem(null)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Success header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">{t('toast.addedToCart')}</span>
        </div>

        {/* Product preview */}
        <div className="flex gap-3 mb-5 bg-gray-50 rounded-xl p-3">
          <img
            src={justAddedItem.image}
            alt={t(justAddedItem.nameKey)}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {t(justAddedItem.nameKey)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{justAddedItem.size}</p>
            <p className="font-bold text-blue-600 text-sm mt-1">
              {formatPrice(justAddedItem.price)}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setJustAddedItem(null)}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            {t('toast.continueShopping')}
          </button>
          <button
            onClick={() => {
              setJustAddedItem(null);
              setIsCartOpen(true);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200/50"
          >
            <ShoppingCart className="h-4 w-4" />
            {t('toast.viewCart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddedToCartToast;
