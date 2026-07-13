import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setHighlightPitchId } from '../../features/pitches/pitchesSlice';

// ── RSS NEWS FETCHER ─────────────────────────────────────────────────────────
// Uses rss2json.com as a free CORS-friendly proxy to fetch real news from TechCrunch
const NEWS_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://venturebeat.com/feed/',
];

const CATEGORY_KEYWORDS = {
  'AI':       ['ai', 'artificial intelligence', 'llm', 'openai', 'model', 'machine learning', 'gpt', 'gemini', 'claude', 'automation', 'agent'],
  'Climate':  ['climate', 'ev', 'electric vehicle', 'clean energy', 'carbon', 'solar', 'green', 'sustainability', 'charging'],
  'Fintech':  ['fintech', 'payment', 'banking', 'crypto', 'blockchain', 'startup funding', 'neobank', 'lending', 'insurance'],
  'Consumer': ['consumer', 'retail', 'marketplace', 'e-commerce', 'subscription', 'd2c', 'direct-to-consumer'],
  'Health':   ['health', 'mental health', 'biotech', 'medtech', 'pharma', 'hospital', 'wellness', 'therapy'],
  'EdTech':   ['edtech', 'education', 'learning', 'university', 'skills', 'training', 'school'],
  'B2B SaaS': ['saas', 'enterprise', 'b2b', 'software', 'productivity', 'workflow', 'crm', 'erp', 'cloud'],
};

function getNewsEmoji(category) {
  const map = { AI: '🤖', Climate: '🌱', Fintech: '💰', Consumer: '🛒', Health: '🏥', EdTech: '📚', 'B2B SaaS': '⚙️' };
  return map[category] || '📰';
}

function scoreArticleForCategory(title, category) {
  const keywords = CATEGORY_KEYWORDS[category] || [];
  const t = (title || '').toLowerCase();
  return keywords.filter((kw) => t.includes(kw)).length;
}

async function fetchNews() {
  const results = [];
  for (const feed of NEWS_FEEDS) {
    try {
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        results.push(...data.items.map((item) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
        })));
      }
    } catch {
      // silently ignore any individual feed failures
    }
  }
  return results;
}

function matchArticleToPitch(articles, pitches) {
  if (!articles.length || !pitches.length) return null;

  let bestScore = 0;
  let bestArticle = null;
  let bestPitch = null;

  // Shuffle for variety
  const shuffledArticles = [...articles].sort(() => Math.random() - 0.5).slice(0, 8);

  for (const article of shuffledArticles) {
    for (const pitch of pitches) {
      const score = scoreArticleForCategory(article.title, pitch.category);
      if (score > bestScore) {
        bestScore = score;
        bestArticle = article;
        bestPitch = pitch;
      }
    }
  }

  if (!bestPitch || bestScore === 0) {
    // If nothing matched, pick a random article + random pitch
    bestArticle = shuffledArticles[0];
    bestPitch = pitches[Math.floor(Math.random() * pitches.length)];
  }

  const emoji = getNewsEmoji(bestPitch.category);
  const shortTitle = bestArticle.title.length > 65
    ? bestArticle.title.slice(0, 65) + '…'
    : bestArticle.title;

  return {
    type: 'REAL_NEWS',
    emoji,
    color: '#00BFFF',
    pitchId: bestPitch.id,
    articleUrl: bestArticle.link,
    msg: `${emoji} Real news: "${shortTitle}" — relevant to "${bestPitch.problem.slice(0, 40)}…"`,
  };
}

// ── FALLBACK alerts (used only when news fails to load) ──────────────────────
const FALLBACK_ALERTS = [
  { emoji: '🔥', color: '#FF9900', msg: 'TechCrunch: AI sector funding hits record high this quarter' },
  { emoji: '🌱', color: '#00FF66', msg: 'Bloomberg: EV adoption up 45% YoY — climate startups in high demand' },
  { emoji: '💰', color: '#00BFFF', msg: 'Forbes: Fintech startup exits surge — best time to back early ideas' },
  { emoji: '🤖', color: '#FF3366', msg: 'WSJ: LLM costs down 90% in 18 months — AI startups more viable than ever' },
  { emoji: '📈', color: '#FF9900', msg: 'Reuters: Seed-stage valuations up 30% — early investors are winning' },
];

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
      className={`pointer-events-auto w-80 rounded-xl border bg-[hsl(240,12%,7%)] backdrop-blur-sm shadow-2xl px-4 py-3 flex items-start gap-3 ${
        isClickable ? 'hover:bg-[hsl(240,12%,10%)] transition-colors group' : ''
      }`}
    >
      <span className="text-xl shrink-0 mt-0.5">{alert.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold leading-relaxed text-white/90 ${isClickable ? 'group-hover:text-white' : ''}`}>
          {alert.msg}
        </p>
        {alert.type === 'REAL_NEWS' && (
          <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono text-[#00BFFF]/60 uppercase tracking-wider">
            <span className="w-1 h-1 rounded-full bg-[#00BFFF] inline-block animate-pulse" />
            Live news · Tap to view pitch
          </span>
        )}
        {isClickable && alert.type !== 'REAL_NEWS' && (
          <p className="text-[9px] text-white/30 mt-0.5 group-hover:text-white/50 transition-colors">
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

  const [newsArticles, setNewsArticles] = useState([]);
  const [tickerAlerts, setTickerAlerts] = useState(() =>
    FALLBACK_ALERTS.slice(0, 5)
  );
  const [toasts, setToasts] = useState([]);
  const intervalRef = useRef(null);

  // Load real news once on mount
  useEffect(() => {
    fetchNews().then((articles) => {
      if (articles.length > 0) {
        setNewsArticles(articles);
        // Pre-populate ticker with real headlines
        const initialAlerts = articles.slice(0, 5).map((article) => ({
          emoji: '📰',
          color: '#00BFFF',
          msg: article.title.length > 80 ? article.title.slice(0, 80) + '…' : article.title,
        }));
        setTickerAlerts(initialAlerts);
      }
    });
  }, []);

  const generateNextAlert = useCallback(() => {
    if (newsArticles.length > 0 && pitches.length > 0) {
      return matchArticleToPitch(newsArticles, pitches);
    }
    // Fall back to a random static fallback
    return FALLBACK_ALERTS[Math.floor(Math.random() * FALLBACK_ALERTS.length)];
  }, [newsArticles, pitches]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const alert = generateNextAlert();
      if (!alert) return;
      setTickerAlerts((prev) => [...prev.slice(-9), alert]);
      const id = Date.now();
      setToasts((prev) => [...prev, { id, alert }]);
    }, 20000); // Every 20 seconds

    return () => clearInterval(intervalRef.current);
  }, [generateNextAlert]);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAlertClick = (alert, id) => {
    if (!alert.pitchId) return;
    dispatch(setHighlightPitchId(alert.pitchId));
    dismissToast(id);
    navigate('/');
  };

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
