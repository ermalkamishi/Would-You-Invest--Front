import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setHighlightPitchId } from '../../features/pitches/pitchesSlice';

// ── GENERATE REAL ALERTS FROM PITCHES ─────────────────────────────────────────
function generateRealAlerts(pitches) {
  const alerts = [];
  if (!pitches || pitches.length === 0) return alerts;

  pitches.forEach((pitch) => {
    // 1. Pitch creation event
    const founderName = pitch.founder?.username || 'A founder';
    const pitchTitle = pitch.problem.length > 40 ? pitch.problem.slice(0, 40) + '…' : pitch.problem;
    
    alerts.push({
      id: `pitch-${pitch.id}`,
      type: 'NEW_PITCH',
      emoji: '🚀',
      color: '#00FF66',
      pitchId: pitch.id,
      msg: `${founderName} launched a new pitch: "${pitchTitle}" in ${pitch.category}!`,
    });

    // 2. Funding/Raised event
    const raised = Number(pitch.totalRaised || 0);
    if (raised > 0) {
      alerts.push({
        id: `raised-${pitch.id}`,
        type: 'FUNDING',
        emoji: '💰',
        color: '#FF9900',
        pitchId: pitch.id,
        msg: `"${pitchTitle}" has raised $${raised.toLocaleString()} from ${pitch.investorCount || 0} investor(s)!`,
      });
      
      // 3. Price change event
      const price = Number(pitch.currentPrice || 0);
      alerts.push({
        id: `price-${pitch.id}`,
        type: 'PRICE_UPDATE',
        emoji: '📈',
        color: '#00BFFF',
        pitchId: pitch.id,
        msg: `"${pitchTitle}" share price is up to $${price.toFixed(4)}!`,
      });
    }

    // 4. Comment events
    if (pitch.comments && pitch.comments.length > 0) {
      pitch.comments.forEach((c, idx) => {
        const commentAuthor = c.user?.username || 'An investor';
        const commentText = c.text.length > 40 ? c.text.slice(0, 40) + '…' : c.text;
        alerts.push({
          id: `comment-${pitch.id}-${idx}`,
          type: 'COMMENT',
          emoji: '💬',
          color: '#FF3366',
          pitchId: pitch.id,
          msg: `${commentAuthor} commented: "${commentText}" on "${pitchTitle}"`,
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
    const t2 = setTimeout(() => { setVisible(false); }, 5200);
    const t3 = setTimeout(onDismiss, 5800);
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
        borderColor: `${alert.color}40`,
        cursor: isClickable ? 'pointer' : 'default',
      }}
      className={`pointer-events-auto w-80 rounded-xl border bg-[hsl(240,12%,7%)] backdrop-blur-sm shadow-2xl px-4 py-3 flex items-start gap-3 relative ${
        isClickable ? 'hover:bg-[hsl(240,12%,10%)] transition-colors group' : ''
      }`}
    >
      <span className="text-xl shrink-0 mt-0.5">{alert.emoji}</span>
      <div className="flex-1 min-w-0 pr-6">
        <p className={`text-xs font-semibold leading-relaxed text-white/90 ${isClickable ? 'group-hover:text-white' : ''}`}>
          {alert.msg}
        </p>
        {isClickable && (
          <p className="text-[9px] text-[#00FF66]/60 mt-1 font-mono uppercase tracking-wider group-hover:text-[#00FF66] transition-colors">
            Tap to view pitch →
          </p>
        )}
        <div className="mt-1.5 h-[2px] rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: alert.color,
              animation: 'shrinkBar 5s linear forwards',
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
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="w-full bg-[hsl(240,12%,5%)] border-b border-white/5 overflow-hidden h-7 flex items-center relative">
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

  const [tickerAlerts, setTickerAlerts] = useState([]);
  const [toasts, setToasts] = useState([]);
  const intervalRef = useRef(null);

  // Sync tickerAlerts based on pitches changes
  useEffect(() => {
    if (pitches && pitches.length > 0) {
      const realAlerts = generateRealAlerts(pitches);
      let displayAlerts = [...realAlerts];
      // Repeat alerts to fill the ticker nicely if there are few
      while (displayAlerts.length < 5 && displayAlerts.length > 0) {
        displayAlerts = [...displayAlerts, ...realAlerts];
      }
      setTickerAlerts(displayAlerts);
    } else {
      setTickerAlerts([]);
    }
  }, [pitches]);

  // Generate periodic toasts of real activity
  useEffect(() => {
    if (!pitches || pitches.length === 0) return;

    // Trigger first toast faster on mount/load if there is any activity
    const timeoutOnMount = setTimeout(() => {
      const realAlerts = generateRealAlerts(pitches);
      if (realAlerts.length > 0) {
        const randomAlert = realAlerts[Math.floor(Math.random() * realAlerts.length)];
        const id = Date.now();
        setToasts((prev) => [...prev, { id, alert: randomAlert }]);
      }
    }, 5000);

    intervalRef.current = setInterval(() => {
      const realAlerts = generateRealAlerts(pitches);
      if (realAlerts.length === 0) return;

      const randomAlert = realAlerts[Math.floor(Math.random() * realAlerts.length)];
      const id = Date.now();
      setToasts((prev) => [...prev, { id, alert: randomAlert }]);
    }, 25000); // Trigger toast notification every 25 seconds

    return () => {
      clearTimeout(timeoutOnMount);
      clearInterval(intervalRef.current);
    };
  }, [pitches]);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAlertClick = (alert, id) => {
    if (!alert.pitchId) return;
    dispatch(setHighlightPitchId(alert.pitchId));
    dismissToast(id);
    navigate('/');
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
