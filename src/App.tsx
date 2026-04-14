import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import FAQ from './components/FAQ';
import Validation from './components/Validation';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Shop from './components/Shop';
import CartDrawer from './components/CartDrawer';
import AddedToCartToast from './components/AddedToCartToast';
import Checkout from './components/Checkout';
import CheckoutSuccess from './components/CheckoutSuccess';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import NewsletterConfirm from './pages/NewsletterConfirm';
import AuthModal from './components/AuthModal';

function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Benefits />
      <Validation />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setAuthModalOpen(true);
    window.addEventListener('openAuthModal', handleOpenModal);
    return () => window.removeEventListener('openAuthModal', handleOpenModal);
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen">
              <Header />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/tienda" element={<Shop />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/newsletter/confirm" element={<NewsletterConfirm />} />
                <Route path="/mi-cuenta" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                {/* Redirect legacy /dashboard → /mi-cuenta */}
                <Route path="/dashboard" element={<Navigate to="/mi-cuenta" replace />} />
                <Route path="/admin" element={
                  <AdminRoute><AdminDashboard /></AdminRoute>
                } />
              </Routes>
              <CartDrawer />
              <AddedToCartToast />
            </div>
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              onSuccess={() => setAuthModalOpen(false)}
            />
          </CartProvider>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

export default App;