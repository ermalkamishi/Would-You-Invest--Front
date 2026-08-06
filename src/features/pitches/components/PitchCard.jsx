import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles, Users, TrendingUp, MessageSquare, Flag, Send, X, ThumbsUp, Share2, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useTickerPrice } from '../../../hooks/useTickerPrice';
import { addComment, upvoteComment, patchPitchStats } from '../pitchesSlice';
import { addCommentToPitch, upvoteCommentApi, fetchInvestmentHistory } from '../pitchesApi';
import { updateProfileSuccess, openLoginModal } from '../../auth/authSlice';
import LearnMoreModal from './LearnMoreModal';
import { API_BASE } from '../../../config';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const isRealPitch = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const generateMockHistory = (startup) => {
  let hash = 0;
  const id = startup.id || '1';
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const points = [];
  const count = 5;
  const baseRaised = Number(startup.totalRaised) || 0;
  
  // Starting point
  points.push({
    id: 'start',
    amountInvested: 0,
    entryPrice: 0.0100,
    sharesBought: 0,
    timestamp: new Date(Date.now() - 3600 * 24 * 7 * 1000).toISOString(),
    cumulativeRaised: 0,
    cumulativePrice: 0.0100,
  });
  
  for (let i = 1; i <= count; i++) {
    const fraction = i / count;
    const raisedAtStep = baseRaised * fraction;
    const computedPrice = parseFloat((0.0015 * Math.sqrt(raisedAtStep)).toFixed(4));
    const priceAtStep = Math.max(0.01, computedPrice);
    points.push({
      id: `mock-${i}`,
      amountInvested: baseRaised / count,
      entryPrice: priceAtStep,
      sharesBought: (baseRaised / count) / priceAtStep,
      timestamp: new Date(Date.now() - 3600 * 24 * (7 - i * 1.4) * 1000).toISOString(),
      cumulativeRaised: parseFloat(raisedAtStep.toFixed(2)),
      cumulativePrice: priceAtStep,
    });
  }
  return points;
};

export default function PitchCard({ startup, isActive, onInvest, onPass }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);

  const [history, setHistory] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartMetric, setChartMetric] = useState('price'); // 'price' | 'raised'

  useEffect(() => {
    let active = true;
    if (isActive && startup.id) {
      if (isRealPitch(startup.id)) {
        setChartLoading(true);
        fetchInvestmentHistory(startup.id)
          .then((data) => {
            if (active) {
              setHistory(data);
            }
          })
          .catch((err) => console.error('Error fetching investment history:', err))
          .finally(() => {
            if (active) setChartLoading(false);
          });
      } else {
        setHistory(generateMockHistory(startup));
      }
    }
    return () => {
      active = false;
    };
  }, [isActive, startup.id, startup.totalRaised]);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (user && startup.founder) {
      setIsFollowing(user.followedFounders?.some((f) => f.id === startup.founder?.id) || false);
    }
  }, [user, startup.founder]);

  const handleFollowToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      dispatch(openLoginModal());
      return;
    }
    if (!startup.founder || startup.founder.id === user.id) return;

    setFollowLoading(true);
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const res = await fetch(`${API_BASE}/users/${user.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ founderId: startup.founder.id }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        dispatch(updateProfileSuccess(updatedUser));
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const [showToast, setShowToast] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const comments = startup.comments || [];
  const { price: tickerPrice, direction: priceDirection } = useTickerPrice(Number(startup.currentPrice));
  
  let tickerColorClass = '';
  if (priceDirection === 'up') {
    tickerColorClass = 'animate-flash-green text-[#00FF66]';
  } else if (priceDirection === 'down') {
    tickerColorClass = 'animate-flash-red text-[#FF3366]';
  } else {
    const priceUp = tickerPrice >= Number(startup.currentPrice);
    tickerColorClass = priceUp ? 'text-[#00FF66]' : 'text-[#FF3366]';
  }

  // Parse YouTube links
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const baseYoutubeUrl = getYoutubeEmbedUrl(startup.demoClipUrl);
  const youtubeEmbedUrl = baseYoutubeUrl && isActive
    ? `${baseYoutubeUrl}?autoplay=1&mute=1&enablejsapi=1`
    : null;

  // Generate deterministic 7-day sparkline points based on pitch ID
  const generateSparklinePoints = (id, basePrice) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const points = [];
    for (let i = 0; i < 7; i++) {
      const val = basePrice * (1 + (Math.sin(hash + i) * 0.12));
      points.push(val);
    }
    points[6] = basePrice;
    
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    
    return points.map((p, idx) => {
      const x = idx * 10;
      const y = 18 - ((p - min) / range) * 16; // Bounds: y in [2, 18]
      return `${x},${y}`;
    }).join(' ');
  };

  // Calculate founder response rate to comments
  const founderComments = comments.filter(
    (c) => c.author === startup.founder?.username || c.author === 'founder'
  );
  const responseRate = comments.length > 0
    ? Math.round((founderComments.length / comments.length) * 100)
    : 100; // Default to 100% responsive if no comments yet

  // Autoplay raw HTML5 video elements when card becomes active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = true; // Mute required for programmatic autoplay
      video.currentTime = 0;
      video.play().catch((err) => {
        console.log('Autoplay blocked by browser policy:', err);
      });
    } else {
      video.pause();
    }
  }, [isActive]);

  const handleFlag = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
  };

  useEffect(() => {
    if (showComments && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [showComments]);

  const handleUpvoteComment = async (commentId) => {
    if (!user) {
      dispatch(openLoginModal());
      return;
    }
    dispatch(upvoteComment({ pitchId: startup.id, commentId, userId: user.id }));

    if (token && typeof startup.id === 'string' && startup.id.includes('-')) {
      try {
        await upvoteCommentApi(commentId, token);
      } catch (err) {
        console.error('Failed to upvote comment on backend:', err);
        dispatch(upvoteComment({ pitchId: startup.id, commentId, userId: user.id }));
      }
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    if (token && typeof startup.id === 'string' && startup.id.includes('-')) {
      try {
        const savedComment = await addCommentToPitch(startup.id, text, token);
        dispatch(addComment({
          pitchId: startup.id,
          comment: savedComment,
        }));
        setCommentText('');
      } catch (err) {
        console.error('Failed to save comment on backend:', err);
      }
    } else {
      dispatch(addComment({
        pitchId: startup.id,
        comment: {
          id: Date.now().toString(),
          author: user?.username || 'Anonymous',
          text,
          timestamp: new Date().toISOString(),
        },
      }));
      setCommentText('');
    }
  };

  const chartData = [];
  
  // Starting launch point
  chartData.push({
    name: 'Launch',
    raised: 0,
    price: 0.0100,
    date: new Date(startup.createdAt || Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString(),
  });

  let runningRaised = 0;
  history.forEach((inv, index) => {
    if (inv.cumulativeRaised !== undefined) {
      if (inv.cumulativeRaised > 0) {
        chartData.push({
          name: `#${index}`,
          raised: inv.cumulativeRaised,
          price: inv.cumulativePrice,
          date: new Date(inv.timestamp).toLocaleDateString(),
        });
      }
    } else {
      runningRaised += Number(inv.amountInvested);
      chartData.push({
        name: `#${index + 1}`,
        raised: parseFloat(runningRaised.toFixed(2)),
        price: Number(inv.entryPrice),
        date: new Date(inv.timestamp).toLocaleDateString(),
      });
    }
  });

  // Ensure current state is included
  const lastEntry = chartData[chartData.length - 1];
  if (!lastEntry || lastEntry.raised < Number(startup.totalRaised)) {
    chartData.push({
      name: 'Current',
      raised: Number(startup.totalRaised),
      price: Number(startup.currentPrice),
      date: 'Now',
    });
  }

  return (
    <div className="w-full h-full rounded-xl border border-white/10 bg-[hsl(240,10%,6%)]/80 backdrop-blur-sm overflow-y-auto no-scrollbar shadow-2xl relative group flex flex-col">
      {/* Neon top border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-50" />

      {/* Header */}
      <div className="p-5 pb-3 relative">
        {/* Toast Notification */}
        {showToast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/90 border border-[#FF3366]/50 text-[#FF3366] px-3 py-1.5 rounded-full text-xs font-semibold shadow-[0_0_10px_rgba(255,51,102,0.2)] animate-in slide-in-from-top-2 fade-in z-10 flex items-center gap-1.5 whitespace-nowrap">
            <Flag className="w-3 h-3" /> Pitch flagged for review
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Founder details & follow badge */}
            <div className="flex flex-wrap items-center gap-2 mt-1 mb-2 text-[10px] text-white/40">
              {startup.founder?.isStealth ? (
                <span className="inline-flex items-center gap-1 italic text-white/30">
                  👤 Stealth Founder
                </span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 font-semibold text-white/60">
                    👤 @{startup.founder?.username || 'anonymous'}
                  </span>
                  {startup.founder && (!user || startup.founder.id !== user.id) && (
                    <button
                      type="button"
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`ml-2 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider transition-all border ${
                        isFollowing
                          ? 'bg-[#00FF66]/10 border-[#00FF66]/30 text-[#00FF66]'
                          : 'bg-white/5 border-white/10 text-white/40 hover:bg-[#00FF66]/10 hover:border-[#00FF66]/30 hover:text-[#00FF66]'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
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
                </>
              )}
            </div>

            <h3 className="text-lg font-bold leading-tight text-white mb-2">{startup.problem}</h3>
          </div>

          <div className="flex flex-col items-end gap-1 text-right ml-3 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={handleFlag}
                className="text-white/20 hover:text-[#FF3366] transition-colors p-1 rounded-full hover:bg-[#FF3366]/10"
                title="Report Pitch"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <span className={`font-mono text-lg font-bold block leading-none ${tickerColorClass}`}>
                ${tickerPrice.toFixed(4)}
              </span>
              <p className="text-[10px] text-white/30 mt-1">/share</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Selector & Traction Chart Header */}
      {!showComments && (
        <div className="flex justify-between items-center px-5 mb-2">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Traction Chart</h4>
          <div className="flex bg-white/5 rounded-md p-0.5 border border-white/10">
            <button
              onClick={() => setChartMetric('price')}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                chartMetric === 'price'
                  ? 'bg-[#00FF66] text-black'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setChartMetric('raised')}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                chartMetric === 'raised'
                  ? 'bg-[#00FF66] text-black'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Raised
            </button>
          </div>
        </div>
      )}

      {/* Chart area — hidden when comments are open */}
      {!showComments && (
        <div className="relative mx-5 flex-1 min-h-[260px] rounded-lg bg-black/60 border border-white/5 p-3 flex flex-col justify-center mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00FF66]/5 to-transparent pointer-events-none" />
          {chartLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#00FF66] animate-spin" />
            </div>
          ) : (
            <div className="w-full h-full min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: -5 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF66" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00FF66" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => chartMetric === 'price' ? `$${v.toFixed(3)}` : `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 12, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                    formatter={(value) => [
                      chartMetric === 'price' ? `$${Number(value).toFixed(4)}` : formatCurrency(value),
                      chartMetric === 'price' ? 'Price/Share' : 'Total Raised'
                    ]}
                    labelFormatter={(label, items) => {
                      const dataPoint = items[0]?.payload;
                      return dataPoint ? `Date: ${dataPoint.date}` : label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartMetric}
                    stroke="#00FF66"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#chartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Comment Panel */}
      {showComments && (
        <div className="mx-5 flex-1 flex flex-col min-h-0 mb-4 rounded-lg border border-white/10 bg-black/40 overflow-hidden">
          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[200px]">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                <MessageSquare className="w-8 h-8 text-white/10 mb-2" />
                <p className="text-white/30 text-xs">No comments yet.</p>
                <p className="text-white/15 text-[10px] mt-0.5">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#00FF66]/20 border border-[#00FF66]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-[#00FF66]">{c.author[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-semibold text-white/80">@{c.author}</span>
                      <span className="text-[9px] text-white/20 shrink-0">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-0.5 leading-relaxed break-words">{c.text}</p>
                    {/* Upvote button */}
                    <button
                      onClick={() => handleUpvoteComment(c.id)}
                      className={`mt-1 flex items-center gap-1 text-[9px] font-bold transition-colors ${
                        (c.upvotedBy || c.likes)?.includes(user?.id || 'anon')
                          ? 'text-[#00FF66]'
                          : 'text-white/25 hover:text-white/50'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {(c.upvotedBy || c.likes)?.length > 0 ? (c.upvotedBy || c.likes).length : 'Like'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment input */}
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2 p-2.5 border-t border-white/8">
            {user ? (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  maxLength={200}
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/20 outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-1.5 rounded-lg bg-[#00FF66]/20 text-[#00FF66] hover:bg-[#00FF66]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <p className="text-xs text-white/30 text-center w-full py-1">Sign in to comment</p>
            )}
          </form>
        </div>
      )}

      {/* Learn more action */}
      {!showComments && (
        <div className="px-5 mb-4">
          <button
            onClick={() => setIsLearnMoreOpen(true)}
            className="w-full py-2.5 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 hover:border-[#00FF66]/30 text-[#00FF66] text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(0,255,102,0.05)]"
          >
            Learn more about this idea →
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div className="mx-5 grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg bg-white/5 border border-white/5 p-2.5 text-center">
          <TrendingUp className="w-4 h-4 text-[#00FF66] mx-auto mb-1" />
          <p className="font-mono text-sm font-bold">{formatCurrency(startup.totalRaised)}</p>
          <p className="text-[10px] text-white/30">Raised</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/5 p-2.5 text-center">
          <Users className="w-4 h-4 text-white/50 mx-auto mb-1" />
          <p className="font-mono text-sm font-bold">{startup.investorCount}</p>
          <p className="text-[10px] text-white/30">Investors</p>
        </div>

        {/* Comments stat — clickable toggle */}
        <button
          onClick={handleToggleComments}
          className={`rounded-lg border p-2.5 text-center transition-all ${
            showComments
              ? 'bg-[#00FF66]/10 border-[#00FF66]/30'
              : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10'
          }`}
        >
          <MessageSquare className={`w-4 h-4 mx-auto mb-1 ${showComments ? 'text-[#00FF66]' : 'text-white/50'}`} />
          <p className={`font-mono text-sm font-bold ${showComments ? 'text-[#00FF66]' : ''}`}>
            {comments.length > 0 ? comments.length : '—'}
          </p>
          <p className="text-[10px] text-white/30">{showComments ? 'Hide' : 'Comments'}</p>
        </button>
      </div>

      {/* Action buttons */}
      <div className="p-5 pt-0 flex gap-2">
        <button
          onClick={() => onPass(startup)}
          className="w-1/4 py-2.5 rounded-lg bg-transparent border border-white/10 text-white/60 text-sm font-medium hover:bg-[#FF3366]/10 hover:text-[#FF3366] hover:border-[#FF3366]/50 transition-all"
        >
          Pass
        </button>
        <button
          onClick={() => onInvest(startup)}
          className="flex-1 py-2.5 rounded-lg bg-[#00FF66] text-black text-sm font-bold hover:bg-[#00FF66]/80 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]"
        >
          Invest
        </button>
        <button
          onClick={() => {
            const entryPrice = Number(startup.currentPrice)?.toFixed(4) || '0.0100';
            const text = `🚀 I backed "${startup.problem?.slice(0, 50)}" at $${entryPrice}/share on CapTab!\n\nThis is a virtual investment game — not real trading. Try it at captab.app`;
            if (navigator.share) {
              navigator.share({ title: 'My CapTab Pick', text });
            } else {
              navigator.clipboard.writeText(text);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2500);
            }
          }}
          title="Share this pick"
          className="w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-400/30 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Modal for detailed breakdown */}
      <LearnMoreModal
        isOpen={isLearnMoreOpen}
        onClose={() => setIsLearnMoreOpen(false)}
        startup={startup}
        tickerPrice={tickerPrice}
        tickerColorClass={tickerColorClass}
        onInvest={onInvest}
        onPass={onPass}
      />
    </div>
  );
}
