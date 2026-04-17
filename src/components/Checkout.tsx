import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Mail, Phone, Lock, MapPin,
  Check, ShoppingBag, AlertCircle, Tag, X,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string)
  : null;

const STEPS = ['contact', 'shipping', 'payment'] as const;
type Step = typeof STEPS[number];

const mexicanStates = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila de Zaragoza',
  'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero',
  'Hidalgo', 'Jalisco', 'Michoacán de Ocampo', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
  'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas',
  'Tlaxcala', 'Veracruz de Ignacio de la Llave', 'Yucatán', 'Zacatecas',
];

// ── Interfaces ────────────────────────────────────────────────────────────────
interface ContactInfo {
  email: string;
  phone: string;
  newsletter: boolean;
}

interface ShippingInfo {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
}

interface AppliedCoupon {
  code: string;
  couponId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}

// ── Helper: input class ───────────────────────────────────────────────────────
const inputCls = (err?: boolean) =>
  `w-full px-4 py-3.5 rounded-xl border text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
  }`;

// ── Helper: form field wrapper ────────────────────────────────────────────────
const Field = ({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{error}
      </p>
    )}
  </div>
);

// ── Stripe payment form (inside <Elements>) ───────────────────────────────────
const StripePaymentForm = ({
  contact, totalPrice, formatPrice, t,
}: {
  contact: ContactInfo;
  totalPrice: number;
  formatPrice: (n: number) => string;
  t: (k: string) => string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    // Persist email so the success page can offer account creation
    sessionStorage.setItem('checkout_email', contact.email)

    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: contact.email,
      },
    });
    if (stripeErr) { setError(stripeErr.message ?? 'Error al procesar el pago'); setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.01] text-lg"
      >
        {loading
          ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
          : <><Lock className="h-5 w-5" />{t('checkout.payNow')} · {formatPrice(totalPrice)}</>}
      </button>
    </form>
  );
};

// ── Main Checkout ─────────────────────────────────────────────────────────────
const Checkout = () => {
  const { items, totalPrice } = useCart();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('contact');
  const [contact, setContact] = useState<ContactInfo>({ email: '', phone: '', newsletter: false });
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', zip: '',
  });
  const [emailError, setEmailError] = useState('');
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof ShippingInfo, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const effectiveTotal = appliedCoupon ? appliedCoupon.finalAmount / 100 : totalPrice;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n);

  const stepIndex = STEPS.indexOf(step);
  const stepLabels = [t('checkout.step1'), t('checkout.step2'), t('checkout.step3')];

  // Guard: empty cart
  if (items.length === 0) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h2>
          <p className="text-gray-500 mb-6">{t('cart.emptySubtitle')}</p>
          <Link to="/tienda" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all inline-block">
            {t('cart.browseProd')}
          </Link>
        </div>
      </section>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      setEmailError(t('checkout.emailError'));
      return;
    }
    setEmailError('');
    setStep('shipping');
  };

  const validateShipping = () => {
    const errs: Partial<Record<keyof ShippingInfo, string>> = {};
    if (!shipping.fullName.trim())     errs.fullName     = t('checkout.fieldRequired');
    if (!shipping.addressLine1.trim()) errs.addressLine1 = t('checkout.fieldRequired');
    if (!shipping.city.trim())         errs.city         = t('checkout.fieldRequired');
    if (!shipping.state)               errs.state        = t('checkout.fieldRequired');
    if (!/^\d{5}$/.test(shipping.zip)) errs.zip          = t('checkout.zipError');
    setShippingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShippingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateShipping()) return;
    setSubmitting(true);
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error('Supabase env vars not set');

      const res = await fetch(`${url}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          amount:         Math.round(effectiveTotal * 100),
          currency:       'mxn',
          contact,
          shipping,
          items:          items.map(({ id, size, price, quantity }) => ({ id, size, price, quantity })),
          language,
          couponCode:     appliedCoupon?.code     ?? null,
          discountAmount: appliedCoupon?.discountAmount ?? 0,
          originalAmount: appliedCoupon ? Math.round(totalPrice * 100) : null,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setBackendReady(true);
    } catch (err) {
      console.error('create-payment-intent failed:', err);
      setBackendReady(false);
    } finally {
      setSubmitting(false);
      setStep('payment');
    }
  };

  const handleBack = () => {
    if (step === 'payment')  { setStep('shipping'); return; }
    if (step === 'shipping') { setStep('contact');  return; }
    navigate('/tienda');
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    if (!contact.email) {
      setCouponError(t('coupon.emailRequired'));
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${url}/functions/v1/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          code:   couponInput.trim().toUpperCase(),
          email:  contact.email,
          amount: Math.round(totalPrice * 100),
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code:           couponInput.trim().toUpperCase(),
          couponId:       data.couponId,
          discountType:   data.discountType,
          discountValue:  data.discountValue,
          discountAmount: data.discountAmount,
          finalAmount:    data.finalAmount,
        });
        setCouponInput('');
      } else {
        const errorMap: Record<string, string> = {
          code_not_found: t('coupon.error.notFound'),
          expired:        t('coupon.error.expired'),
          used_up:        t('coupon.error.usedUp'),
          not_eligible:   t('coupon.error.notEligible'),
          below_minimum:  t('coupon.error.belowMinimum'),
          inactive:       t('coupon.error.notFound'),
          server_error:   t('coupon.error.serverError'),
        };
        setCouponError(errorMap[data.error] ?? t('coupon.error.notFound'));
      }
    } catch (err) {
      setCouponError(t('coupon.error.serverError'));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponInput('');
    setClientSecret(null);
    setBackendReady(null);
    if (step === 'payment') setStep('shipping');
  };

  const stripeOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: { colorPrimary: '#2563eb', borderRadius: '12px', fontFamily: 'ui-sans-serif, system-ui, sans-serif' },
    },
  } : undefined;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <button onClick={handleBack} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-8 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {step === 'contact' ? t('shop.backToHome') : t('checkout.back')}
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-5">{t('checkout.title')}</h1>

        {/* 3-step progress */}
        <div className="flex items-center gap-1 mb-10 max-w-sm">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < stepIndex ? 'bg-green-500 text-white' :
                  i === stepIndex ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {i < stepIndex ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`text-xs font-medium hidden sm:block transition-colors ${
                  i < stepIndex ? 'text-green-600' :
                  i === stepIndex ? 'text-blue-600' : 'text-gray-400'
                }`}>{stepLabels[i]}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-colors ${i < stepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Main panel ──────────────────────────────── */}
          <div className="lg:col-span-3 space-y-0">

            {/* STEP 1 — Contact */}
            {step === 'contact' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />{t('checkout.contactTitle')}
                </h2>
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <Field label={t('checkout.email')} required error={emailError}>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input type="email" value={contact.email}
                        onChange={(e) => { setContact((p) => ({ ...p, email: e.target.value })); setEmailError(''); }}
                        placeholder={t('checkout.emailPlaceholder')}
                        className={`${inputCls(!!emailError)} pl-11`} required />
                    </div>
                  </Field>

                  <Field label={t('checkout.phone')}>
                    <div className="flex items-center gap-2 mb-1.5 -mt-1">
                      <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{t('checkout.phoneOptional')}</span>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input type="tel" value={contact.phone}
                        onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                        placeholder={t('checkout.phonePlaceholder')}
                        className={`${inputCls()} pl-11`} />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">{t('checkout.phoneHint')}</p>
                  </Field>

                  {/* Newsletter */}
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 transition-all group">
                    <div className="mt-0.5 flex-shrink-0">
                      <input type="checkbox" checked={contact.newsletter}
                        onChange={(e) => setContact((p) => ({ ...p, newsletter: e.target.checked }))} className="sr-only" />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${contact.newsletter ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                        {contact.newsletter && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t('checkout.newsletter')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t('checkout.newsletterDesc')}</p>
                    </div>
                  </label>

                  <button type="submit" disabled={!contact.email}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.01]">
                    {t('checkout.continueToShipping')} <ArrowRight className="h-5 w-5" />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2 — Shipping address */}
            {step === 'shipping' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />{t('checkout.shippingTitle')}
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <Field label={t('checkout.fullName')} required error={shippingErrors.fullName}>
                    <input type="text" value={shipping.fullName}
                      onChange={(e) => setShipping((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder={t('checkout.fullNamePlaceholder')}
                      className={inputCls(!!shippingErrors.fullName)} required />
                  </Field>

                  <Field label={t('checkout.addressLine1')} required error={shippingErrors.addressLine1}>
                    <input type="text" value={shipping.addressLine1}
                      onChange={(e) => setShipping((p) => ({ ...p, addressLine1: e.target.value }))}
                      placeholder={t('checkout.addressLine1Placeholder')}
                      className={inputCls(!!shippingErrors.addressLine1)} required />
                  </Field>

                  <Field label={t('checkout.addressLine2')}>
                    <input type="text" value={shipping.addressLine2}
                      onChange={(e) => setShipping((p) => ({ ...p, addressLine2: e.target.value }))}
                      placeholder={t('checkout.addressLine2Placeholder')}
                      className={inputCls()} />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t('checkout.city')} required error={shippingErrors.city}>
                      <input type="text" value={shipping.city}
                        onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))}
                        placeholder={t('checkout.cityPlaceholder')}
                        className={inputCls(!!shippingErrors.city)} required />
                    </Field>
                    <Field label={t('checkout.zip')} required error={shippingErrors.zip}>
                      <input type="text" value={shipping.zip} maxLength={5}
                        onChange={(e) => setShipping((p) => ({ ...p, zip: e.target.value.replace(/\D/g, '') }))}
                        placeholder={t('checkout.zipPlaceholder')}
                        className={inputCls(!!shippingErrors.zip)} required />
                    </Field>
                  </div>

                  <Field label={t('checkout.state')} required error={shippingErrors.state}>
                    <select value={shipping.state}
                      onChange={(e) => setShipping((p) => ({ ...p, state: e.target.value }))}
                      className={`${inputCls(!!shippingErrors.state)} appearance-none`} required>
                      <option value="">{t('checkout.statePlaceholder')}</option>
                      {mexicanStates.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>

                  <Field label={t('checkout.country')}>
                    <input type="text" value="México" readOnly
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed" />
                  </Field>

                  <button type="submit" disabled={submitting}
                    className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.01]">
                    {submitting
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                      : <>{t('checkout.continueToPayment')} <ArrowRight className="h-5 w-5" /></>}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3 — Payment */}
            {step === 'payment' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />{t('checkout.paymentTitle')}
                </h2>

                {backendReady === false && (
                  <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">{t('checkout.setupRequired')}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{t('checkout.setupDesc')}</p>
                    <div className="bg-white rounded-xl p-4 space-y-1 text-xs font-mono text-gray-600 border border-amber-100">
                      <p className="text-gray-400"># .env</p>
                      <p>VITE_SUPABASE_URL=https://xxx.supabase.co</p>
                      <p>VITE_SUPABASE_ANON_KEY=eyJ...</p>
                      <p>VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...</p>
                    </div>
                  </div>
                )}

                {backendReady && clientSecret && stripePromise && stripeOptions && (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <StripePaymentForm contact={contact} totalPrice={effectiveTotal} formatPrice={formatPrice} t={t} />
                  </Elements>
                )}

                {backendReady === null && (
                  <div className="flex justify-center py-10">
                    <span className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin inline-block" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Order summary ────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />{t('checkout.orderSummary')}
              </h3>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={t(item.nameKey)} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{t(item.nameKey)}</p>
                      <p className="text-xs text-gray-500">{item.size}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">×{item.quantity}</span>
                        <span className="font-bold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              {!appliedCoupon ? (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('coupon.label')}</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder={t('coupon.placeholder')}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                      {couponLoading
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                        : t('coupon.apply')}
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{couponError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-green-700">{appliedCoupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                      aria-label={t('coupon.remove')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('checkout.shipping')}</span>
                  <span className="text-green-600 font-semibold">{t('checkout.shippingFree')}</span>
                </div>

                {/* Discount line */}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">
                      {t('coupon.discount')}
                      {appliedCoupon.discountType === 'percentage'
                        ? ` (${appliedCoupon.discountValue}%)`
                        : ''}
                    </span>
                    <span className="text-green-600 font-semibold">
                      -{formatPrice(appliedCoupon.discountAmount / 100)}
                    </span>
                  </div>
                )}

                {/* IVA Breakdown */}
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{t('checkout.subtotal')}</span>
                    <span className="text-gray-700 font-medium">{formatPrice(Math.round(effectiveTotal / 1.16))}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{t('checkout.tax')}</span>
                    <span className="text-gray-700 font-medium">{formatPrice(Math.round(effectiveTotal - (effectiveTotal / 1.16)))}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-gray-900">{t('checkout.total')}</span>
                  <div className="text-right">
                    <span className="font-bold text-2xl text-gray-900">{formatPrice(effectiveTotal)}</span>
                    <p className="text-xs text-gray-400">MXN</p>
                  </div>
                </div>
              </div>

              {/* Contact recap (steps 2+) */}
              {stepIndex >= 1 && contact.email && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('checkout.contactTitle')}</p>
                  <p className="text-sm text-gray-700">{contact.email}</p>
                  {contact.phone && <p className="text-sm text-gray-500">{contact.phone}</p>}
                  {contact.newsletter && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">{t('checkout.newsletterConfirm')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping recap (step 3) */}
              {stepIndex >= 2 && shipping.fullName && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('checkout.shippingTitle')}</p>
                  <p className="text-sm text-gray-700 font-medium">{shipping.fullName}</p>
                  <p className="text-sm text-gray-500">{shipping.addressLine1}{shipping.addressLine2 ? `, ${shipping.addressLine2}` : ''}</p>
                  <p className="text-sm text-gray-500">{shipping.city}, {shipping.state} {shipping.zip}</p>
                  <p className="text-sm text-gray-500">México</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                <Lock className="h-3.5 w-3.5" /><span>{t('checkout.securePayment')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
