import { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setHighlightPitchId } from '../../features/pitches/pitchesSlice';
import { addNotification } from '../../features/notifications/notificationsSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateROI } from '../../utils/calculateROI';

const EMPTY_PORTFOLIO = [];

// ── GENERATE REAL ALERTS FROM PITCHES & USER HOLDINGS ─────────────────────────
function generateRealAlerts(pitches, userPortfolio = []) {
  const alerts = [];
  if (!pitches || pitches.length === 0) return alerts;

  const portfolioMap = new Map();
  if (Array.isArray(userPortfolio)) {
    userPortfolio.forEach((h) => {
      portfolioMap.set(h.id, h);
    });
  }

  pitches.forEach((pitch) => {
    const founderName = pitch.founder?.username || 'A founder';
    const pitchTitle = pitch.problem.length > 35 ? pitch.problem.slice(0, 35) + '…' : pitch.problem;
    const price = Number(pitch.currentPrice || 0.01);
    const raised = Number(pitch.totalRaised || 0);

    // 1. Check if user holds shares in this startup -> PERSONAL INVESTMENT ALERTS (HIGHEST PRIORITY)
    if (portfolioMap.has(pitch.id)) {
      const holding = portfolioMap.get(pitch.id);
      const entryPrice = Number(holding.entryPrice || 0.01);
      const shares = Number(holding.sharesBought || 0);
      const currentVal = shares * price;
      const invested = Number(holding.amountInvested || shares * entryPrice);
      const pnlGain = currentVal - invested;
      const roiStr = calculateROI(invested, currentVal);

      if (price > entryPrice) {
        alerts.unshift({
          id: `holding-gain-${pitch.id}-${Math.floor(price * 1000)}`,
          type: 'PORTFOLIO_GAIN',
          emoji: '📈',
          color: '#00FF66',
          pitchId: pitch.id,
          title: `Position Gain: +${roiStr}`,
          msg: `Your investment in "${pitchTitle}" is up ${roiStr}! Live value: ${formatCurrency(Math.round(currentVal))}.`,
          details: `${shares.toFixed(0)} shares @ $${price.toFixed(4)}/sh`,
          isPortfolioAlert: true,
        });
      }

      if (raised > 0) {
        alerts.unshift({
          id: `holding-funding-${pitch.id}-${Math.floor(raised / 500)}`,
          type: 'FUNDING',
          emoji: '💰',
          color: '#FFB800',
          pitchId: pitch.id,
          title: `Funding Milestone: ${pitchTitle}`,
          msg: `"${pitchTitle}" reached ${formatCurrency(raised)} in funding! You hold ${shares.toFixed(0)} shares.`,
          details: `${pitch.investorCount || 0} total investors`,
          isPortfolioAlert: true,
        });
      }
    }

    // 2. Global market activity alerts
    if (raised > 0) {
      alerts.push({
        id: `raised-${pitch.id}`,
        type: 'FUNDING',
        emoji: '💰',
        color: '#FF9900',
        pitchId: pitch.id,
        title: `Ecosystem Funding`,
        msg: `"${pitchTitle}" has raised ${formatCurrency(raised)} from ${pitch.investorCount || 0} backers!`,
        isPortfolioAlert: false,
      });

      alerts.push({
        id: `price-${pitch.id}`,
        type: 'PRICE_UPDATE',
        emoji: '📈',
        color: '#00BFFF',
        pitchId: pitch.id,
        title: `Price Surge`,
        msg: `"${pitchTitle}" share price reached $${price.toFixed(4)}!`,
        isPortfolioAlert: false,
      });
    } else {
      alerts.push({
        id: `pitch-${pitch.id}`,
        type: 'NEW_PITCH',
        emoji: '🚀',
        color: '#00FF66',
        pitchId: pitch.id,
        title: `New Startup Live`,
        msg: `${founderName} launched pitch: "${pitchTitle}" in ${pitch.category}!`,
        isPortfolioAlert: false,
      });
    }

    // 3. Comments / Community engagement
    if (pitch.comments && pitch.comments.length > 0) {
      pitch.comments.slice(-2).forEach((c, idx) => {
        const commentAuthor = c.user?.username || 'An investor';
        const commentText = c.text.length > 35 ? c.text.slice(0, 35) + '…' : c.text;
        const isUserHolding = portfolioMap.has(pitch.id);
        alerts.push({
          id: `comment-${pitch.id}-${idx}`,
          type: 'COMMENT',
          emoji: '💬',
          color: '#FF3366',
          pitchId: pitch.id,
          title: isUserHolding ? `Discussion on Your Holding` : `New Comment`,
          msg: `${commentAuthor}: "${commentText}" on "${pitchTitle}"`,
          isPortfolioAlert: isUserHolding,
        });
      });
    }
  });

  return alerts;
}

// ── FLOATING TOAST ────────────────────────────────────────────────────────────
function LiveToast({ alert, onDismiss, onClick }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => { setVisible(false); }, 5800);
    const t3 = setTimeout(onDismiss, 6400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDismiss]);

  const isClickable = !!alert.pitchId;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
        borderColor: alert.isPortfolioAlert ? '#00FF66' : `${alert.color}40`,
        cursor: isClickable ? 'pointer' : 'default',
        boxShadow: alert.isPortfolioAlert
          ? '0 0 25px rgba(0,255,102,0.25), 0 10px 30px rgba(0,0,0,0.8)'
          : '0 10px 30px rgba(0,0,0,0.6)',
      }}
      className={`pointer-events-auto w-84 sm:w-96 rounded-2xl border bg-[hsl(240,12%,7%)] backdrop-blur-xl px-4 py-3.5 flex items-start gap-3 relative overflow-hidden ${
        isClickable ? 'hover:bg-[hsl(240,12%,10%)] transition-all group' : ''
      }`}
    >
      {/* Top ambient highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: alert.isPortfolioAlert
            ? 'linear-gradient(90deg, transparent, #00FF66, transparent)'
            : `linear-gradient(90deg, transparent, ${alert.color}, transparent)`,
        }}
      />

      <span className="text-2xl shrink-0 mt-0.5">{alert.emoji}</span>
      
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-1.5 mb-1">
          {alert.isPortfolioAlert ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#00FF66] bg-[#00FF66]/20 border border-[#00FF66]/40 px-1.5 py-0.2 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
              YOUR INVESTMENT
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 font-mono">
              MARKET ACTIVITY
            </span>
          )}
        </div>

        <p className={`text-xs font-semibold leading-relaxed text-white/95 ${isClickable ? 'group-hover:text-white' : ''}`}>
          {alert.msg}
        </p>

        {isClickable && (
          <p className="text-[9px] text-[#00FF66]/70 mt-1 font-mono uppercase tracking-wider group-hover:text-[#00FF66] transition-colors flex items-center gap-1">
            Tap to view position & pitch →
          </p>
        )}

        <div className="mt-2 h-[2px] rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: alert.isPortfolioAlert ? '#00FF66' : alert.color,
              animation: 'shrinkBar 5.8s linear forwards',
            }}
          />
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
        aria-label="Dismiss alert"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── TICKER TAPE ───────────────────────────────────────────────────────────────
function TickerTape({ alerts }) {
  const content = alerts.map((a) => `${a.emoji}  ${a.msg}`).join('     •     ');

  return (
    <div className="shrink-0 w-full bg-[hsl(240,12%,5%)] border-b border-white/5 overflow-hidden h-7 flex items-center relative">
      <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-[hsl(240,12%,5%)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-[hsl(240,12%,5%)] to-transparent z-10 pointer-events-none" />
      <div
        className="whitespace-nowrap text-[10px] font-mono font-medium text-white/50 animate-ticker"
        style={{ animationDuration: `${Math.max(content.length * 0.07, 20)}s` }}
      >
        <span>{content}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{content}</span>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LiveAlertSystem() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pitches = useSelector((s) => s.pitches.feed);
  const user = useSelector((s) => s.auth.user);
  const userPortfolio = user?.portfolio || EMPTY_PORTFOLIO;

  const [toasts, setToasts] = useState([]);

  // Compute tickerAlerts purely using useMemo (no setState loop)
  const tickerAlerts = useMemo(() => {
    if (!pitches || pitches.length === 0) return EMPTY_PORTFOLIO;
    const realAlerts = generateRealAlerts(pitches, userPortfolio);
    let displayAlerts = [...realAlerts];
    while (displayAlerts.length < 5 && displayAlerts.length > 0) {
      displayAlerts = [...displayAlerts, ...realAlerts];
    }
    return displayAlerts;
  }, [pitches, userPortfolio]);

  // Keep latest references for periodic toasts without causing re-triggers
  const pitchesRef = useRef(pitches);
  const userPortfolioRef = useRef(userPortfolio);
  useEffect(() => {
    pitchesRef.current = pitches;
    userPortfolioRef.current = userPortfolio;
  }, [pitches, userPortfolio]);

  const hasPitches = (pitches?.length || 0) > 0;

  // Generate periodic toasts of real activity and portfolio alerts
  useEffect(() => {
    if (!hasPitches) return;

    const triggerToast = () => {
      const currentPitches = pitchesRef.current;
      const currentPortfolio = userPortfolioRef.current;
      if (!currentPitches || currentPitches.length === 0) return;

      const allAlerts = generateRealAlerts(currentPitches, currentPortfolio);
      if (allAlerts.length === 0) return;

      // Prioritize portfolio alerts 70% of the time if user has any holdings
      const portfolioAlerts = allAlerts.filter((a) => a.isPortfolioAlert);
      let chosenAlert;
      if (portfolioAlerts.length > 0 && Math.random() < 0.7) {
        chosenAlert = portfolioAlerts[Math.floor(Math.random() * portfolioAlerts.length)];
      } else {
        chosenAlert = allAlerts[Math.floor(Math.random() * allAlerts.length)];
      }

      if (chosenAlert) {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, alert: chosenAlert }]);
        dispatch(addNotification(chosenAlert));
      }
    };

    // First toast on mount
    const timeoutOnMount = setTimeout(triggerToast, 3500);

    // Periodic toasts every 20 seconds
    const interval = setInterval(triggerToast, 20000);

    return () => {
      clearTimeout(timeoutOnMount);
      clearInterval(interval);
    };
  }, [hasPitches, dispatch]);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAlertClick = (alert, id) => {
    dismissToast(id);
    if (alert.pitchId) {
      dispatch(setHighlightPitchId(alert.pitchId));
      navigate('/');
    } else if (alert.isPortfolioAlert) {
      navigate('/portfolio');
    }
  };

  if (!pitches || pitches.length === 0) {
    return null;
  }

  return (
    <>
      <TickerTape alerts={tickerAlerts} />

      <div className="fixed bottom-20 right-4 z-[200] flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map(({ id, alert }) => (
          <LiveToast
            key={id}
            alert={alert}
            onDismiss={() => dismissToast(id)}
            onClick={() => handleAlertClick(alert, id)}
          />
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0%); }
          to   { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: inline-block;
          animation: ticker linear infinite;
        }
        @keyframes shrinkBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </>
  );
}
