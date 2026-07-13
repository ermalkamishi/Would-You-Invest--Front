import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TrendingUp } from 'lucide-react';
import WalletStatus from '../../features/wallet/components/WalletStatus';
import { NAV_ITEMS } from './navItems';

export default function Header({ onLoginClick }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const isFounder = user?.role === 'founder';
  const location = useLocation();

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.authRequired && !isAuthenticated) return false;
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.adminOnly && user?.role === 'admin') return true; // Show admin link for admins, overriding next checks
    if (item.founderOnly && !isFounder) return false;
    if (item.investorOnly && isFounder) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5 w-full">
      <div className="w-full px-4 md:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#00FF66]/20 flex items-center justify-center border border-[#00FF66]/50">
            <TrendingUp className="w-4 h-4 text-[#00FF66]" />
          </div>
          <span className="font-bold text-base tracking-tight">CapTab</span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {visibleNav.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors ${
                  isActive ? 'text-[#00FF66]' : 'text-white/40 hover:text-white'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && <WalletStatus />}
          {isAuthenticated ? (
            <NavLink
              to="/profile"
              className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20 transition-all overflow-hidden"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() || 'U'
              )}
            </NavLink>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-3 py-1.5 rounded-lg bg-[#00FF66] text-black text-xs font-bold hover:bg-[#00FF66]/80 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
