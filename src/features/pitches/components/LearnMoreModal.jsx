import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, TrendingUp, Users, MessageSquare, Flag, Send, HelpCircle, Briefcase, Award, Milestone, Clock, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { addComment } from '../pitchesSlice';
import { addCommentToPitch } from '../pitchesApi';

const isRealPitch = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

import { fetchUserBets, placeBet } from '../betsApi';
import { deductFromWallet } from '../../wallet/walletSlice';

export default function LearnMoreModal({ isOpen, onClose, startup, tickerPrice, tickerColorClass, onInvest, onPass }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);
  const walletBalance = useSelector((s) => s.wallet.balance);
  
  const [commentText, setCommentText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [userBets, setUserBets] = useState([]);
  
  // Bet Form State
  const [selectedMilestone, setSelectedMilestone] = useState('backers'); // 'backers' | 'raised' | 'price'
  const [prediction, setPrediction] = useState('yes'); // 'yes' | 'no'
  const [betAmount, setBetAmount] = useState(100);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betError, setBetError] = useState(null);

  const inputRef = useRef(null);

  // Load user's existing bets for this startup
  const loadUserBets = useCallback(async () => {
    if (!user?.id || !startup?.id) return;
    try {
      const data = await fetchUserBets(user.id);
      setUserBets(data.filter((b) => b.startupId === startup.id));
    } catch (err) {
      console.error('Failed to load user bets:', err);
    }
  }, [user?.id, startup?.id]);

  useEffect(() => {
    if (isOpen) {
      loadUserBets();
    }
  }, [isOpen, loadUserBets]);

  if (!isOpen || !startup) return null;

  const comments = startup.comments || [];

  const handleFlag = () => {
    setToastMessage('Pitch flagged for review');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Generate milestone targets dynamically
  const targets = {
    backers: Math.ceil((Number(startup.investorCount) + 5) / 5) * 5,
    raised: Math.ceil((Number(startup.totalRaised) + 2000) / 1000) * 1000,
    price: parseFloat((Number(startup.currentPrice) * 1.25).toFixed(4)),
  };

  const handlePlaceBet = async () => {
    if (!user?.id || isPlacingBet || betAmount <= 0) return;
    if (betAmount > walletBalance) {
      setBetError('Insufficient wallet balance');
      return;
    }
    
    setIsPlacingBet(true);
    setBetError(null);
    try {
      const targetVal = targets[selectedMilestone];
      await placeBet(
        user.id,
        startup.id,
        selectedMilestone,
        targetVal,
        prediction,
        betAmount,
        token,
      );
      
      // Deduct locally from Redux store
      dispatch(deductFromWallet(betAmount));
      
      // Refresh user's placed bets list
      await loadUserBets();
      
      setToastMessage('🔮 Milestone prediction placed!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setBetError(err.message);
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const text = commentText.trim();
    setCommentText('');

    if (token && isRealPitch(startup.id)) {
      try {
        const newComment = await addCommentToPitch(startup.id, text, token);
        dispatch(addComment({
          pitchId: startup.id,
          comment: {
            id: newComment.id,
            author: newComment.user?.username || user?.username || 'Anonymous',
            text: newComment.text,
            timestamp: newComment.createdAt || newComment.timestamp || new Date().toISOString(),
          },
        }));
      } catch (err) {
        console.error('Failed to post comment to backend:', err);
      }
    } else {
      // Local fallback for demo pitches
      dispatch(addComment({
        pitchId: startup.id,
        comment: {
          id: Date.now().toString(),
          author: user?.username || 'Anonymous',
          text,
          timestamp: new Date().toISOString(),
        },
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl h-[85vh] rounded-2xl border border-white/10 bg-[hsl(240,10%,6%)]/95 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Neon top border line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-60" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-start justify-between relative shrink-0">
          {showToast && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/90 border border-[#00FF66]/50 text-[#00FF66] px-4 py-2 rounded-full text-xs font-semibold shadow-[0_0_15px_rgba(0,255,102,0.25)] animate-in slide-in-from-top-2 fade-in z-10 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" /> {toastMessage}
            </div>
          )}

          <div className="flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30">
                {startup.category}
              </span>
              <span className="text-[10px] text-white/40">Idea Stage</span>
              <span className="text-white/10">|</span>
              {startup.founder?.isStealth ? (
                <span className="text-[10px] italic text-white/30">👤 Stealth Founder</span>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                  <span className="font-semibold text-white/60">👤 @{startup.founder?.username || 'anonymous'}</span>
                  {startup.founder?.linkedInUrl && (
                    <span className="px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-bold">
                      in Verified
                    </span>
                  )}
                  {startup.founder?.badges?.includes('Verified Builder') && (
                    <span className="px-1 py-0.2 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 text-[8px] font-bold">
                      🏆 Verified Builder
                    </span>
                  )}
                  {startup.founder?.badges?.includes('First-time Founder') && (
                    <span className="px-1 py-0.2 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[8px] font-bold">
                      🌱 First-Time Founder
                    </span>
                  )}
                </div>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-white leading-snug">{startup.problem}</h3>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleFlag}
              className="text-white/35 hover:text-[#FF3366] transition-colors p-2 rounded-lg hover:bg-white/5"
              title="Report Pitch"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable details body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Solution Pitch */}
          <div className="p-4 rounded-xl bg-[#00FF66]/5 border border-[#00FF66]/10">
            <h4 className="text-xs font-bold text-[#00FF66] uppercase tracking-wider mb-1">Proposed Solution</h4>
            <p className="text-base text-white/90 leading-relaxed font-medium">{startup.solution}</p>
          </div>

          {/* Core Analytics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Briefcase className="w-4 h-4" /> Who Pays?
              </div>
              <p className="text-sm font-semibold text-white/90 leading-snug">{startup.whoPays}</p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Clock className="w-4 h-4" /> Why Now?
              </div>
              <p className="text-sm font-semibold text-white/90 leading-snug">{startup.whyNow}</p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <HelpCircle className="w-4 h-4" /> Startup Ask
              </div>
              <p className="text-sm font-semibold text-white/90 leading-snug">{startup.ask}</p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Milestone className="w-4 h-4 text-[#00FF66]" /> Traction snapshot
              </div>
              <p className="text-sm font-mono font-bold text-[#00FF66] leading-snug">
                {startup.tractionSnapshot || 'Ideation & prototyping phase'}
              </p>
            </div>
          </div>

          {/* Founder Credibility */}
          {startup.founderCredibility && (
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1.5">
                <Award className="w-4 h-4 text-orange-400" /> Founder Credibility
              </div>
              <p className="text-sm text-white/80 leading-relaxed italic">
                "{startup.founderCredibility}"
              </p>
            </div>
          )}

          {/* Financials & Market Stats */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border border-white/10 bg-black/40">
            <div className="text-center">
              <TrendingUp className="w-4 h-4 text-[#00FF66] mx-auto mb-1" />
              <p className="font-mono text-base font-extrabold">{formatCurrency(startup.totalRaised)}</p>
              <p className="text-[10px] text-white/35">Total Raised</p>
            </div>
            <div className="text-center border-x border-white/10">
              <Users className="w-4 h-4 text-white/40 mx-auto mb-1" />
              <p className="font-mono text-base font-extrabold">{startup.investorCount}</p>
              <p className="text-[10px] text-white/35">Backers</p>
            </div>
            <div className="text-center">
              <span className={`inline-block font-mono text-base font-extrabold ${tickerColorClass}`}>
                ${tickerPrice.toFixed(4)}
              </span>
              <p className="text-[10px] text-white/35">Current Price/Share</p>
            </div>
          </div>

          {/* Milestone Predictions Section */}
          <div className="p-4 rounded-xl border border-[#00FF66]/20 bg-[#00FF66]/[0.02] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5">
                🔮 Predict Startup Milestones
              </h4>
              <span className="text-[10px] text-white/30">Payout: 2.0x (3d expiry)</span>
            </div>

            {/* Milestone type selector tabs */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'backers', label: 'Backers', desc: `Target: ${targets.backers}` },
                { id: 'raised', label: 'Funding', desc: `Target: ${formatCurrency(targets.raised)}` },
                { id: 'price', label: 'Share Price', desc: `Target: $${targets.price.toFixed(4)}` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedMilestone(tab.id);
                    setBetError(null);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedMilestone === tab.id
                      ? 'bg-[#00FF66]/10 border-[#00FF66]/40 text-white'
                      : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04]'
                  }`}
                >
                  <p className="text-xs font-bold">{tab.label}</p>
                  <p className="text-[9px] text-[#00FF66]/70 mt-0.5">{tab.desc}</p>
                </button>
              ))}
            </div>

            {/* Check if already bet on this milestone */}
            {(() => {
              const existingBet = userBets.find((b) => b.milestoneType === selectedMilestone && !b.isResolved);
              if (existingBet) {
                return (
                  <div className="p-3 rounded-lg border border-[#00FF66]/10 bg-[#00FF66]/5 flex justify-between items-center text-xs">
                    <span className="text-white/50">Active Prediction:</span>
                    <span className="font-bold font-mono">
                      {existingBet.prediction.toUpperCase()} (${existingBet.betAmount})
                    </span>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {/* Yes/No prediction selector */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPrediction('yes')}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all border ${
                        prediction === 'yes'
                          ? 'bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66]'
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.04]'
                      }`}
                    >
                      👍 YES (Startup hits target)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrediction('no')}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all border ${
                        prediction === 'no'
                          ? 'bg-[#FF3366]/20 border-[#FF3366]/50 text-[#FF3366]'
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.04]'
                      }`}
                    >
                      👎 NO (Startup misses target)
                    </button>
                  </div>

                  {/* Bet Amount controls */}
                  <div className="flex items-center gap-3">
                    <div className="w-1/2">
                      <label className="block text-[10px] text-white/30 mb-1">Predict Amount</label>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00FF66]/40"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-white/30 mb-1">Quick Select</label>
                      <div className="grid grid-cols-3 gap-1">
                        {[100, 500, 1000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setBetAmount(amt)}
                            className={`py-1.5 rounded-md text-[10px] font-mono border transition-all ${
                              betAmount === amt
                                ? 'bg-[#00FF66]/20 border-[#00FF66]/40 text-[#00FF66]'
                                : 'bg-white/5 border-white/5 text-white/45 hover:bg-white/8'
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {betError && (
                    <p className="text-[10px] text-[#FF3366] font-semibold">{betError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handlePlaceBet}
                    disabled={isPlacingBet || betAmount <= 0}
                    className="w-full py-2 bg-[#00FF66]/10 border border-[#00FF66]/30 hover:bg-[#00FF66]/20 text-[#00FF66] font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    {isPlacingBet ? 'Placing Prediction...' : 'Place Milestone Prediction'}
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Founder Updates Section */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white/50 mb-3 flex items-center gap-1.5">
              📢 Founder Updates (30s Earnings Calls)
            </h4>
            {startup.updates && startup.updates.length > 0 ? (
              <div className="border border-blue-500/25 rounded-xl bg-blue-500/[0.02] p-4 space-y-3.5 max-h-[160px] overflow-y-auto">
                {startup.updates.slice().reverse().map((upd, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-[#00FF66]">@{startup.founder?.username || 'founder'}</span>
                      <span className="text-[9px] text-white/30">
                        {new Date(upd.createdAt).toLocaleDateString()} {new Date(upd.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed italic">"{upd.text}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-white/10 rounded-xl bg-white/[0.01] p-4 text-center text-white/20 text-xs italic">
                No updates posted yet.
              </div>
            )}
          </div>

          {/* Comments section inside Modal */}
          <div>
            <h4 className="text-sm font-semibold text-white/50 mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Discussion ({comments.length})
            </h4>

            <div className="border border-white/15 rounded-xl bg-black/20 p-4 space-y-4 max-h-[220px] overflow-y-auto mb-4">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-white/20 text-xs">
                  No comments yet. Share your feedback below!
                </div>
              ) : (
                comments.map((c) => {
                  const authorName = c.user?.username || c.author || 'Anonymous';
                  const displayTime = new Date(c.createdAt || c.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={c.id} className="flex gap-3 text-xs">
                      <div className="w-6 h-6 rounded-full bg-[#00FF66]/20 border border-[#00FF66]/30 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-[#00FF66]">{authorName[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-white/80">@{authorName}</span>
                          <span className="text-[9px] text-white/20">
                            {displayTime}
                          </span>
                        </div>
                        <p className="text-white/60 mt-0.5 leading-relaxed break-words">{c.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment input form */}
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
              {user ? (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    maxLength={200}
                    className="flex-1 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#00FF66]/40"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="p-2.5 rounded-lg bg-[#00FF66]/20 text-[#00FF66] hover:bg-[#00FF66]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <p className="text-xs text-white/30 text-center w-full py-1">Sign in to leave a comment</p>
              )}
            </form>
          </div>

        </div>

        {/* Modal Decision Footer */}
        <div className="p-6 border-t border-white/10 bg-black/60 flex gap-3 shrink-0">
          <button
            onClick={() => {
              onPass(startup);
              onClose();
            }}
            className="w-1/3 py-3 rounded-xl bg-transparent border border-white/10 text-white/60 text-sm font-semibold hover:bg-[#FF3366]/10 hover:text-[#FF3366] hover:border-[#FF3366]/40 transition-all"
          >
            Pass Pitch
          </button>
          <button
            onClick={() => {
              onInvest(startup);
              onClose();
            }}
            className="w-2/3 py-3 rounded-xl bg-[#00FF66] text-black text-sm font-extrabold hover:bg-[#00FF66]/80 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]"
          >
            Invest in Pitch
          </button>
        </div>

      </div>
    </div>
  );
}
