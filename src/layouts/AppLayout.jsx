import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import LoginModal from '../features/auth/components/LoginModal';
import WelcomeBonusModal from '../features/auth/components/WelcomeBonusModal';
import LiveAlertSystem from '../components/layout/LiveAlertSystem';
import { openLoginModal, closeLoginModal } from '../features/auth/authSlice';

export default function AppLayout() {
  const dispatch = useDispatch();
  const showLoginModal = useSelector((s) => s.auth.showLoginModal);
  const location = useLocation();
  const isFeed = location.pathname === '/';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('referralCode', ref);
    }
  }, [location]);

  return (
    <div className={`flex flex-col ${isFeed ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      <Header onLoginClick={() => dispatch(openLoginModal())} />
      <LiveAlertSystem />

      {/* Page content */}
      <main className={`flex-1 w-full flex flex-col ${isFeed ? 'min-h-0 overflow-hidden' : ''}`}>
        <Outlet />
      </main>

      <MobileNav />
      {!isFeed && <Footer />}

      <LoginModal isOpen={showLoginModal} onClose={() => dispatch(closeLoginModal())} />
      <WelcomeBonusModal />
    </div>
  );
}
