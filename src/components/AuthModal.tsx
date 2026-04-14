import React, { useState, FormEvent } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

type Tab = 'login' | 'register'

interface Props {
  isOpen: boolean
  onClose: () => void
  defaultTab?: Tab
  prefillEmail?: string
  prefillPassword?: string
  onSuccess?: () => void
}

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3.5 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
  }`

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = 'login',
  prefillEmail = '',
  prefillPassword = '',
  onSuccess,
}: Props) {
  const { signIn, signUp } = useAuth()
  const { t } = useLanguage()

  const [tab, setTab] = useState<Tab>(defaultTab)
  const [email, setEmail]       = useState(prefillEmail)
  const [password, setPassword] = useState(prefillPassword)
  const [confirm, setConfirm]   = useState('')
  const [fullName, setFullName] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  if (!isOpen) return null

  const reset = () => {
    setError('')
    setDone(false)
    setLoading(false)
  }

  const switchTab = (t: Tab) => { setTab(t); reset() }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) { setError(error); setLoading(false) }
    else { onSuccess?.(); onClose() }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError(t('auth.passwordMinLength')); return }
    if (password !== confirm) { setError(t('auth.passwordMismatch')); return }
    setLoading(true); setError('')
    const { error } = await signUp(email, password, fullName)
    if (error) { setError(error); setLoading(false) }
    else { setDone(true); setLoading(false) }
  }

  return (
    <>
      {/* Backdrop - fixed full screen */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container - fixed centered */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        {/* Card */}
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up pointer-events-auto">

          {/* Header gradient */}
          <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600 px-8 pt-8 pb-6 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">duerme.cool</h1>
            <p className="text-blue-200 text-xs mt-1 tracking-widest uppercase">Smart Comfort Technology</p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          <div className="px-8 py-6">
            {/* ── Email verified / done state ── */}
            {done ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{t('auth.checkEmail')}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t('auth.checkEmailDesc')} <span className="font-semibold text-blue-600">{email}</span>
                </p>
                <button onClick={onClose} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors">
                  {t('auth.closeBtn')}
                </button>
              </div>
            ) : tab === 'login' ? (
              /* ── Login form ── */
              <form onSubmit={handleLogin} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('auth.loginTitle')}</h2>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.email')}
                    className={`${inputCls()} pl-11`}
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password')}
                    className={`${inputCls()} pl-11 pr-11`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {error && <p className="text-red-600 text-xs bg-red-50 rounded-xl px-4 py-3">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 disabled:opacity-60">
                  {loading
                    ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : t('auth.loginBtn')}
                </button>

                <p className="text-center text-sm text-gray-500">
                  {t('auth.noAccount')}{' '}
                  <button type="button" onClick={() => switchTab('register')}
                    className="text-blue-600 font-semibold hover:underline">
                    {t('auth.registerLink')}
                  </button>
                </p>
              </form>
            ) : (
              /* ── Register form ── */
              <form onSubmit={handleRegister} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('auth.registerTitle')}</h2>

                {/* Full name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text" required autoComplete="name"
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('auth.fullName')}
                    className={`${inputCls()} pl-11`}
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.email')}
                    className={`${inputCls()} pl-11`}
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password')}
                    className={`${inputCls()} pl-11 pr-11`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Confirm password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder={t('auth.confirmPassword')}
                    className={`${inputCls(confirm && confirm !== password)} pl-11`}
                  />
                </div>

                {error && <p className="text-red-600 text-xs bg-red-50 rounded-xl px-4 py-3">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 disabled:opacity-60">
                  {loading
                    ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : t('auth.registerBtn')}
                </button>

                <p className="text-center text-sm text-gray-500">
                  {t('auth.hasAccount')}{' '}
                  <button type="button" onClick={() => switchTab('login')}
                    className="text-blue-600 font-semibold hover:underline">
                    {t('auth.loginLink')}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
