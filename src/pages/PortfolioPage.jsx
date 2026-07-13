import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Briefcase, Rocket, Flame } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateROI, isPositiveROI } from '../utils/calculateROI';
import { openLoginModal, setPortfolio } from '../features/auth/authSlice';
import { fetchUserPortfolio } from '../features/auth/authApi';
import { fetchPitches } from '../features/pitches/pitchesApi';
import { fetchUserBets } from '../features/pitches/betsApi';

export default function PortfolioPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const isFounder = user?.role === 'founder';

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-white/40 mb-6">Create an account to view your portfolio</p>
        <button 
          onClick={() => dispatch(openLoginModal())}
          className="px-6 py-2.5 rounded-lg bg-[#00FF66] text-black font-bold text-sm hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.2)]"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isFounder) {
    return (
      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#00FF66]/10 flex items-center justify-center mb-4 border border-[#00FF66]/20">
          <Rocket className="w-8 h-8 text-[#00FF66]/60" />
        </div>
        <h2 className="text-xl font-bold mb-2">You're a Founder</h2>
        <p className="text-sm text-white/40 max-w-xs mb-5">
          Founders don't invest — they raise. Track your pitches, capital inflow, and backer data in your Founder Dashboard.
        </p>
        <NavLink
          to="/profile"
          className="px-6 py-2.5 rounded-lg bg-[#00FF66] text-black font-bold text-sm hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.2)]"
        >
          Go to Founder Dashboard
        </NavLink>
      </div>
    );
  }

  const [topTenIds, setTopTenIds] = useState([]);

  useEffect(() => {
    if (user?.id) {
      // Sync portfolio from DB
      fetchUserPortfolio(user.id)
        .then((port) => dispatch(setPortfolio(port)))
        .catch(console.error);
    }

    // Fetch top 10 pitches for Conviction Bonus
    fetchPitches('hot')
      .then((data) => {
        const top10 = data.slice(0, 10).map((p) => p.id);
        setTopTenIds(top10);
      })
      .catch(console.error);
  }, [user?.id, dispatch]);

  const [activeTab, setActiveTab] = useState('holdings'); // 'holdings' | 'bets'
  const [bets, setBets] = useState([]);

  useEffect(() => {
    if (activeTab === 'bets' && user?.id) {
      fetchUserBets(user.id)
        .then((data) => setBets(data))
        .catch(console.error);
    }
  }, [activeTab, user?.id]);

  const portfolio = user?.portfolio || [];

  const totalInvested = portfolio.reduce((sum, p) => sum + (p.amountInvested || 0), 0);
  const totalValue = portfolio.reduce((sum, p) => {
    const rawVal = p.sharesBought * p.currentPrice || 0;
    const isTopTen = topTenIds.includes(p.id);
    return sum + (isTopTen ? rawVal * 1.2 : rawVal);
  }, 0);

  const totalROI = totalInvested > 0 ? calculateROI(totalInvested, totalValue) : '+0.00%';
  const isPositive = totalValue >= totalInvested;

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-sm text-white/40 mt-1">Your virtual P&L — every investment tracked.</p>
      </div>
      {/* Portfolio summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
          <p className="text-xs text-white/40 mb-1">Total Invested</p>
          <p className="font-mono text-xl font-bold">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
          <p className="text-xs text-white/40 mb-1">Current Value</p>
          <p className={`font-mono text-xl font-bold ${isPositive ? 'text-[#00FF66]' : 'text-[#FF3366]'}`}>
            {formatCurrency(Math.round(totalValue))}
          </p>
        </div>
        <div className="col-span-2 p-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 mb-1">Total ROI</p>
            <p className={`font-mono text-2xl font-bold ${isPositive ? 'text-[#00FF66]' : 'text-[#FF3366]'}`}>
              {totalROI}
            </p>
          </div>
          {isPositive ? (
            <TrendingUp className="w-8 h-8 text-[#00FF66]/40" />
          ) : (
            <TrendingDown className="w-8 h-8 text-[#FF3366]/40" />
          )}
        </div>
      </div>

      {/* Tab selectors */}
      <div className="flex border-b border-white/10 mb-4 gap-6">
        <button
          onClick={() => setActiveTab('holdings')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'holdings' ? 'text-[#00FF66]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Startup Investments
          {activeTab === 'holdings' && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00FF66]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('bets')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'bets' ? 'text-[#00FF66]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Milestone Predictions
          {activeTab === 'bets' && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00FF66]" />
          )}
        </button>
      </div>

      {activeTab === 'holdings' ? (
        <>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Holdings</h2>
          {portfolio.length > 0 ? (
            <div className="space-y-2">
              {portfolio.map((holding) => {
                const isTopTen = topTenIds.includes(holding.id);
                const rawValue = holding.sharesBought * holding.currentPrice;
                const currentValue = isTopTen ? rawValue * 1.2 : rawValue;
                const roi = calculateROI(holding.amountInvested, currentValue);
                const positive = isPositiveROI(holding.amountInvested, currentValue);

                return (
                  <div key={holding.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-white truncate">{holding.problem}</p>
                        {isTopTen && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                            <Flame className="w-2.5 h-2.5" /> +20% Conviction
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-white/5 border border-white/10 text-white/40">
                          {holding.category}
                        </span>
                        <p className="text-xs text-white/30">
                          {holding.sharesBought} Shares @ ${Number(holding.entryPrice).toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-bold text-white">{formatCurrency(currentValue)}</p>
                      <p className={`font-mono text-[10px] font-semibold ${positive ? 'text-[#00FF66]' : 'text-[#FF3366]'}`}>
                        {roi}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-white/[0.01] border border-white/5 rounded-xl">
              <p className="text-sm text-white/30">No investments yet</p>
              <NavLink to="/" className="text-xs text-[#00FF66] mt-2 inline-block hover:underline">
                Explore Startups &rarr;
              </NavLink>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Predictions</h2>
          {bets.length === 0 ? (
            <div className="text-center py-10 bg-white/[0.01] border border-white/5 rounded-xl">
              <p className="text-xs text-white/30">No predictions placed yet.</p>
              <NavLink to="/" className="text-xs text-[#00FF66] mt-2 inline-block hover:underline">
                Explore Pitch Feed &rarr;
              </NavLink>
            </div>
          ) : (
            <div className="space-y-2.5">
              {bets.map((bet) => {
                const textMap = {
                  backers: `Reach backers target of ${bet.targetValue}`,
                  raised: `Reach funding target of ${formatCurrency(bet.targetValue)}`,
                  price: `Reach share price target of $${Number(bet.targetValue).toFixed(4)}`,
                };
                const desc = textMap[bet.milestoneType] || 'Reach target';

                return (
                  <div key={bet.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-white/30 truncate">
                          {bet.startup?.problem || 'Unknown Startup'}
                        </p>
                        <h4 className="text-xs font-bold text-white/90 leading-tight mt-0.5">{desc}</h4>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide shrink-0 ${
                        bet.prediction === 'yes'
                          ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30'
                          : 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/30'
                      }`}>
                        {bet.prediction.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2.5">
                      <div>
                        <span className="text-white/30">Amount Risked: </span>
                        <span className="font-mono font-bold text-white/80">{formatCurrency(bet.betAmount)}</span>
                      </div>

                      <div>
                        {bet.isResolved ? (
                          bet.won ? (
                            <span className="text-[#00FF66] font-bold font-mono">
                              WON (+{formatCurrency(bet.payout)})
                            </span>
                          ) : (
                            <span className="text-[#FF3366] font-bold font-mono">
                              LOST (-{formatCurrency(bet.betAmount)})
                            </span>
                          )
                        ) : (
                          <span className="text-yellow-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                            Active (3d expiry)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
