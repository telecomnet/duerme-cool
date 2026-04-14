import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingCart } from 'lucide-react';
import UserMenu from './UserMenu';

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/Duerme_cool_logo.jpeg" alt="Duerme.cool" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isHome ? (
              <>
                <a href="#como-funciona" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  {t('header.howItWorks')}
                </a>
                <a href="#beneficios" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  {t('header.benefits')}
                </a>
                <a href="#preguntas" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  {t('header.questions')}
                </a>
              </>
            ) : (
              <>
                <Link to="/#como-funciona" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  {t('header.howItWorks')}
                </Link>
                <Link to="/#beneficios" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  {t('header.benefits')}
                </Link>
                <Link to="/#preguntas" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  {t('header.questions')}
                </Link>
              </>
            )}
          </nav>

          {/* Right section: Language Toggle + CTA */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="relative flex items-center bg-gray-100 rounded-full p-0.5 cursor-pointer transition-all hover:bg-gray-200"
              aria-label="Toggle language"
              id="language-toggle"
            >
              <div className="relative flex items-center w-[88px] h-9">
                {/* Sliding background */}
                <div
                  className={`absolute top-0.5 bottom-0.5 w-[42px] bg-blue-600 rounded-full shadow-md transition-all duration-300 ease-out ${
                    language === 'en' ? 'left-[44px]' : 'left-0.5'
                  }`}
                />
                {/* ES Label */}
                <span
                  className={`relative z-10 flex-1 text-center text-sm font-bold transition-colors duration-300 ${
                    language === 'es' ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  ES
                </span>
                {/* EN Label */}
                <span
                  className={`relative z-10 flex-1 text-center text-sm font-bold transition-colors duration-300 ${
                    language === 'en' ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  EN
                </span>
              </div>
            </button>

            {/* Cart icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={t('header.cart')}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* User menu / Login */}
            <UserMenu />

            {/* CTA Button */}
            <Link
              to="/tienda"
              className="hidden sm:inline-flex bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:scale-105 transform"
            >
              {t('header.tryNow')}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4 space-y-3 animate-in slide-in-from-top">
            {isHome ? (
              <>
                <a
                  href="#como-funciona"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('header.howItWorks')}
                </a>
                <a
                  href="#beneficios"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('header.benefits')}
                </a>
                <a
                  href="#preguntas"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('header.questions')}
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('header.howItWorks')}
                </Link>
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('header.benefits')}
                </Link>
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('header.questions')}
                </Link>
              </>
            )}
            <Link
              to="/tienda"
              className="block bg-blue-600 text-white px-6 py-3 rounded-xl text-center font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.tryNow')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;