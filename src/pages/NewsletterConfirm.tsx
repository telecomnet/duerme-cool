import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'

type ConfirmState = 'loading' | 'success' | 'error'

export default function NewsletterConfirm() {
  const [searchParams] = useSearchParams()
  const { t } = useLanguage()
  const [state, setState] = useState<ConfirmState>('loading')
  const [confirmLanguage, setConfirmLanguage] = useState<'es' | 'en'>('es')

  const token = searchParams.get('token')

  useEffect(() => {
    const confirm = async () => {
      // No token = immediate error
      if (!token) {
        setState('error')
        return
      }

      try {
        const { data, error } = await supabase.functions.invoke('newsletter-confirm', {
          body: { token },
        })

        if (error || !data?.success) {
          setState('error')
          return
        }

        // Use the language from the response (user's preferred language at subscription)
        if (data.language === 'es' || data.language === 'en') {
          setConfirmLanguage(data.language)
        }

        setState('success')
      } catch (err) {
        console.error('Newsletter confirm error:', err)
        setState('error')
      }
    }

    confirm()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {state === 'loading' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <Loader className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-700 font-semibold">{t('newsletter.confirm.loading')}</p>
          </div>
        )}

        {state === 'success' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {confirmLanguage === 'es' ? t('newsletter.confirm.successTitle') : 'Subscription confirmed!'}
            </h1>
            <p className="text-gray-600 mb-6">
              {confirmLanguage === 'es' ? t('newsletter.confirm.successDesc') : 'You are now part of the Duerme.cool community'}
            </p>
            <Link
              to="/tienda"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
            >
              {confirmLanguage === 'es' ? t('newsletter.confirm.cta') : 'View products'}
            </Link>
          </div>
        )}

        {state === 'error' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('newsletter.confirm.errorTitle')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('newsletter.confirm.errorDesc')}
            </p>
            <Link
              to="/tienda"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
            >
              {t('newsletter.confirm.cta')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
