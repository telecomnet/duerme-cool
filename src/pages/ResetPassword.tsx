import { useEffect, useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const MIN_PASSWORD = 8

type Status = 'verifying' | 'ready' | 'invalid' | 'done'

// Página a la que llega el enlace del correo de recuperación. Supabase Auth
// deja un token de recuperación en la URL; el cliente lo procesa y crea una
// sesión temporal (evento PASSWORD_RECOVERY). Con esa sesión validada
// permitimos fijar una nueva contraseña vía updatePassword (AuthContext).
export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const { t } = useLanguage()

  const [status, setStatus] = useState<Status>('verifying')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const code = new URL(window.location.href).searchParams.get('code')

    async function init() {
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled) setStatus(exErr ? 'invalid' : 'ready')
        return
      }
      const { data } = await supabase.auth.getSession()
      if (!cancelled && data.session) setStatus('ready')
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setStatus('ready')
      }
    })

    init()

    const timeout = setTimeout(async () => {
      if (cancelled) return
      const { data } = await supabase.auth.getSession()
      setStatus((prev) => (prev === 'verifying' && !data.session ? 'invalid' : prev))
    }, 4000)

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < MIN_PASSWORD) { setError(t('reset.minLength')); return }
    if (password !== confirm) { setError(t('reset.mismatch')); return }

    setLoading(true)
    const { error: updErr } = await updatePassword(password)
    setLoading(false)
    if (updErr) { setError(t('reset.error')); return }
    setStatus('done')
  }

  const inputCls =
    'w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600 px-8 pt-8 pb-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">duerme.cool</h1>
          <p className="text-blue-200 text-xs mt-1 tracking-widest uppercase">Smart Comfort Technology</p>
        </div>

        <div className="px-8 py-8">
          {status === 'verifying' && (
            <div className="text-center py-6">
              <span className="inline-block w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-500">{t('reset.verifying')}</p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{t('reset.invalidTitle')}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{t('reset.invalidDesc')}</p>
              <Link to="/" className="mt-6 inline-block w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors">
                {t('reset.goHome')}
              </Link>
            </div>
          )}

          {status === 'done' && (
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{t('reset.successTitle')}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{t('reset.successDesc')}</p>
              <button onClick={() => navigate('/mi-cuenta')} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors">
                {t('reset.goToAccount')}
              </button>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t('reset.title')}</h2>
              <p className="text-sm text-gray-500 mb-2">{t('reset.desc')}</p>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('reset.newPassword')}
                  className={`${inputCls} pl-11 pr-11`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t('reset.confirm')}
                  className={`${inputCls} pl-11`}
                />
              </div>

              {error && <p className="text-red-600 text-xs bg-red-50 rounded-xl px-4 py-3">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 disabled:opacity-60">
                {loading
                  ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : t('reset.saveBtn')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
