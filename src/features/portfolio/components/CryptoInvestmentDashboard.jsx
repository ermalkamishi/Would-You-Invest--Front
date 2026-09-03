import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Rocket,
  Flame,
  DollarSign,
  PieChart,
  ArrowUpRight,
  PlusCircle,
  Sparkles,
  Zap,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Search,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { calculateROI, isPositiveROI } from '../../../utils/calculateROI';
import { fetchUserPortfolio } from '../../auth/authApi';
import { setPortfolio, openLoginModal } from '../../auth/authSlice';
import { fetchPitches, investInPitch } from '../../pitches/pitchesApi';
import { fetchUserBets } from '../../pitches/betsApi';
import { setHighlightPitchId } from '../../pitches/pitchesSlice';
import InvestModal from '../../wallet/components/InvestModal';

export default function CryptoInvestmentDashboard({ onSwitchToFeed }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((s) => s.auth);
  const balance = useSelector((s) => s.wallet.balance);
  const isFounder = user?.role === 'founder';

  const [pitches, setPitches] = useState([]);
  const [bets, setBets] = useState([]);
  const [topTenIds, setTopTenIds] = useState([]);
  const [activeTimeframe, setActiveTimeframe] = useState('ALL');
  const [activeTab, setActiveTab] = useState('holdings'); // 'holdings' | 'bets' | 'allocation'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [investModalStartup, setInvestModalStartup] = useState(null);

  // Sync user portfolio & live pitches
  useEffect(() => {
    if (!isAuthenticated || isFounder) return;

    if (user?.id) {
      fetchUserPortfolio(user.id)
        .then((port) => dispatch(setPortfolio(port)))
        .catch(console.error);

      fetchUserBets(user.id)
        .then((data) => setBets(data || []))
        .catch(console.error);
    }

    fetchPitches('hot')
      .then((data) => {
        setPitches(data || []);
        const top10 = (data || []).slice(0, 10).map((p) => p.id);
        setTopTenIds(top10);
      })
      .catch(console.error);
  }, [user?.id, isAuthenticated, isFounder, dispatch]);

  const rawPortfolio = user?.portfolio || [];

  // Merge portfolio holdings with live pitches data (live prices & total raised)
  const enrichedHoldings = useMemo(() => {
    const pitchMap = new Map((pitches || []).map((p) => [p.id, p]));

    return rawPortfolio.map((holding) => {
      const livePitch = pitchMap.get(holding.id);
      const currentPrice = Number(livePitch?.currentPrice || holding.currentPrice || holding.entryPrice || 0.01);
      const shares = Number(holding.sharesBought || 0);
      const entryPrice = Number(holding.entryPrice || currentPrice);
      const invested = Number(holding.amountInvested || shares * entryPrice);
      const isTopTen = topTenIds.includes(holding.id);
      const rawValue = shares * currentPrice;
      const currentValue = isTopTen ? rawValue * 1.2 : rawValue;
      const profitLoss = currentValue - invested;
      const roiStr = invested > 0 ? calculateROI(invested, currentValue) : '+0.00%';
      const isPositive = currentValue >= invested;

      return {
        ...holding,
        livePitch,
        currentPrice,
        entryPrice,
        shares,
        invested,
        currentValue,
        profitLoss,
        roiStr,
        isPositive,
        isTopTen,
        category: holding.category || livePitch?.category || 'Startup',
        problem: livePitch?.problem || holding.problem || 'Untitled Startup',
      };
    });
  }, [rawPortfolio, pitches, topTenIds]);

  // Aggregate stats
  const totalInvested = enrichedHoldings.reduce((sum, h) => sum + h.invested, 0);
  const totalPortfolioValue = enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalNetWorth = totalPortfolioValue + Number(balance || 0);
  const totalProfitLoss = totalPortfolioValue - totalInvested;
  const overallRoiStr = totalInvested > 0 ? calculateROI(totalInvested, totalPortfolioValue) : '+0.00%';
  const isOverallPositive = totalProfitLoss >= 0;

  // Filter holdings
  const filteredHoldings = useMemo(() => {
    return enrichedHoldings.filter((h) => {
      const matchesSearch =
        h.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || h.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [enrichedHoldings, searchQuery, categoryFilter]);

  // Category allocation
  const categoryAllocation = useMemo(() => {
    if (totalPortfolioValue === 0) return [];
    const map = {};
    enrichedHoldings.forEach((h) => {
      const cat = h.category || 'Other';
      map[cat] = (map[cat] || 0) + h.currentValue;
    });
    return Object.entries(map).map(([category, value]) => ({
      category,
      value,
      percentage: ((value / totalPortfolioValue) * 100).toFixed(1),
    }));
  }, [enrichedHoldings, totalPortfolioValue]);

  // Handle investing more into a holding
  const handleInvestMore = (holding) => {
    const targetPitch = holding.livePitch || {
      id: holding.id,
      problem: holding.problem,
      category: holding.category,
      currentPrice: holding.currentPrice,
    };
    setInvestModalStartup(targetPitch);
  };

  const handleModalInvest = async (startupId, amount) => {
    if (token) {
      await investInPitch(startupId, amount, user?.id, token);
      if (user?.id) {
        const port = await fetchUserPortfolio(user.id);
        dispatch(setPortfolio(port));
      }
    }
  };

  const handleViewPitch = (pitchId) => {
    dispatch(setHighlightPitchId(pitchId));
    if (onSwitchToFeed) {
      onSwitchToFeed();
    } else {
      navigate('/');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,255,102,0.15)]">
          <TrendingUp className="w-8 h-8 text-[#00FF66]" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">Crypto & VC Portfolio</h2>
        <p className="text-sm text-white/40 max-w-sm mb-6">
          Sign in to track real-time PnL, manage startup token holdings, and monitor live bonding curves.
        </p>
        <button
          onClick={() => dispatch(openLoginModal())}
          className="px-8 py-3 rounded-xl bg-[#00FF66] text-black font-extrabold text-sm hover:bg-[#00FF66]/80 transition-all shadow-[0_0_25px_rgba(0,255,102,0.3)]"
        >
          Sign In / Connect Wallet
        </button>
      </div>
    );
  }

  if (isFounder) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-[#00FF66]" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Founder Headquarters</h2>
        <p className="text-sm text-white/40 max-w-xs mb-6">
          Founders raise capital and manage pitch momentum. View your funding metrics in the Founder Dashboard.
        </p>
        <NavLink
          to="/profile"
          className="px-6 py-2.5 rounded-xl bg-[#00FF66] text-black font-bold text-sm hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.2)]"
        >
          Open Founder Dashboard →
        </NavLink>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* ── HERO PORTFOLIO & PnL CARD ────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[hsl(240,12%,8%)] to-[hsl(240,12%,5%)] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-80" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00FF66]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/40">
                Total Net Worth
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                LIVE PnL
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {formatCurrency(Math.round(totalNetWorth))}
            </h1>
          </div>

          {/* Quick PnL Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 shadow-lg ${
                isOverallPositive
                  ? 'bg-[#00FF66]/10 border-[#00FF66]/30 text-[#00FF66]'
                  : 'bg-[#FF3366]/10 border-[#FF3366]/30 text-[#FF3366]'
              }`}
            >
              {isOverallPositive ? (
                <ArrowUpRight className="w-5 h-5 shrink-0" />
              ) : (
                <TrendingDown className="w-5 h-5 shrink-0" />
              )}
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Total Profit / Loss
                </p>
                <p className="font-mono text-base font-black leading-none mt-0.5">
                  {isOverallPositive ? '+' : ''}
                  {formatCurrency(Math.round(totalProfitLoss))} ({overallRoiStr})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/5">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[11px] text-white/40 mb-1">Portfolio Assets</p>
            <p className="font-mono text-lg font-bold text-white">
              {formatCurrency(Math.round(totalPortfolioValue))}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[11px] text-white/40 mb-1">Total Invested</p>
            <p className="font-mono text-lg font-bold text-white/80">
              {formatCurrency(Math.round(totalInvested))}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[11px] text-white/40 mb-1">Buying Power (Cash)</p>
            <p className="font-mono text-lg font-bold text-[#00FF66]">
              {formatCurrency(balance || 0)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[11px] text-white/40 mb-1">Holdings Count</p>
            <p className="font-mono text-lg font-bold text-white">
              {enrichedHoldings.length} {enrichedHoldings.length === 1 ? 'Startup' : 'Startups'}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => (onSwitchToFeed ? onSwitchToFeed() : navigate('/'))}
            className="flex-1 min-w-[160px] py-2.5 px-4 rounded-xl bg-[#00FF66] hover:bg-[#00FF66]/80 text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,255,102,0.25)] flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-black" />
            Discover & Invest in Startups
          </button>

          <NavLink
            to="/leaderboard"
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            Top 10 Conviction Pitches
          </NavLink>
        </div>
      </div>

      {/* ── EQUITY CURVE / PnL CHART PREVIEW ─────────────────────────────────── */}
      <div className="p-5 rounded-2xl border border-white/10 bg-[hsl(240,12%,6%)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00FF66]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Portfolio Growth Trajectory
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
            {['24H', '7D', '30D', 'ALL'].map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  activeTimeframe === tf
                    ? 'bg-[#00FF66] text-black shadow'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Equity Trend Graphic */}
        <div className="w-full h-24 sm:h-28 relative flex items-end">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF66" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00FF66" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,80 Q 80,75 140,55 T 260,35 T 340,20 L 400,10 L 400,100 L 0,100 Z"
              fill="url(#equityGrad)"
            />
            <path
              d="M 0,80 Q 80,75 140,55 T 260,35 T 340,20 L 400,10"
              fill="none"
              stroke="#00FF66"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* ── TABS NAVIGATION (Holdings | Predictions | Allocation) ─────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 gap-2">
        <div className="flex gap-4 sm:gap-6">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative flex items-center gap-1.5 ${
              activeTab === 'holdings' ? 'text-[#00FF66]' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Active Holdings ({enrichedHoldings.length})
            {activeTab === 'holdings' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('bets')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative flex items-center gap-1.5 ${
              activeTab === 'bets' ? 'text-[#00FF66]' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Milestone Bets ({bets.length})
            {activeTab === 'bets' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('allocation')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative flex items-center gap-1.5 ${
              activeTab === 'allocation' ? 'text-[#00FF66]' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Sector Allocation
            {activeTab === 'allocation' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
            )}
          </button>
        </div>
      </div>

      {/* ── TAB CONTENT: HOLDINGS ────────────────────────────────────────────── */}
      {activeTab === 'holdings' && (
        <div className="space-y-4">
          {/* Search and Category Filter Bar */}
          {enrichedHoldings.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search your investments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00FF66]/50 transition-all font-mono"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'AI', 'Fintech', 'Climate', 'B2B', 'Health', 'Consumer'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 border ${
                      categoryFilter === cat
                        ? 'bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66]'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Holdings List */}
          {filteredHoldings.length > 0 ? (
            <div className="space-y-3">
              {filteredHoldings.map((holding) => (
                <div
                  key={holding.id}
                  className="p-4 rounded-2xl bg-[hsl(240,12%,6%)] border border-white/10 hover:border-white/20 transition-all hover:bg-[hsl(240,12%,8%)] group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Briefcase className="w-5 h-5 text-[#00FF66]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#00FF66] transition-colors truncate max-w-[280px] sm:max-w-md">
                            {holding.problem}
                          </h4>
                          {holding.isTopTen && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-500/15 text-orange-400 border border-orange-500/30 shrink-0">
                              <Flame className="w-3 h-3" /> +20% Conviction
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-white/40 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60 font-medium">
                            {holding.category}
                          </span>
                          <span className="font-mono">
                            {holding.shares.toFixed(0)} Shares
                          </span>
                          <span>•</span>
                          <span className="font-mono">
                            Avg: ${holding.entryPrice.toFixed(4)}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[#00FF66]">
                            Live: ${holding.currentPrice.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Valuation & PnL */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="text-left sm:text-right">
                        <p className="font-mono text-base font-black text-white">
                          {formatCurrency(Math.round(holding.currentValue))}
                        </p>
                        <p
                          className={`font-mono text-xs font-bold flex items-center sm:justify-end gap-0.5 ${
                            holding.isPositive ? 'text-[#00FF66]' : 'text-[#FF3366]'
                          }`}
                        >
                          {holding.isPositive ? '+' : ''}
                          {formatCurrency(Math.round(holding.profitLoss))} ({holding.roiStr})
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleInvestMore(holding)}
                          className="px-3 py-1.5 rounded-lg bg-[#00FF66]/15 hover:bg-[#00FF66] text-[#00FF66] hover:text-black font-bold text-xs border border-[#00FF66]/30 transition-all flex items-center gap-1 shadow-sm"
                          title="Buy more shares"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Buy</span>
                        </button>

                        <button
                          onClick={() => handleViewPitch(holding.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all"
                          title="View startup pitch"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center mx-auto text-[#00FF66]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No active investments found</h3>
              <p className="text-xs text-white/40 max-w-xs mx-auto">
                Discover trending startup pitches, back ideas on the bonding curve, and grow your virtual portfolio.
              </p>
              <button
                onClick={() => (onSwitchToFeed ? onSwitchToFeed() : navigate('/'))}
                className="mt-2 px-6 py-2.5 rounded-xl bg-[#00FF66] text-black font-extrabold text-xs hover:bg-[#00FF66]/80 transition-all inline-flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,255,102,0.2)]"
              >
                Browse Pitch Feed →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: PREDICTIONS / BETS ──────────────────────────────────── */}
      {activeTab === 'bets' && (
        <div className="space-y-3">
          {bets.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
              <Sparkles className="w-8 h-8 text-white/20 mx-auto" />
              <p className="text-xs text-white/40">No milestone predictions placed yet.</p>
              <p className="text-[11px] text-white/30">
                Predict whether startups will hit funding or backer milestones on pitch cards!
              </p>
            </div>
          ) : (
            bets.map((bet) => (
              <div
                key={bet.id}
                className="p-4 rounded-2xl bg-[hsl(240,12%,6%)] border border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] text-white/40 truncate max-w-md font-medium">
                      {bet.startup?.problem || 'Startup Pitch'}
                    </p>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      Milestone Target: {bet.milestoneType} → {bet.targetValue}
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      bet.prediction === 'yes'
                        ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30'
                        : 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/30'
                    }`}
                  >
                    {bet.prediction.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2.5 border-t border-white/5">
                  <span className="text-white/40 font-mono">
                    Wager: <strong className="text-white">{formatCurrency(bet.betAmount)}</strong>
                  </span>
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
                      <span className="text-yellow-400 font-bold flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        Active Prediction
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB CONTENT: SECTOR ALLOCATION ───────────────────────────────────── */}
      {activeTab === 'allocation' && (
        <div className="p-6 rounded-2xl bg-[hsl(240,12%,6%)] border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#00FF66]" />
            Portfolio Diversification by Sector
          </h3>

          {categoryAllocation.length > 0 ? (
            <div className="space-y-3">
              {/* Stacked Bar */}
              <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
                {categoryAllocation.map((cat, idx) => {
                  const colors = ['#00FF66', '#00BFFF', '#FF9900', '#FF3366', '#A855F7', '#EC4899'];
                  return (
                    <div
                      key={cat.category}
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: colors[idx % colors.length],
                      }}
                      title={`${cat.category}: ${cat.percentage}%`}
                    />
                  );
                })}
              </div>

              {/* Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {categoryAllocation.map((cat, idx) => {
                  const colors = ['#00FF66', '#00BFFF', '#FF9900', '#FF3366', '#A855F7', '#EC4899'];
                  return (
                    <div
                      key={cat.category}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: colors[idx % colors.length] }}
                        />
                        <span className="text-xs font-bold text-white">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-white">
                          {formatCurrency(Math.round(cat.value))}
                        </span>
                        <span className="text-[11px] font-mono text-white/40 ml-1.5">
                          ({cat.percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/40 text-center py-6">No asset allocation data yet.</p>
          )}
        </div>
      )}

      {/* Invest Modal for Quick Top-Up */}
      {investModalStartup && (
        <InvestModal
          isOpen={!!investModalStartup}
          onClose={() => setInvestModalStartup(null)}
          startup={investModalStartup}
          onInvest={handleModalInvest}
        />
      )}
    </div>
  );
}
