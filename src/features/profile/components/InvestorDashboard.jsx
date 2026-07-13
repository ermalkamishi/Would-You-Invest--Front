import { useState, useEffect } from 'react';
import { Briefcase, Eye, TrendingUp, Sparkles, UserPlus, Gift, Clock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { formatCurrency } from '../../../utils/formatCurrency';
import { fetchUserProfile, fetchUserPortfolio, claimStipend } from '../../auth/authApi';
import { API_BASE } from '../../../config';
import { fetchPitches } from '../../pitches/pitchesApi';
import { loginSuccess, setPortfolio, claimStipendSuccess, updateProfileSuccess } from '../../auth/authSlice';
import { setBalance } from '../../wallet/walletSlice';

export default function InvestorDashboard() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user) || {};
  const followedFounders = user.followedFounders || [];
  const portfolio = user.portfolio || [];
  const watchlist = user.watchlist || [];

  const [topTenIds, setTopTenIds] = useState([]);
  const [cooldownText, setCooldownText] = useState('');
  const [canClaim, setCanClaim] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const [isEditingThesis, setIsEditingThesis] = useState(false);
  const [thesisInput, setThesisInput] = useState(user.investmentThesis || '');

  useEffect(() => {
    if (user.investmentThesis !== undefined) {
      setThesisInput(user.investmentThesis || '');
    }
  }, [user.investmentThesis]);

  const handleSaveThesis = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ investmentThesis: thesisInput.trim() }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        dispatch(updateProfileSuccess(updatedUser));
        setIsEditingThesis(false);
      }
    } catch (err) {
      console.error('Failed to update investment thesis:', err);
    }
  };

  // Unfollow handler
  const handleUnfollow = async (founderId) => {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/unfollow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ founderId }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        dispatch(updateProfileSuccess(updatedUser));
        dispatch(setBalance(Number(updatedUser.walletBalance)));
      }
    } catch (err) {
      console.error('Failed to unfollow founder:', err);
    }
  };

  // Referral State
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    if (user.id) {
      // Sync profile & portfolio
      fetchUserProfile(user.id)
        .then((profile) => {
          dispatch(loginSuccess({ user: profile, token }));
          dispatch(setBalance(Number(profile.walletBalance)));
        })
        .catch(console.error);

      fetchUserPortfolio(user.id)
        .then((port) => dispatch(setPortfolio(port)))
        .catch(console.error);
    }

    fetchPitches('hot')
      .then((data) => {
        const top10 = data.slice(0, 10).map((p) => p.id);
        setTopTenIds(top10);
      })
      .catch(console.error);
  }, [user.id, dispatch, token]);

  // Handle Stipend Countdown Timer
  useEffect(() => {
    if (!user.lastStipendClaimedAt) {
      setCanClaim(true);
      return;
    }

    const interval = setInterval(() => {
      const lastClaimed = new Date(user.lastStipendClaimedAt).getTime();
      const nextClaim = lastClaimed + 24 * 60 * 60 * 1000;
      const now = Date.now();
      const diff = nextClaim - now;

      if (diff <= 0) {
        setCanClaim(true);
        setCooldownText('');
        clearInterval(interval);
      } else {
        setCanClaim(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCooldownText(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user.lastStipendClaimedAt]);

  const handleClaimStipend = async () => {
    if (!canClaim || isClaiming || !user.id) return;
    setIsClaiming(true);
    try {
      const result = await claimStipend(user.id, token);
      dispatch(claimStipendSuccess(result));
      dispatch(setBalance(Number(result.walletBalance)));
      setCanClaim(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to claim stipend');
    } finally {
      setIsClaiming(false);
    }
  };

  const portfolioValue = portfolio.reduce((sum, item) => {
    const rawVal = item.sharesBought * item.currentPrice || 0;
    const isTopTen = topTenIds.includes(item.id);
    return sum + (isTopTen ? rawVal * 1.2 : rawVal);
  }, 0);

  const totalInvested = portfolio.reduce((sum, item) => sum + (item.amountInvested || 0), 0);
  const portfolioReturn = totalInvested > 0 ? Math.round(((portfolioValue - totalInvested) / totalInvested) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Daily Stipend Banner */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00FF66]/10 flex items-center justify-center border border-[#00FF66]/20 shrink-0">
            <Gift className="w-5 h-5 text-[#00FF66]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Daily Stipend</h4>
            <p className="text-xs text-white/40">Claim $1,000 to deploy in startup ideas</p>
          </div>
        </div>

        {canClaim ? (
          <button
            onClick={handleClaimStipend}
            disabled={isClaiming}
            className="px-4 py-2 bg-[#00FF66] text-black font-bold text-xs rounded-lg hover:bg-[#00FF66]/80 transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)] disabled:opacity-50"
          >
            {isClaiming ? 'Claiming...' : 'Claim $1,000'}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
            {cooldownText || 'Locked'}
          </div>
        )}
      </div>

      {/* Referral Invite Card */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
            <UserPlus className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Refer & Earn</h4>
            <p className="text-xs text-white/40">Share your link to claim +$5,000 virtual capital per sign up</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={`${window.location.origin}/?ref=${user.username}`}
            className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[#00FF66] focus:outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/?ref=${user.username}`);
              setInviteMessage('Referral link copied! 📋');
              setTimeout(() => setInviteMessage(''), 4000);
            }}
            className="px-4 py-2.5 bg-[#00FF66] hover:bg-[#00FF66]/80 text-black font-bold text-xs rounded-lg transition-all whitespace-nowrap"
          >
            Copy Link
          </button>
        </div>

        {inviteMessage && (
          <p className="text-[10px] text-[#00FF66] font-bold">{inviteMessage}</p>
        )}
      </div>

      {/* Investment Thesis (Editable) */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] relative overflow-hidden space-y-2">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00FF66]" />
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-[#00FF66] uppercase tracking-wider">Investment Thesis</h3>
          {isEditingThesis ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveThesis}
                className="text-[10px] uppercase font-bold text-[#00FF66] hover:underline"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingThesis(false);
                  setThesisInput(user.investmentThesis || '');
                }}
                className="text-[10px] uppercase font-bold text-white/40 hover:underline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingThesis(true)}
              className="text-[10px] uppercase font-bold text-white/40 hover:text-white hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        
        {isEditingThesis ? (
          <textarea
            value={thesisInput}
            onChange={(e) => setThesisInput(e.target.value)}
            className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#00FF66]/50 resize-none"
            placeholder="What is your investment thesis? (e.g. sectors, stages, builders you back)"
            maxLength={280}
          />
        ) : (
          <p className="text-sm text-white/80 italic leading-relaxed">
            {user.investmentThesis ? `"${user.investmentThesis}"` : "No investment thesis specified yet. Click Edit to add one!"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NavLink to="/portfolio" className="block p-4 rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] shadow-lg hover:border-[#00FF66]/50 transition-all group">
          <div className="flex items-center gap-2 text-white/40 mb-2 group-hover:text-[#00FF66] transition-colors">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs">Portfolio Value</span>
          </div>
          <p className="font-mono text-xl font-bold text-[#00FF66]">
            {portfolio.length > 0 ? formatCurrency(portfolioValue) : '$0'}
          </p>
          {portfolio.length === 0 ? (
            <p className="text-xs text-white/30 mt-1">No investments yet</p>
          ) : (
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-[#00FF66]" />
              <span className="text-xs text-[#00FF66]">+{portfolioReturn}%</span>
            </div>
          )}
        </NavLink>

        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Eye className="w-4 h-4" />
            <span className="text-xs">Watchlist</span>
          </div>
          {watchlist.length > 0 ? (
            <p className="font-mono text-xl font-bold text-white">{watchlist.length} Ideas</p>
          ) : (
            <p className="text-xs text-white/30 mt-1">No saved pitches</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Followed Founders</h3>
        {followedFounders.length > 0 ? (
          <div className="space-y-2">
            {followedFounders.map((founder, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/10">
                    {founder.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">@{founder.username}</p>
                    <p className="text-xs text-white/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {founder.category}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnfollow(founder.id)}
                  className="text-[10px] uppercase tracking-wider font-extrabold text-[#FF3366] hover:bg-[#FF3366]/10 border border-[#FF3366]/30 px-2 py-1 rounded transition-colors"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center">
            <UserPlus className="w-8 h-8 text-white/20 mb-3" />
            <p className="text-sm text-white/60">You don't follow anyone yet</p>
            <p className="text-xs text-white/40 mt-1">Find interesting founders in the feed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
