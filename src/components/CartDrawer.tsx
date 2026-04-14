import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price); 1


  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white z-[70] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{t('cart.title')}</h2>
            {totalItems > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">{t('cart.empty')}</p>
              <p className="text-sm text-gray-500 mb-6">{t('cart.emptySubtitle')}</p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/tienda');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                {t('cart.browseProd')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-gray-50 rounded-2xl p-4 group hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={t(item.nameKey)}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{t(item.nameKey)}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{item.size}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
            {/* Price breakdown with IVA */}
            <div className="space-y-2.5 mb-5 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('checkout.subtotal')}</span>
                <span className="text-gray-900 font-medium">{formatPrice(Math.round(totalPrice / 1.16))}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('checkout.tax')}</span>
                <span className="text-gray-900 font-medium">{formatPrice(Math.round(totalPrice - (totalPrice / 1.16)))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{t('checkout.totalWith')}</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">{t('cart.shippingNote')}</p>

            {/* Checkout button */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.01]"
            >
              {t('cart.checkout')}
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* Continue shopping */}
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full mt-3 py-3 text-gray-600 font-medium text-sm hover:text-blue-600 transition-colors"
            >
              {t('toast.continueShopping')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
