import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PitchFeed from '../features/pitches/components/PitchFeed';
import CryptoInvestmentDashboard from '../features/portfolio/components/CryptoInvestmentDashboard';
import { TrendingUp, Flame, Zap } from 'lucide-react';

export default function FeedPage() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { highlightPitchId } = useSelector((s) => s.pitches);
  const isFounder = user?.role === 'founder';

  // Default view: For logged-in investors, default to 'dashboard' (how investments are doing + PnL)
  // Otherwise, default to 'feed'
  const [viewMode, setViewMode] = useState(
    isAuthenticated && !isFounder ? 'dashboard' : 'feed'
  );

  // If user clicks an alert/toast targeting a pitch, switch to feed view automatically
  useEffect(() => {
    if (highlightPitchId) {
      setViewMode('feed');
    }
  }, [highlightPitchId]);

  // If user logs in/out, update default view
  useEffect(() => {
    if (isAuthenticated && !isFounder) {
      setViewMode('dashboard');
    } else {
      setViewMode('feed');
    }
  }, [isAuthenticated, isFounder]);

  return (
    <div className="w-full min-h-[calc(100dvh-112px)] md:min-h-[calc(100dvh-56px)] bg-[hsl(240,15%,4%)] flex flex-col">
      {/* Top View Mode Switcher for Logged-In Investors */}
      {isAuthenticated && !isFounder && (
        <div className="w-full border-b border-white/10 bg-[hsl(240,12%,6%)]/80 backdrop-blur-md sticky top-14 z-30 px-4 py-2.5 flex items-center justify-center">
          <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 gap-1 shadow-inner">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'dashboard'
                  ? 'bg-[#00FF66] text-black shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${viewMode === 'dashboard' ? 'fill-black' : ''}`} />
              <span>Investment Dashboard & PnL</span>
            </button>

            <button
              onClick={() => setViewMode('feed')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'feed'
                  ? 'bg-[#00FF66] text-black shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${viewMode === 'feed' ? 'fill-black' : ''}`} />
              <span>Discover Pitches</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        {viewMode === 'dashboard' && isAuthenticated && !isFounder ? (
          <CryptoInvestmentDashboard onSwitchToFeed={() => setViewMode('feed')} />
        ) : (
          <div className="w-full h-[calc(100dvh-112px)] md:h-[calc(100dvh-56px)]">
            <PitchFeed />
          </div>
        )}
      </div>
    </div>
  );
}
