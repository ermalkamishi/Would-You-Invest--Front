import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  TrendingUp,
  Users,
  MessageSquare,
  Flag,
  Send,
  HelpCircle,
  Briefcase,
  Award,
  Milestone,
  Clock,
  Sparkles,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { addComment } from '../pitchesSlice';
import { addCommentToPitch } from '../pitchesApi';
import { fetchUserBets, placeBet } from '../betsApi';
import { deductFromWallet } from '../../wallet/walletSlice';

const isRealPitch = (id) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
};

export default function LearnMoreModal({
  isOpen,
  onClose,
  startup,
  tickerPrice,
  tickerColorClass,
  onInvest,
  onPass,
}) {
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
      // Lock background scrolling on body while modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, loadUserBets]);

  if (!isOpen || !startup) return null;

  const comments = startup.comments || [];

  const handleFlag = () => {
    setToastMessage('Pitch flagged for review');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShare = () => {
    const entryPrice = Number(startup.currentPrice)?.toFixed(4) || '0.0100';
    const text = `🚀 Check out "${startup.problem?.slice(0, 50)}" on CapTab!\n\nLive share price: $${entryPrice}/share.`;
    if (navigator.share) {
      navigator.share({ title: 'CapTab Startup', text });
    } else {
      navigator.clipboard.writeText(text);
      setToastMessage('Link copied to clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
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

      dispatch(deductFromWallet(betAmount));
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
        dispatch(
          addComment({
            pitchId: startup.id,
            comment: {
              id: newComment.id,
              author: newComment.user?.username || user?.username || 'Anonymous',
              text: newComment.text,
              timestamp:
                newComment.createdAt ||
                newComment.timestamp ||
                new Date().toISOString(),
            },
          }),
        );
      } catch (err) {
        console.error('Failed to post comment to backend:', err);
      }
    } else {
      dispatch(
        addComment({
          pitchId: startup.id,
          comment: {
            id: Date.now().toString(),
            author: user?.username || 'Anonymous',
            text,
            timestamp: new Date().toISOString(),
          },
        }),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 sm:backdrop-blur-md sm:p-4">
      {/* Desktop Backdrop dismiss */}
      <div className="hidden sm:block absolute inset-0" onClick={onClose} />

      {/* Modal Container: Fullscreen on mobile, Centered Modal on Desktop */}
      <div className="relative w-full h-full sm:h-[88vh] sm:max-w-2xl sm:rounded-2xl border-0 sm:border border-white/10 bg-[hsl(240,12%,6%)] shadow-2xl flex flex-col overflow-hidden animate-in fade-in sm:zoom-in-95 duration-200">
        
        {/* Neon top accent line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-70 z-20" />

        {/* Top Header Navigation */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-[hsl(240,12%,8%)]/90 backdrop-blur-md flex items-center justify-between relative shrink-0 z-10">
          {showToast && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/95 border border-[#00FF66]/60 text-[#00FF66] px-4 py-1.5 rounded-full text-xs font-bold shadow-[0_0_20px_rgba(0,255,102,0.3)] animate-in slide-in-from-top-2 fade-in z-30 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" /> {toastMessage}
            </div>
          )}

          {/* Left: Back / Close button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#00FF66]" />
            <span>Back to Pitch</span>
          </button>

          {/* Center: Live Price */}
          <div className="text-center">
            <span className={`font-mono text-sm sm:text-base font-black ${tickerColorClass || 'text-[#00FF66]'}`}>
              ${(tickerPrice || Number(startup.currentPrice) || 0.01).toFixed(4)}
            </span>
            <span className="text-[9px] text-white/30 block font-mono">/share</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              title="Share Pitch"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleFlag}
              className="p-2 rounded-xl text-white/40 hover:text-[#FF3366] hover:bg-white/5 transition-colors"
              title="Report Pitch"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Pitch Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
          
          {/* Pitch Problem & Category Banner */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30">
                {startup.category}
              </span>
              <span className="text-[10px] text-white/40 font-mono">Idea Stage</span>
              <span className="text-white/10">•</span>
              {startup.founder?.isStealth ? (
                <span className="text-[10px] italic text-white/30">👤 Stealth Founder</span>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                  <span className="font-semibold text-white/70">👤 @{startup.founder?.username || 'anonymous'}</span>
                  {startup.founder?.linkedInUrl && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-bold">
                      in Verified
                    </span>
                  )}
                  {startup.founder?.badges?.includes('Verified Builder') && (
                    <span className="px-1.5 py-0.2 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 text-[8px] font-bold">
                      🏆 Verified Builder
                    </span>
                  )}
                  {startup.founder?.badges?.includes('First-time Founder') && (
                    <span className="px-1.5 py-0.2 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[8px] font-bold">
                      🌱 First-Time Founder
                    </span>
                  )}
                </div>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white leading-snug tracking-tight">
              {startup.problem}
            </h2>
          </div>

          {/* Solution Pitch Card */}
          <div className="p-4 rounded-2xl bg-[#00FF66]/[0.06] border border-[#00FF66]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF66]/10 rounded-full blur-2xl pointer-events-none" />
            <h4 className="text-[10px] font-bold text-[#00FF66] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Proposed Solution
            </h4>
            <p className="text-sm sm:text-base text-white/95 leading-relaxed font-medium">
              {startup.solution}
            </p>
          </div>

          {/* Video Pitch Player */}
          {startup.demoClipUrl && (
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                60s Video Demo Clip
              </h4>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/80 border border-white/10 shadow-inner">
                {getYoutubeEmbedUrl(startup.demoClipUrl) ? (
                  <iframe
                    src={`${getYoutubeEmbedUrl(startup.demoClipUrl)}?autoplay=0&mute=0`}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Pitch Video"
                  />
                ) : (
                  <video src={startup.demoClipUrl} className="w-full h-full object-cover" controls />
                )}
              </div>
            </div>
          )}

          {/* Core Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Briefcase className="w-4 h-4 text-white/60" />
                <span className="font-bold uppercase text-[10px] tracking-wider">Who Pays?</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 leading-snug">{startup.whoPays}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="font-bold uppercase text-[10px] tracking-wider">Why Now?</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 leading-snug">{startup.whyNow}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <HelpCircle className="w-4 h-4 text-white/60" />
                <span className="font-bold uppercase text-[10px] tracking-wider">Funding Ask</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 leading-snug">{startup.ask}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-[#00FF66] text-xs mb-1">
                <Milestone className="w-4 h-4" />
                <span className="font-bold uppercase text-[10px] tracking-wider">Traction Snapshot</span>
              </div>
              <p className="text-xs sm:text-sm font-mono font-bold text-[#00FF66] leading-snug">
                {startup.tractionSnapshot || 'Ideation & prototyping phase'}
              </p>
            </div>
          </div>

          {/* Founder Credibility */}
          {startup.founderCredibility && (
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-orange-400 text-xs mb-1.5">
                <Award className="w-4 h-4" />
                <span className="font-bold uppercase text-[10px] tracking-wider">Founder Credibility</span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic">
                "{startup.founderCredibility}"
              </p>
            </div>
          )}

          {/* Financials & Market Stats Bar */}
          <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl border border-white/10 bg-black/50 shadow-inner">
            <div className="text-center">
              <TrendingUp className="w-4 h-4 text-[#00FF66] mx-auto mb-1" />
              <p className="font-mono text-sm sm:text-base font-extrabold text-white">{formatCurrency(startup.totalRaised)}</p>
              <p className="text-[9px] text-white/35 uppercase tracking-wider font-bold">Total Raised</p>
            </div>
            <div className="text-center border-x border-white/10">
              <Users className="w-4 h-4 text-white/50 mx-auto mb-1" />
              <p className="font-mono text-sm sm:text-base font-extrabold text-white">{startup.investorCount}</p>
              <p className="text-[9px] text-white/35 uppercase tracking-wider font-bold">Backers</p>
            </div>
            <div className="text-center">
              <span className={`inline-block font-mono text-sm sm:text-base font-extrabold ${tickerColorClass || 'text-[#00FF66]'}`}>
                ${(tickerPrice || Number(startup.currentPrice) || 0.01).toFixed(4)}
              </span>
              <p className="text-[9px] text-white/35 uppercase tracking-wider font-bold">Share Price</p>
            </div>
          </div>

          {/* Milestone Predictions Section */}
          <div className="p-4 rounded-2xl border border-[#00FF66]/25 bg-[#00FF66]/[0.02] space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5">
                🔮 Predict Startup Milestones
              </h4>
              <span className="text-[9px] font-mono text-white/40">2.0x Payout (3d expiry)</span>
            </div>

            {/* Selector tabs */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'backers', label: 'Backers', desc: `Target: ${targets.backers}` },
                { id: 'raised', label: 'Funding', desc: `Target: ${formatCurrency(targets.raised)}` },
                { id: 'price', label: 'Price', desc: `Target: $${targets.price.toFixed(4)}` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedMilestone(tab.id);
                    setBetError(null);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedMilestone === tab.id
                      ? 'bg-[#00FF66]/15 border-[#00FF66]/50 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]'
                  }`}
                >
                  <p className="text-xs font-bold">{tab.label}</p>
                  <p className="text-[9px] text-[#00FF66] mt-0.5 font-mono">{tab.desc}</p>
                </button>
              ))}
            </div>

            {(() => {
              const existingBet = userBets.find(
                (b) => b.milestoneType === selectedMilestone && !b.isResolved,
              );
              if (existingBet) {
                return (
                  <div className="p-3 rounded-xl border border-[#00FF66]/20 bg-[#00FF66]/10 flex justify-between items-center text-xs">
                    <span className="text-white/60">Active Prediction:</span>
                    <span className="font-bold font-mono text-[#00FF66]">
                      {existingBet.prediction.toUpperCase()} ({formatCurrency(existingBet.betAmount)})
                    </span>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPrediction('yes')}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all border ${
                        prediction === 'yes'
                          ? 'bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66]'
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.05]'
                      }`}
                    >
                      👍 YES (Hits target)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrediction('no')}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all border ${
                        prediction === 'no'
                          ? 'bg-[#FF3366]/20 border-[#FF3366]/50 text-[#FF3366]'
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.05]'
                      }`}
                    >
                      👎 NO (Misses target)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-1/2">
                      <label className="block text-[9px] uppercase font-bold text-white/30 mb-1">
                        Predict Amount
                      </label>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00FF66]/50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[9px] uppercase font-bold text-white/30 mb-1">
                        Quick Amounts
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[100, 500, 1000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setBetAmount(amt)}
                            className={`py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
                              betAmount === amt
                                ? 'bg-[#00FF66]/20 border-[#00FF66]/40 text-[#00FF66]'
                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {betError && (
                    <p className="text-[11px] text-[#FF3366] font-semibold">{betError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handlePlaceBet}
                    disabled={isPlacingBet || betAmount <= 0}
                    className="w-full py-2.5 bg-[#00FF66] hover:bg-[#00FF66]/80 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                  >
                    {isPlacingBet ? 'Placing Prediction...' : 'Place Prediction ($2x Payout)'}
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Founder Updates Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
              📢 Founder Updates
            </h4>
            {startup.updates && startup.updates.length > 0 ? (
              <div className="border border-blue-500/30 rounded-2xl bg-blue-500/[0.03] p-4 space-y-3 max-h-[160px] overflow-y-auto">
                {startup.updates
                  .slice()
                  .reverse()
                  .map((upd, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-[#00FF66]">
                          @{startup.founder?.username || 'founder'}
                        </span>
                        <span className="text-[9px] text-white/30 font-mono">
                          {new Date(upd.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/85 leading-relaxed italic">"{upd.text}"</p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="border border-white/5 rounded-xl bg-white/[0.01] p-3.5 text-center text-white/25 text-xs italic">
                No founder milestone updates posted yet.
              </div>
            )}
          </div>

          {/* Community Discussion Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Discussion ({comments.length})
            </h4>

            <div className="border border-white/10 rounded-2xl bg-black/30 p-3.5 space-y-3 max-h-[220px] overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-5 text-white/25 text-xs">
                  No comments yet. Share your thoughts below!
                </div>
              ) : (
                comments.map((c) => {
                  const authorName = c.user?.username || c.author || 'Anonymous';
                  const displayTime = new Date(
                    c.createdAt || c.timestamp || new Date(),
                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={c.id} className="flex gap-2.5 text-xs">
                      <div className="w-6 h-6 rounded-full bg-[#00FF66]/20 border border-[#00FF66]/30 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-[#00FF66]">
                          {authorName[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-white/80">@{authorName}</span>
                          <span className="text-[9px] text-white/20 font-mono">
                            {displayTime}
                          </span>
                        </div>
                        <p className="text-white/70 mt-0.5 leading-relaxed break-words">{c.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment input form */}
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2 pt-1">
              {user ? (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add your investor perspective..."
                    maxLength={200}
                    className="flex-1 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#00FF66]/50"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="p-2.5 rounded-xl bg-[#00FF66]/20 text-[#00FF66] hover:bg-[#00FF66] hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <p className="text-xs text-white/30 text-center w-full py-1.5">Sign in to leave a comment</p>
              )}
            </form>
          </div>

        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-white/10 bg-[hsl(240,12%,7%)]/95 backdrop-blur-md flex gap-2.5 shrink-0 z-10">
          <button
            onClick={() => {
              onPass(startup);
              onClose();
            }}
            className="w-1/3 py-3 rounded-xl bg-transparent border border-white/10 text-white/60 text-xs sm:text-sm font-semibold hover:bg-[#FF3366]/10 hover:text-[#FF3366] hover:border-[#FF3366]/40 transition-all"
          >
            Pass
          </button>
          <button
            onClick={() => {
              onInvest(startup);
              onClose();
            }}
            className="w-2/3 py-3 rounded-xl bg-[#00FF66] text-black text-xs sm:text-sm font-black hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] flex items-center justify-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            Invest in Pitch
          </button>
        </div>

      </div>
    </div>
  );
}
