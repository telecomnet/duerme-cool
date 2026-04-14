import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, LogOut, Package, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function UserMenu() {
  const { user, signOut, loading } = useAuth()
  const { t } = useLanguage()
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (loading) return <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse" />

  if (!user) {
    return (
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all text-sm font-semibold"
        aria-label={t('auth.login')}
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{t('auth.login')}</span>
      </button>
    )
  }

  const initials = user.fullName
    ? user.fullName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">
          {user.fullName || user.email}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-900 truncate">
              {user.fullName || t('auth.myProfile')}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          <Link
            to="/mi-cuenta"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          >
            <Package className="h-4 w-4 text-gray-400" />
            {t('auth.myOrders')}
          </Link>

          {user.isAdmin && (
            <Link
              to="/admin"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-gray-400" />
              {t('auth.adminDashboard')}
            </Link>
          )}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => { setDropdownOpen(false); signOut() }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
