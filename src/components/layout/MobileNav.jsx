import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { NAV_ITEMS } from './navItems';

export default function MobileNav() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const isFounder = user?.role === 'founder';
  const location = useLocation();

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.authRequired && !isAuthenticated) return false;
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.adminOnly && user?.role === 'admin') return true;
    if (item.founderOnly && !isFounder) return false;
    if (item.investorOnly && isFounder) return false;
    return true;
  });

  return (
    <nav className="sticky bottom-0 z-50 shrink-0 glass border-t border-white/5 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-around">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#00FF66]' : 'text-white/30 hover:text-white/50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
