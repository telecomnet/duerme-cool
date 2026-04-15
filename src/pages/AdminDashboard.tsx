import { useEffect, useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, Mail, Truck, X, Check,
  ChevronDown, ChevronUp, ArrowLeft, Plus, Download, AlertCircle, Shield, CheckCircle2,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

type AdminTab = 'orders' | 'customers' | 'newsletter'

interface Customer {
  id: string; email: string; full_name: string | null
  phone: string | null; created_at: string
}

interface Subscriber {
  id: string; email: string; name: string | null
  confirmed: boolean; subscribed_at: string; preferred_language: string
}

interface OrderRow {
  id: string; order_number: string; status: string
  total_amount: number; created_at: string; stripe_payment_intent_id: string
  items: Array<{ size: string; price: number; quantity: number }>
  customers: { full_name: string | null; email: string } | null
  tracking: Array<{ tracking_number: string; carrier: string; tracking_url: string | null }>
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  paid:      'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
}

const CARRIERS = ['DHL', 'FedEx', 'Estafeta', 'UPS', 'Correos de México', 'J&T Express', 'Otra']

export default function AdminDashboard() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [tab, setTab] = useState<AdminTab>('orders')
  const [orders, setOrders]   = useState<OrderRow[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Tracking form state
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null)
  const [trackingNum, setTrackingNum]     = useState('')
  const [carrier, setCarrier]             = useState('DHL')
  const [trackingUrl, setTrackingUrl]     = useState('')
  const [trackingNotes, setTrackingNotes] = useState('')
  const [savingTracking, setSavingTracking] = useState(false)
  const [trackingError, setTrackingError] = useState('')

  // Email confirmation state
  const [confirmingEmail, setConfirmingEmail] = useState<string | null>(null)
  const [confirmEmailMsg, setConfirmEmailMsg] = useState('')
  const [confirmEmailType, setConfirmEmailType] = useState<'success' | 'error' | null>(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [o, c, s] = await Promise.all([
      supabase
        .from('orders')
        .select(`
          id, order_number, status, total_amount, created_at, stripe_payment_intent_id, items,
          customers ( full_name, email ),
          tracking ( tracking_number, carrier, tracking_url )
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('customers')
        .select('id, email, full_name, phone, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('newsletter_subscribers')
        .select('id, email, name, confirmed, subscribed_at, preferred_language')
        .order('subscribed_at', { ascending: false }),
    ])
    if (o.data)  setOrders(o.data as OrderRow[])
    if (c.data)  setCustomers(c.data as Customer[])
    if (s.data)  setSubscribers(s.data as Subscriber[])
    setLoading(false)
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter && order.status !== statusFilter) return false
    if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) return false
    if (dateTo) {
      const to = new Date(dateTo)
      to.setDate(to.getDate() + 1)
      if (new Date(order.created_at) >= to) return false
    }
    return true
  })

  async function handleAddTracking(orderId: string) {
    if (!trackingNum.trim()) return
    setSavingTracking(true)
    setTrackingError('')

    // 1. Update tracking table
    const { error: trackingErr } = await supabase.from('tracking').insert({
      order_id:       orderId,
      tracking_number: trackingNum.trim(),
      carrier,
      tracking_url:   trackingUrl.trim() || null,
      notes:          trackingNotes.trim() || null,
      added_by_admin: user!.id,
    })

    if (trackingErr) {
      setTrackingError(trackingErr.message)
      setSavingTracking(false)
      return
    }

    // 2. Update order status to shipped
    await supabase.from('orders').update({ status: 'shipped' }).eq('id', orderId)

    // 3. Send tracking email
    try {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-tracking-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              order_id: orderId,
              tracking_number: trackingNum.trim(),
              carrier,
              tracking_url: trackingUrl.trim() || null,
              language,
            }),
          }
        )
      }
    } catch (err) {
      console.error('Failed to send tracking email:', err)
    }

    // Reset and reload
    setTrackingOrder(null)
    setTrackingNum(''); setTrackingUrl(''); setTrackingNotes('')
    setSavingTracking(false)
    loadAll()
  }

  // CSV export
  const exportCSV = () => {
    const headers = [t('admin.email'), t('admin.name'), t('admin.language'), t('admin.confirmed'), t('admin.date')]
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.name ?? ''}"`,
      s.preferred_language.toUpperCase(),
      s.confirmed ? t('admin.yes') : t('admin.no'),
      new Date(s.subscribed_at).toLocaleDateString(),
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Confirm user email (promote to verified)
  const handleConfirmEmail = async (customerId: string) => {
    setConfirmingEmail(customerId)
    setConfirmEmailMsg('')
    setConfirmEmailType(null)

    try {
      const adminSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      )

      const { error } = await adminSupabase.auth.admin.updateUserById(
        customerId,
        { email_confirmed_at: new Date().toISOString() }
      )

      if (error) {
        setConfirmEmailMsg(t('admin.confirmEmailError'))
        setConfirmEmailType('error')
        console.error('Confirm email error:', error)
      } else {
        setConfirmEmailMsg(t('admin.confirmEmailSuccess'))
        setConfirmEmailType('success')
        // Reload customers after 2 seconds
        setTimeout(() => {
          loadAll()
          setConfirmingEmail(null)
          setConfirmEmailMsg('')
          setConfirmEmailType(null)
        }, 2000)
      }
    } catch (err) {
      setConfirmEmailMsg(t('admin.confirmEmailError'))
      setConfirmEmailType('error')
      console.error('Confirm email error:', err)
      setConfirmingEmail(null)
    }
  }

  const fmtMXN = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(cents / 100)

  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))

  const tabs: { id: AdminTab; label: string; icon: any; count?: number }[] = [
    { id: 'orders',     label: t('admin.orders'),      icon: <Package className="h-4 w-4" />,        count: filteredOrders.length },
    { id: 'customers',  label: t('admin.customers'),   icon: <Users className="h-4 w-4" />,           count: customers.length },
    { id: 'newsletter', label: t('admin.newsletter'),  icon: <Mail className="h-4 w-4" />,            count: subscribers.filter(s => s.confirmed).length },
  ]

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('admin.backHome')}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
            <p className="text-sm text-gray-500">duerme.cool</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === tb.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tb.icon}
              {tb.label}
              {tb.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  tab === tb.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tb.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Toast notification for email confirmation */}
        {confirmEmailMsg && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${
            confirmEmailType === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {confirmEmailType === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{confirmEmailMsg}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {!loading && tab === 'orders' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <select
                  value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">{t('admin.allStatuses')}</option>
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Desde</label>
                <input
                  type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Hasta</label>
                <input
                  type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <button onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo('') }}
                className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                {t('admin.clearFilters')}
              </button>
            </div>

            <div className="space-y-3">
              {filteredOrders.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                  <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">{t('admin.noOrders')}</p>
                </div>
              )}

              {filteredOrders.map((order) => {
                const isExpanded = expanded === order.id
                const hasTracking = order.tracking?.length > 0
                const piRef = order.stripe_payment_intent_id?.slice(-8).toUpperCase() ?? '—'

                return (
                  <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                        className="flex items-center gap-4 flex-1 text-left"
                      >
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2">
                            {order.order_number}
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {t(`dashboard.status.${order.status}`) || order.status}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.customers?.full_name ?? '—'} · {order.customers?.email ?? '—'}
                          </p>
                          <p className="text-xs text-gray-300 mt-1">PI: {piRef}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-sm">{fmtMXN(order.total_amount)}</span>
                        <span className="text-xs text-gray-400">{fmtDate(order.created_at)}</span>
                        {!hasTracking && (
                          <button
                            onClick={() => setTrackingOrder(trackingOrder === order.id ? null : order.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" /> {t('admin.addTracking')}
                          </button>
                        )}
                        {hasTracking && (
                          <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold">
                            <Truck className="h-3.5 w-3.5" /> {order.tracking[0].tracking_number}
                          </div>
                        )}
                        <button onClick={() => setExpanded(isExpanded ? null : order.id)} className="text-gray-400">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Tracking form */}
                    {trackingOrder === order.id && (
                      <div className="border-t border-gray-100 px-6 py-5 bg-purple-50/50">
                        <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-purple-600" /> {t('admin.addTrackingTitle')}
                        </p>
                        {trackingError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <p className="text-xs text-red-600">{trackingError}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input
                            value={trackingNum} onChange={(e) => setTrackingNum(e.target.value)}
                            placeholder={t('admin.trackingNumber')}
                            className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <select
                            value={carrier} onChange={(e) => setCarrier(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          >
                            {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input
                            value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)}
                            placeholder={t('admin.trackingUrl')}
                            className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 col-span-2"
                          />
                          <input
                            value={trackingNotes} onChange={(e) => setTrackingNotes(e.target.value)}
                            placeholder={t('admin.trackingNotes')}
                            className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 col-span-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddTracking(order.id)}
                            disabled={savingTracking || !trackingNum.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                          >
                            {savingTracking
                              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <><Check className="h-4 w-4" /> {t('admin.save')}</>}
                          </button>
                          <button onClick={() => setTrackingOrder(null)}
                            className="flex items-center gap-1 px-4 py-2.5 bg-white text-gray-600 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                            <X className="h-4 w-4" /> {t('admin.cancel')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Order detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/30">
                        <div className="space-y-2">
                          {(order.items ?? []).map((item, i) => (
                            <div key={i} className="flex justify-between text-sm py-1">
                              <span className="text-gray-700">Cover {item.size} × {item.quantity}</span>
                              <span className="font-semibold text-gray-900">{fmtMXN(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ══ CUSTOMERS ══ */}
        {!loading && tab === 'customers' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {customers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">{t('admin.noCustomers')}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[t('admin.name'), t('admin.email'), t('admin.phone'), t('admin.joined'), t('admin.actions')].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">{c.full_name ?? '—'}</td>
                      <td className="px-5 py-4 text-gray-600">{c.email}</td>
                      <td className="px-5 py-4 text-gray-500">{c.phone ?? '—'}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{fmtDate(c.created_at)}</td>
                      <td className="px-5 py-4 flex gap-2">
                        <button
                          onClick={() => handleConfirmEmail(c.id)}
                          disabled={confirmingEmail === c.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {confirmingEmail === c.id ? (
                            <>
                              <Mail className="h-3.5 w-3.5 animate-spin" />
                              {language === 'es' ? 'Confirmando...' : 'Confirming...'}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {language === 'es' ? 'Confirmar email' : 'Confirm email'}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ══ NEWSLETTER ══ */}
        {!loading && tab === 'newsletter' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {subscribers.length === 0 ? (
              <div className="text-center py-16">
                <Mail className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">{t('admin.noSubscribers')}</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-end">
                  <button onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                    <Download className="h-4 w-4" /> {t('admin.exportCSV')}
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {[t('admin.email'), t('admin.name'), t('admin.confirmed'), t('admin.language'), t('admin.date')].map((h) => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {subscribers.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 text-gray-700">{s.email}</td>
                        <td className="px-5 py-4 text-gray-500">{s.name ?? '—'}</td>
                        <td className="px-5 py-4">
                          {s.confirmed
                            ? <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">✓ {t('admin.yes')}</span>
                            : <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">{t('admin.pending')}</span>}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400 uppercase">{s.preferred_language}</td>
                        <td className="px-5 py-4 text-xs text-gray-400">{fmtDate(s.subscribed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
