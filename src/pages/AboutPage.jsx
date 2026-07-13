import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp, Zap, Users, Flame, ArrowRight,
  Sparkles, BarChart2, Globe, ShieldCheck,
} from 'lucide-react';

/* ─── Section 1 · Hero ──────────────────────────────────────────────── */
const SIGNAL_CARDS = [
  {
    score: 94,
    category: 'AI / SaaS',
    name: 'FreelanceFlow AI',
    desc: 'Invoicing automation that chases unpaid bills for the 80M gig-economy workers.',
    tags: ['Fintech', 'Solo-founder'],
  },
  {
    score: 88,
    category: 'Climate',
    name: 'GridCharge',
    desc: 'Smart EV charger scheduling that syncs to the cleanest energy windows on the grid.',
    tags: ['Hardware', 'Green-tech'],
  },
  {
    score: 79,
    category: 'B2B / Legal',
    name: 'CompliBot',
    desc: 'AI that reads 400-page compliance docs and flags gaps in under 10 seconds.',
    tags: ['Enterprise', 'AI'],
  },
];

function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-24 pt-20 px-4">
      {/* Green neon beam */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] h-[340px]"
          style={{
            background: 'linear-gradient(to bottom, transparent, #00FF66 40%, transparent)',
            filter: 'blur(2px)',
            opacity: 0.6,
          }}
        />
        <div
          className="absolute left-[30%] top-[80px] w-[1px] h-[280px]"
          style={{
            background: 'linear-gradient(to bottom, transparent, #00FF66 50%, transparent)',
            transform: 'rotate(25deg)',
            filter: 'blur(1.5px)',
            opacity: 0.3,
          }}
        />
        <div
          className="absolute right-[25%] top-[60px] w-[1px] h-[260px]"
          style={{
            background: 'linear-gradient(to bottom, transparent, #00FF66 50%, transparent)',
            transform: 'rotate(-20deg)',
            filter: 'blur(1.5px)',
            opacity: 0.25,
          }}
        />
        <div className="absolute inset-0 bg-radial-gradient" style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,255,102,0.07) 0%, transparent 70%)',
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00FF66]/25 bg-[#00FF66]/5 text-xs text-[#00FF66] font-mono mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
          Bet on ideas, not outcomes.
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
          Stop Guessing
          <br />
          <span className="text-[#00FF66]">Which Ideas</span>
          <br />
          Will Win.
        </h1>

        <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          CapTab lets real people vote with fake money on startup pitches — surfacing the ideas the market actually wants, before anyone builds them.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00FF66] text-black font-bold text-sm hover:bg-[#00FF66]/80 transition-all shadow-[0_0_30px_rgba(0,255,102,0.35)]"
          >
            Explore Pitches <ArrowRight className="w-4 h-4" />
          </NavLink>
          <NavLink
            to="/leaderboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white/70 font-medium text-sm hover:bg-white/5 hover:text-white transition-all"
          >
            View Leaderboard <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>

        {/* Signal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {SIGNAL_CARDS.map((card) => (
            <div
              key={card.name}
              className="rounded-xl border border-white/10 bg-[hsl(240,10%,6%)]/80 backdrop-blur-sm p-4 hover:border-[#00FF66]/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-white/30 font-mono uppercase tracking-widest">Investment Signal</span>
                <span className="text-[#00FF66] font-mono font-bold text-sm">{card.score}</span>
              </div>
              <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest mb-1">{card.category}</p>
              <h3 className="font-bold text-white text-base mb-2 group-hover:text-[#00FF66] transition-colors">{card.name}</h3>
              <p className="text-white/40 text-xs leading-relaxed mb-3">{card.desc}</p>
              <div className="flex gap-1.5 flex-wrap">
                {card.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-[#00FF66]/10 border border-[#00FF66]/20 text-[#00FF66]/80">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2 · Scrolling Ticker ─────────────────────────────────── */
const TICKER_ITEMS = [
  { icon: '⚡', label: 'Founder Pitches' },
  { icon: '💰', label: 'Angel Investors' },
  { icon: '🧪', label: 'Idea Validation' },
  { icon: '📱', label: '60-Second Pitches' },
  { icon: '📈', label: 'Virtual Markets' },
  { icon: '👆', label: 'Swipe & Invest' },
  { icon: '🏆', label: 'Live Leaderboard' },
  { icon: '🤖', label: 'AI Startups' },
  { icon: '🌱', label: 'Climate Tech' },
  { icon: '🔥', label: 'Hot Today' },
  { icon: '🎯', label: 'Market Signal' },
  { icon: '🚀', label: 'Pre-Revenue Ideas' },
];

function TickerSection() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop

  return (
    <section className="relative border-y border-white/5 py-5 overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-20 z-10"
        style={{ background: 'linear-gradient(to right, hsl(240,10%,4%), transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-20 z-10"
        style={{ background: 'linear-gradient(to left, hsl(240,10%,4%), transparent)' }} />

      <p className="text-center text-[9px] text-white/20 font-mono uppercase tracking-[0.3em] mb-4">
        Signals from the community
      </p>

      <div className="overflow-hidden">
        <div className="ticker-track">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-6 border-r border-white/8 shrink-0"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-white/50 whitespace-nowrap font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3 · Animated Flow Diagram ────────────────────────────── */
function FlowSection() {
  // viewBox: 0 0 800 300
  const cx = 400; const cy = 150; // center node
  const rx = 660; const ry = 150; // right node

  const leftNodes = [
    { label: 'Founder', sub: 'submits pitch', cy: 60 },
    { label: 'Idea', sub: '60-second pitch', cy: 150 },
    { label: 'Community', sub: 'votes w/ capital', cy: 240 },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            From <span className="text-[#00FF66]">pitch</span> to portfolio
          </h2>
          <p className="text-white/40 text-base">A continuous signal loop running 24/7.</p>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar rounded-2xl border border-white/5 bg-white/[0.015] p-4">
          <svg viewBox="0 0 800 300" className="w-full" style={{ minWidth: 380 }}>
            {/* Column labels */}
            <text x="90" y="18" fill="rgba(255,255,255,0.22)" fontSize="8" fontFamily="monospace" letterSpacing="2" textAnchor="middle">INPUT LAYER</text>
            <text x="400" y="18" fill="rgba(255,255,255,0.22)" fontSize="8" fontFamily="monospace" letterSpacing="2" textAnchor="middle">CAPTAB ENGINE</text>
            <text x="660" y="18" fill="rgba(255,255,255,0.22)" fontSize="8" fontFamily="monospace" letterSpacing="2" textAnchor="middle">MARKET SIGNAL</text>

            {/* ── Paths + animated dots: left nodes → center ── */}
            {leftNodes.map((node, i) => {
              const id = `lp${i}`;
              const d = `M 162 ${node.cy} C 280 ${node.cy}, 300 ${cy}, ${cx - 46} ${cy}`;
              return (
                <g key={id}>
                  <path d={d} stroke="rgba(0,255,102,0.18)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                  <path id={id} d={d} fill="none" />
                  <circle r="3.5" fill="#00FF66" opacity="0.95">
                    <animateMotion dur={`${2.2 + i * 0.5}s`} begin={`${i * 0.7}s`} repeatCount="indefinite">
                      <mpath href={`#${id}`} />
                    </animateMotion>
                  </circle>
                </g>
              );
            })}

            {/* ── Path + animated dot: center → right ── */}
            {(() => {
              const d = `M ${cx + 46} ${cy} C ${cx + 130} ${cy}, ${rx - 110} ${ry}, ${rx - 52} ${ry}`;
              return (
                <g>
                  <path d={d} stroke="rgba(0,255,102,0.18)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                  <path id="rp" d={d} fill="none" />
                  <circle r="3.5" fill="#00FF66" opacity="0.95">
                    <animateMotion dur="1.6s" begin="0.2s" repeatCount="indefinite">
                      <mpath href="#rp" />
                    </animateMotion>
                  </circle>
                </g>
              );
            })()}

            {/* ── Left input nodes ── */}
            {leftNodes.map((node, i) => (
              <g key={`ln-${i}`}>
                <rect x="10" y={node.cy - 22} width="152" height="44" rx="10"
                  fill="hsl(240,10%,9%)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {/* coloured dot */}
                <circle cx="30" cy={node.cy} r="5" fill="rgba(0,255,102,0.6)" />
                <text x="44" y={node.cy - 5} fill="rgba(255,255,255,0.9)" fontSize="10.5" fontWeight="700" fontFamily="system-ui, sans-serif">{node.label}</text>
                <text x="44" y={node.cy + 9} fill="rgba(255,255,255,0.3)" fontSize="8.5" fontFamily="system-ui, sans-serif">{node.sub}</text>
              </g>
            ))}

            {/* ── Center node — CapTab Engine ── */}
            {/* outer glow ring */}
            <circle cx={cx} cy={cy} r="58" fill="rgba(0,255,102,0.04)" stroke="rgba(0,255,102,0.08)" strokeWidth="16" />
            <rect x={cx - 46} y={cy - 46} width="92" height="92" rx="16"
              fill="hsl(240,10%,11%)" stroke="rgba(0,255,102,0.45)" strokeWidth="1.5" />
            <text x={cx} y={cy - 4} fill="#00FF66" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="system-ui, sans-serif">CapTab</text>
            <text x={cx} y={cy + 12} fill="rgba(255,255,255,0.45)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">ENGINE</text>

            {/* ── Right output node ── */}
            <rect x={rx - 52} y={ry - 26} width="132" height="52" rx="12"
              fill="hsl(240,10%,9%)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            {/* pill accent */}
            <rect x={rx - 20} y={ry - 10} width="25" height="20" rx="10"
              fill="none" stroke="rgba(0,255,102,0.5)" strokeWidth="1.5" />
            <circle cx={rx} cy={ry} r="4" fill="rgba(0,255,102,0.7)" />
            <text x={rx + 28} y={ry - 5} fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">Market</text>
            <text x={rx + 28} y={ry + 9} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" fontFamily="system-ui, sans-serif">Signal Out</text>
          </svg>
        </div>

        {/* Feature pillars below diagram */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { icon: Zap, title: 'Instant Signal', desc: 'See which pitches attract virtual capital in real time.' },
            { icon: BarChart2, title: 'Ranked Insights', desc: 'Leaderboards surface the hottest ideas by momentum.' },
            { icon: Users, title: 'Dual Roles', desc: 'Join as a Founder to pitch, or as an Investor to swipe.' },
            { icon: ShieldCheck, title: 'Zero Risk', desc: 'All capital is virtual. Experiment freely, learn deeply.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-[#00FF66]/25 transition-all">
              <div className="w-9 h-9 rounded-lg bg-[#00FF66]/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-[#00FF66]" />
              </div>
              <p className="font-semibold text-sm text-white mb-1">{title}</p>
              <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 4 · Call to Action ────────────────────────────────────── */
function CtaSection() {
  return (
    <section className="relative px-4 py-28 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,255,102,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00FF66]/25 bg-[#00FF66]/10 text-[#00FF66] text-xs font-mono mb-8">
          <Flame className="w-3 h-3" />
          Join the next generation of idea validation
        </div>

        <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-6">
          Your idea could be
          <br />
          <span className="text-[#00FF66]">the next signal.</span>
        </h2>

        <p className="text-white/40 text-lg max-w-lg mx-auto mb-12 leading-relaxed">
          Whether you're a founder with 60 seconds or an investor with instincts — CapTab is where raw ideas meet real conviction.
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <NavLink
            to="/create"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#00FF66] text-black font-bold text-base hover:bg-[#00FF66]/90 transition-all shadow-[0_0_40px_rgba(0,255,102,0.4)]"
          >
            <Sparkles className="w-4 h-4" />
            Pitch Your Idea
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </NavLink>
          <NavLink
            to="/"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/15 text-white font-semibold text-base hover:bg-white/5 transition-all"
          >
            <Globe className="w-4 h-4 text-white/40" />
            Explore the Feed
            <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
          {[
            { value: '$0', label: 'Real money at risk' },
            { value: '60s', label: 'Pitch format' },
            { value: '∞', label: 'Signals generated' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-[#00FF66] font-mono">{value}</p>
              <p className="text-xs text-white/30 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="w-full">
      <HeroSection />
      <TickerSection />
      <FlowSection />
      <CtaSection />
    </div>
  );
}
