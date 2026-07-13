import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { TrendingUp } from 'lucide-react';
import { NAV_ITEMS } from './navItems';

// Social icon SVGs (no external library needed)
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const QUOTES = [
  {
    text: "Bet on ideas, not outcomes.",
    author: "CapTab"
  },
  {
    text: "60 seconds. Fake money. Real signal.",
    author: "CapTab"
  },
  {
    text: "The stock market for startups that don’t exist yet.",
    author: "CapTab"
  }
];

export default function Footer() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const isFounder = user?.role === 'founder';

  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
  }, []);

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.authRequired && !isAuthenticated) return false;
    if (item.adminOnly) return false; // Hide admin link in footer completely
    if (item.founderOnly && !isFounder) return false;
    if (item.investorOnly && isFounder) return false;
    return true;
  });

  return (
    <footer className="hidden md:block border-t border-white/5 mt-auto relative overflow-hidden">
      {/* Neon top accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FF66]/40 to-transparent" />

      {/* Quote section */}
      <div className="w-full px-8 pt-10 pb-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-start gap-4 max-w-xl">
            <span className="text-5xl font-serif text-[#00FF66]/40 leading-none mt-1">&ldquo;</span>
            <div>
              <p className="text-white/70 text-base italic leading-relaxed">{QUOTES[quoteIdx].text}</p>
              <p className="text-[#00FF66]/60 text-xs font-mono mt-2">— {QUOTES[quoteIdx].author}</p>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3 shrink-0">
            <p className="text-white/20 text-xs uppercase tracking-widest mr-2">Follow</p>
            {[
              { icon: FacebookIcon, label: 'Facebook' },
              { icon: InstagramIcon, label: 'Instagram' },
              { icon: TikTokIcon, label: 'TikTok' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white/40 hover:text-[#00FF66] hover:border-[#00FF66]/40 hover:bg-[#00FF66]/10 transition-all duration-200"
              >
                <Icon />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="w-full px-8 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-12">

          {/* Brand column */}
          <div>
            <NavLink to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#00FF66]/20 flex items-center justify-center border border-[#00FF66]/30">
                <TrendingUp className="w-4 h-4 text-[#00FF66]" />
              </div>
              <span className="font-bold text-lg tracking-tight">CapTab</span>
            </NavLink>
            <p className="text-white/30 text-sm leading-relaxed">
              The pitch feed where ideas meet virtual capital. Swipe. Invest. Discover the next big thing before it's obvious.
            </p>

          </div>

          {/* Navigation column */}
          <div>
            <p className="text-[10px] text-white/20 font-semibold uppercase tracking-widest mb-4">Navigate</p>
            <ul className="space-y-2.5">
              {visibleNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `text-sm transition-colors flex items-center gap-2 group ${isActive ? 'text-[#00FF66]' : 'text-white/40 hover:text-white'}`
                    }
                  >
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-[#00FF66]">›</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {isAuthenticated && (
                <li>
                  <button
                    onClick={() => dispatch(logout())}
                    className="text-sm transition-colors flex items-center gap-2 group text-[#FF3366]/70 hover:text-[#FF3366]"
                  >
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-[#FF3366]">›</span>
                    Log Out
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <p className="text-[10px] text-white/20 font-semibold uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
              {[
                { to: '/about', label: 'About CapTab' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/privacy', label: 'Privacy Policy' },
              ].map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `text-sm transition-colors flex items-center gap-2 group ${isActive ? 'text-[#00FF66]' : 'text-white/40 hover:text-white'}`
                    }
                  >
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-[#00FF66]">›</span>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white/20">
          <span>&copy; {new Date().getFullYear()} CapTab. All rights reserved.</span>
          <span className="font-mono">v1.0.0-beta</span>
        </div>
      </div>
    </footer>
  );
}
