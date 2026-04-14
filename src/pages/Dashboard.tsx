import React, { useEffect, useState, FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  Package, ChevronDown, ChevronUp, MapPin, Truck,
  ArrowLeft, User, Bell, BellOff, Check, Clock,
  CreditCard, ShoppingBag,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

// ── Types ─────────────────────────────────────────────────────────────────────
type DashTab = 'orders' | 'profile'

interface CustomerProfile {
  full_name: string
  phone: string
  preferred_language: string
  newsletter_opt_in: boolean
}

interface TrackingRow {
  tracking_number: string
  carrier: string
  tracking_url: string | null
  notes: string | null
  added_at: string
}

interface ShippingRow {
  nombre_completo: string
  calle: string
  colonia: string | null
  ciudad: string
  estado: string
  cp: string
  pais: string
}

interface OrderRow {
  id: string
  order_number: string
  status: string
  total_amount: number
  currency: string
  created_at: string
  stripe_payment_intent_id: string
  items: Array<{ id?: string; size: string; price: number; quantity: number }>
  tracking: TrackingRow[]
  shipping_addresses: ShippingRow[]
}

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUSES = ['pending', 'paid', 'shipped', 'delivered'] as const
type StatusKey = typeof STATUSES[number]

const STATUS_META: Record<StatusKey, { color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { color: 'text-amber-700',  bg: 'bg-amber-100',  icon: <Clock className="h-3.5 w-3.5" /> },
  paid:      { color: 'text-blue-700',   bg: 'bg-blue-100',   icon: <CreditCard className="h-3.5 w-3.5" /> },
  shipped:   { color: 'text-purple-700', bg: 'bg-purple-100', icon: <Truck className="h-3.5 w-3.5" /> },
  delivered: { color: 'text-green-700',  bg: 'bg-green-100',  icon: <ShoppingBag className="h-3.5 w-3.5" /> },
}

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const meta = STATUS_META[status as StatusKey] ?? { color: 'text-gray-600', bg: 'bg-gray-100', icon: null }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${meta.bg} ${meta.color}`}>
      {meta.icon}
      {t(`dashboard.status.${status}`) || status}
    </span>
  )
}

/** Linear progress stepper showing where the order currently is */
function StatusProgress({ status, t }: { status: string; t: (k: string) => string }) {
  const currentIdx = STATUSES.indexOf(status as StatusKey)
  return (
    <div className="flex items-center gap-0 mt-4 mb-1">
      {STATUSES.map((s, i) => {
        const done    = i <= currentIdx
        const active  = i === currentIdx
        const isLast  = i === STATUSES.length - 1
        const meta    = STATUS_META[s]
        return (
          <React.Fragment key={s}>
            {/* Step dot */}
            <div className="flex flex-col items-center" style={{ minWidth: 0, flex: '0 0 auto' }}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                done
                  ? `${meta.bg} ${meta.color} border-current`
                  : 'bg-gray-100 text-gray-300 border-gray-200'
              } ${active ? 'ring-2 ring-offset-2 ring-blue-300' : ''}`}>
                {done ? <Check className="h-3.5 w-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </div>
              <span className={`text-[9px] font-semibold mt-1 leading-tight text-center max-w-[52px] ${done ? meta.color : 'text-gray-300'}`}>
                {t(`dashboard.status.${s}`)}
              </span>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all ${i < currentIdx ? 'bg-blue-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Number formatter ──────────────────────────────────────────────────────────
const fmtMXN = (cents: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(cents / 100)

// ── Main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [tab, setTab] = useState<DashTab>('orders')

  // Orders state
  const [orders, setOrders]   = useState<OrderRow[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Profile state
  const [profile, setProfile] = useState<CustomerProfile>({
    full_name: user?.fullName ?? '',
    phone: '',
    preferred_language: language,
    newsletter_opt_in: false,
  })
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Redirect if somehow rendered without auth
  if (!user) return <Navigate to="/" replace />

  // ── Load orders ─────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('orders')
      .select(`
        id, order_number, status, total_amount, currency,
        created_at, stripe_payment_intent_id, items,
        tracking ( tracking_number, carrier, tracking_url, notes, added_at ),
        shipping_addresses ( nombre_completo, calle, colonia, ciudad, estado, cp, pais )
      `)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setOrders(data as OrderRow[])
        setLoadingOrders(false)
      })
  }, [])

  // ── Load profile ─────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('customers')
      .select('full_name, phone, preferred_language, newsletter_opt_in')
      .eq('email', user.email)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            full_name:          data.full_name ?? '',
            phone:              data.phone ?? '',
            preferred_language: data.preferred_language ?? language,
            newsletter_opt_in:  data.newsletter_opt_in ?? false,
          })
        }
        setLoadingProfile(false)
      })
  }, [user.email])

  // ── Save profile ─────────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setSaveState('saving')
    const { error } = await supabase
      .from('customers')
      .update({
        full_name:          profile.full_name,
        phone:              profile.phone || null,
        preferred_language: profile.preferred_language,
        newsletter_opt_in:  profile.newsletter_opt_in,
      })
      .eq('email', user.email)

    if (!error) {
      // Keep auth metadata in sync so the header avatar updates
      await supabase.auth.updateUser({ data: { full_name: profile.full_name } })

      // Sync newsletter opt-in with newsletter_subscribers (fire-and-forget)
      if (profile.newsletter_opt_in) {
        supabase.functions.invoke('newsletter-subscribe', {
          body: {
            name: profile.full_name,
            email: user.email,
            language: profile.preferred_language,
          },
        }).catch((err) => console.warn('Newsletter sync:', err))
      }

      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 3000)
    } else {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 4000)
    }
  }

  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat(language === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(d))

  const initials = profile.full_name
    ? profile.full_name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link to="/tienda" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('dashboard.backToShop')}
        </Link>

        {/* User identity card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-200/50 flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-lg leading-tight truncate">
              {profile.full_name || t('dashboard.tab.profile')}
            </p>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 w-fit">
          {(['orders', 'profile'] as DashTab[]).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {id === 'orders' ? <Package className="h-4 w-4" /> : <User className="h-4 w-4" />}
              {t(`dashboard.tab.${id}`)}
            </button>
          ))}
        </div>

        {/* ══ ORDERS TAB ══════════════════════════════════════════════════════ */}
        {tab === 'orders' && (
          <>
            {loadingOrders && (
              <div className="flex justify-center py-20">
                <span className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              </div>
            )}

            {!loadingOrders && orders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="font-semibold text-gray-500 mb-2">{t('dashboard.noOrders')}</p>
                <Link to="/tienda"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                  {t('dashboard.shopNow')}
                </Link>
              </div>
            )}

            <div className="space-y-4">
              {orders.map((order) => {
                const isOpen   = expanded === order.id
                const tracking = order.tracking?.[0]
                const shipping = order.shipping_addresses?.[0]
                const piRef    = order.stripe_payment_intent_id?.slice(-8).toUpperCase() ?? '—'

                return (
                  <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* ── Order header ─────────────────────────────────────── */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="w-full px-6 pt-6 pb-4 hover:bg-gray-50/40 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left: number + date */}
                        <div>
                          <p className="font-bold text-gray-900 text-base">{order.order_number}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.created_at)}</p>
                        </div>
                        {/* Right: status + total + chevron */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <StatusBadge status={order.status} t={t} />
                          <span className="font-bold text-gray-900">{fmtMXN(order.total_amount)}</span>
                          {isOpen
                            ? <ChevronUp className="h-4 w-4 text-gray-400" />
                            : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>

                      {/* Payment ref */}
                      <p className="text-xs text-gray-400 mt-2">
                        {t('dashboard.paymentRef')}:{' '}
                        <span className="font-mono font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {piRef}
                        </span>
                      </p>

                      {/* Status progress stepper */}
                      <StatusProgress status={order.status} t={t} />
                    </button>

                    {/* ── Expanded detail ───────────────────────────────────── */}
                    {isOpen && (
                      <div className="border-t border-gray-100 px-6 pb-6 pt-5 space-y-5">

                        {/* Products */}
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                            {t('dashboard.items')}
                          </p>
                          <div className="space-y-2">
                            {(order.items ?? []).map((item, i) => (
                              <div key={i} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    Cover Duerme.cool — {item.size}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {t('dashboard.qty')}: {item.quantity}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-gray-900">
                                  {fmtMXN(item.price * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tracking */}
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                            {t('dashboard.tracking')}
                          </p>
                          {tracking ? (
                            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                              <Truck className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{tracking.carrier}</p>
                                <p className="text-sm text-gray-600 font-mono mt-0.5">{tracking.tracking_number}</p>
                                {tracking.tracking_url && (
                                  <a href={tracking.tracking_url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline mt-1.5 font-semibold">
                                    {t('dashboard.trackingLink')} →
                                  </a>
                                )}
                                {tracking.notes && (
                                  <p className="text-xs text-gray-500 mt-1.5">{tracking.notes}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl text-sm text-gray-400 border border-gray-100">
                              <Truck className="h-4 w-4 text-gray-300 flex-shrink-0" />
                              {t('dashboard.noTracking')}
                            </div>
                          )}
                        </div>

                        {/* Shipping address */}
                        {shipping && (
                          <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                              {t('dashboard.shippingAddress')}
                            </p>
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                              <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <address className="not-italic text-sm text-gray-700 leading-relaxed">
                                <span className="font-semibold">{shipping.nombre_completo}</span><br />
                                {shipping.calle}{shipping.colonia ? `, ${shipping.colonia}` : ''}<br />
                                {shipping.ciudad}, {shipping.estado} {shipping.cp}<br />
                                {shipping.pais === 'MX' ? 'México' : shipping.pais}
                              </address>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ══ PROFILE TAB ═════════════════════════════════════════════════════ */}
        {tab === 'profile' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">{t('dashboard.profile.title')}</h2>

            {loadingProfile ? (
              <div className="flex justify-center py-10">
                <span className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5">

                {/* Full name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t('dashboard.profile.name')}
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email" readOnly value={user.email}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t('dashboard.profile.phone')}
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder={t('dashboard.profile.phonePlaceholder')}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Preferred language */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t('dashboard.profile.language')}
                  </label>
                  <div className="flex gap-3">
                    {(['es', 'en'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setProfile((p) => ({ ...p, preferred_language: lang }))}
                        className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          profile.preferred_language === lang
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {lang === 'es' ? `🇲🇽 ${t('dashboard.profile.langEs')}` : `🇺🇸 ${t('dashboard.profile.langEn')}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Newsletter toggle */}
                <label className="flex items-start gap-4 cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 transition-all">
                  {/* Custom toggle */}
                  <div className="mt-0.5 flex-shrink-0" onClick={() => setProfile((p) => ({ ...p, newsletter_opt_in: !p.newsletter_opt_in }))}>
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${profile.newsletter_opt_in ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.newsletter_opt_in ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {profile.newsletter_opt_in
                        ? <Bell className="h-4 w-4 text-blue-600" />
                        : <BellOff className="h-4 w-4 text-gray-400" />}
                      {t('dashboard.profile.newsletter')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{t('dashboard.profile.newsletterDesc')}</p>
                  </div>
                </label>

                {/* Save button */}
                <button
                  type="submit"
                  disabled={saveState === 'saving'}
                  className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    saveState === 'saved'
                      ? 'bg-green-500 text-white'
                      : saveState === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200/50'
                  } disabled:opacity-60`}
                >
                  {saveState === 'saving' && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {saveState === 'saved'  && <Check className="h-4 w-4" />}
                  {saveState === 'saving' ? t('dashboard.profile.saving')
                    : saveState === 'saved'  ? t('dashboard.profile.saved')
                    : saveState === 'error'  ? t('dashboard.profile.error')
                    : t('dashboard.profile.save')}
                </button>

              </form>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
