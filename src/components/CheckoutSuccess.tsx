import React, { useEffect, useState, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, ShoppingBag, Package, Mail, Lock, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { t } = useLanguage();
  const { user, signUp } = useAuth();

  const status = searchParams.get('redirect_status');
  const paymentIntentId = searchParams.get('payment_intent');
  const isSuccess = status === 'succeeded';

  // Post-purchase account creation state
  const prefillEmail = sessionStorage.getItem('checkout_email') ?? ''
  const [acctPassword, setAcctPassword] = useState('')
  const [acctLoading, setAcctLoading]   = useState(false)
  const [acctDone, setAcctDone]         = useState(false)
  const [acctError, setAcctError]       = useState('')

  const handleCreateAccount = async (e: FormEvent) => {
    e.preventDefault()
    if (acctPassword.length < 8) { setAcctError(t('auth.passwordMinLength')); return }
    setAcctLoading(true); setAcctError('')
    const { error } = await signUp(prefillEmail, acctPassword, '')
    if (error) setAcctError(error)
    else { setAcctDone(true); sessionStorage.removeItem('checkout_email') }
    setAcctLoading(false)
  }

  // Clear cart once on successful payment
  useEffect(() => {
    if (isSuccess) clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isSuccess) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">

          {/* Animated checkmark */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200/60">
              <CheckCircle className="h-14 w-14 text-white" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">{t('success.title')}</h1>
          <p className="text-gray-600 text-lg mb-8">{t('success.subtitle')}</p>

          {/* Info cards */}
          <div className="space-y-3 mb-8 text-left">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{t('success.emailNotice')}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{t('success.shippingNotice')}</p>
            </div>
          </div>

          {/* Order reference */}
          {paymentIntentId && (
            <p className="text-xs text-gray-400 mb-8">
              {t('success.orderRef')}:{' '}
              <span className="font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">
                {paymentIntentId.slice(-10).toUpperCase()}
              </span>
            </p>
          )}

          <Link
            to="/tienda"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 hover:shadow-xl hover:scale-[1.02] transform"
          >
            <ShoppingBag className="h-5 w-5" />
            {t('success.continueShopping')}
          </Link>

          {/* ── Post-purchase account creation ── */}
          {!user && prefillEmail && (
            <div className="mt-6 w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-left">
              {acctDone ? (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-800">{t('success.accountCreated')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t('success.createAccount')}</p>
                      <p className="text-xs text-gray-500">{t('success.createAccountDesc')}</p>
                    </div>
                  </div>
                  <form onSubmit={handleCreateAccount} className="space-y-3">
                    <div className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      {prefillEmail}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password" required minLength={8}
                        value={acctPassword} onChange={(e) => setAcctPassword(e.target.value)}
                        placeholder={t('success.setPassword')}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {acctError && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2">{acctError}</p>}
                    <button type="submit" disabled={acctLoading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60">
                      {acctLoading
                        ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : t('success.createAccountBtn')}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Failed or unexpected status
  return (
    <section className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-28 h-28 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-200/60">
          <XCircle className="h-14 w-14 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{t('success.failed.title')}</h1>
        <p className="text-gray-600 text-lg mb-8">{t('success.failed.subtitle')}</p>
        <Link
          to="/checkout"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:scale-[1.02] transform"
        >
          {t('success.failed.retry')}
        </Link>
      </div>
    </section>
  );
};

export default CheckoutSuccess;
