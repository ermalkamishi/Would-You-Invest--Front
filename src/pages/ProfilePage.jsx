import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import ProfileHeader from '../features/profile/components/ProfileHeader';
import FounderDashboard from '../features/profile/components/FounderDashboard';
import InvestorDashboard from '../features/profile/components/InvestorDashboard';
import { UserCircle2 } from 'lucide-react';
import { openLoginModal, logout } from '../features/auth/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col items-center justify-center py-20 text-center">
        <UserCircle2 className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
        <p className="text-sm text-white/40 max-w-xs mb-6">
          You must be signed in to view your profile and features.
        </p>
        <button 
          onClick={() => dispatch(openLoginModal())}
          className="px-6 py-2.5 rounded-lg bg-[#00FF66] text-black font-bold text-sm hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.2)]"
        >
          Sign In
        </button>
      </div>
    );
  }

  const isFounder = user?.role === 'founder';

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-sm text-white/40 mt-1">Manage your identity and features.</p>
        </div>
        <div className="flex gap-2">
          {/* Toggle Public View button placeholder */}
          <button className="text-xs border border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
            Public View
          </button>
          <button 
            onClick={() => dispatch(logout())}
            className="text-xs border border-[#FF3366]/30 px-3 py-1.5 rounded-lg text-[#FF3366] hover:bg-[#FF3366]/10 transition-all"
          >
            Log Out
          </button>
        </div>
      </div>

      <ProfileHeader user={user} />

      {isFounder ? <FounderDashboard /> : <InvestorDashboard />}
    </div>
  );
}
