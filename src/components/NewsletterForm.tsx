import React, { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function NewsletterForm() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [formState, setFormState] = useState<FormState>('idle')
  const [name, setName] = useState(user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [optIn, setOptIn] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      setErrorMsg(t('newsletter.errorGeneric'))
      return
    }

    // Validate opt-in checkbox
    if (!optIn) {
      setErrorMsg(t('newsletter.optInRequired'))
      return
    }

    setFormState('submitting')

    try {
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: {
          name: name || undefined,
          email,
          language,
        },
      })

      if (error) {
        setErrorMsg(t('newsletter.errorGeneric'))
        setFormState('error')
        setTimeout(() => setFormState('idle'), 4000)
        return
      }

      setFormState('success')
      setName('')
      setEmail('')
      setOptIn(false)
    } catch (err) {
      console.error('Newsletter subscribe error:', err)
      setErrorMsg(t('newsletter.errorGeneric'))
      setFormState('error')
      setTimeout(() => setFormState('idle'), 4000)
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center max-w-md mx-auto">
        <div className="flex justify-center mb-3">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <p className="text-lg font-bold text-green-900 mb-1">{t('newsletter.successTitle')}</p>
        <p className="text-sm text-green-700">{t('newsletter.successDesc')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      {/* Name input */}
      <div>
        <input
          type="text"
          placeholder={t('newsletter.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Email input */}
      <div>
        <input
          type="email"
          placeholder={t('newsletter.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Opt-in checkbox */}
      <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700">
        <input
          type="checkbox"
          id="newsletter-optin"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="newsletter-optin" className="text-sm text-gray-300 cursor-pointer">
          {t('newsletter.optInLabel')}
        </label>
      </div>

      {/* Error message */}
      {errorMsg && formState === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={formState === 'submitting'}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <Mail className="h-4 w-4" />
        {formState === 'submitting' ? t('newsletter.submitting') : t('newsletter.submitBtn')}
      </button>
    </form>
  )
}
