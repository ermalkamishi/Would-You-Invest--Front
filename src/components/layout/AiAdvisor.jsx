import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, X, Send, Bot, Loader, ChevronDown } from 'lucide-react';
import { API_BASE } from '../../config';

// AI models and keys are now managed securely on the backend proxy at /ai/chat.

const SYSTEM_PROMPT = `You are CapTab AI — the intelligent investment advisor embedded inside CapTab, a virtual startup pitch platform where users allocate fake virtual capital ($10,000 starting balance) to back startup pitches they believe in.

Your role is to:
1. Help investors understand the startups on the platform — their problems, solutions, market potential, and risks.
2. Give detailed investment reasoning when asked about specific pitches (explain why someone should or shouldn't invest based on the idea, market timing, founder credibility, traction, and category trends).
3. Explain how CapTab works: bonding curve pricing (Price = 0.0015 * sqrt(Total Raised)), daily stipends (+$1,000/day), 20% concentration limit, conviction bonuses for top 10 pitches, leaderboard standings.
4. Answer general startup investing questions (what is a good early-stage indicator? what does "pre-product / idea stage" mean? etc.)
5. Be truthful, specific, and concise. Never make up data. If you don't have live data for a specific pitch, explain what information you'd look for.
6. Keep answers focused and practical — you're talking to first-time virtual investors who want to learn and win.

Platform-specific facts you know:
- Share price follows the formula: Price = 0.0015 × √(totalRaised). A pitch with $89,200 raised trades at ~$0.4480/share.
- Users start with $10,000 virtual cash. They can claim +$1,000/day stipend.
- Max 20% of wallet can go into a single idea (concentration limit).
- If a pitch enters the global Top 10 by funds raised, backers get a +20% conviction bonus on their returns.
- Categories tracked: AI, Climate, Fintech, Consumer, Health, EdTech, B2B SaaS, etc.
- Users can be Founders (pitch creators) or Angel Investors.

Always be encouraging but honest. If an idea looks risky, say so with reasoning. If it looks strong, explain the competitive moat. Keep answers under 200 words unless the user explicitly asks for more detail.`;

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end">
      <div className="w-7 h-7 rounded-full bg-[#00FF66]/20 border border-[#00FF66]/40 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-[#00FF66]" />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
              style={{
                animation: 'bounce 1.2s infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AiAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm CapTab AI 🤖 — your investment advisor. Ask me anything about a specific pitch, how the platform works, or get my honest take on whether an idea is worth backing.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pitches = useSelector((s) => s.pitches.feed);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasUnread(true);
    }
  }, [messages]);

  const buildContextMessage = () => {
    if (!pitches.length) return '';
    const topPitches = pitches.slice(0, 10).map((p, i) =>
      `${i + 1}. "${p.problem.slice(0, 60)}" [${p.category}] — $${Number(p.totalRaised).toLocaleString()} raised, ${p.investorCount} backers, $${Number(p.currentPrice).toFixed(4)}/share`
    ).join('\n');
    return `\n\nCurrent live pitches on the feed (Top ${Math.min(10, pitches.length)}):\n${topPitches}`;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Deliver system instructions as the very first user→model exchange.
      const systemContext = SYSTEM_PROMPT + buildContextMessage();

      const contents = [
        // Turn 1: User gives the AI its identity
        {
          role: 'user',
          parts: [{ text: `[INSTRUCTIONS — follow these for every reply]\n\n${systemContext}\n\nConfirm you understand and introduce yourself briefly.` }],
        },
        // Turn 1: AI acknowledges identity
        {
          role: 'model',
          parts: [{ text: "Got it! I'm CapTab AI, your investment advisor on the CapTab platform. I understand the bonding curve mechanics, daily stipends, concentration limits, and conviction bonuses. I can analyze pitches, explain platform rules, and give honest investment takes. What would you like to know?" }],
        },
        // All prior conversation turns
        ...messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        // The new user message
        { role: 'user', parts: [{ text }] },
      ];

      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      // Extract text — handle response shape from backend proxy
      const aiText =
        data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
        "I couldn't complete that response. Please try rephrasing your question.";

      setMessages((prev) => [...prev, { role: 'assistant', content: aiText }]);
    } catch (err) {
      console.error('CapTab AI error:', err.message);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `⚠️ Connection issue: ${err.message}. Please check the browser console for details, then try again.`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const QUICK_PROMPTS = [
    'What pitch should I invest in first?',
    'How does the bonding curve work?',
    'What is the conviction bonus?',
    'Explain the concentration limit',
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[300] w-14 h-14 rounded-full bg-[#00FF66] text-black shadow-[0_0_25px_rgba(0,255,102,0.5)] flex items-center justify-center hover:bg-[#00FF66]/80 hover:scale-110 transition-all duration-200"
        title="Open CapTab AI Advisor"
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6 font-bold" />
        ) : (
          <>
            <Bot className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3366] border-2 border-black" />
            )}
          </>
        )}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 md:bottom-24 md:right-6 z-[299] w-[340px] md:w-[380px] h-[520px] rounded-2xl border border-white/10 bg-[hsl(240,10%,6%)] shadow-2xl flex flex-col overflow-hidden"
          style={{ boxShadow: '0 0 30px rgba(0,255,102,0.08), 0 20px 60px rgba(0,0,0,0.6)' }}
        >
          {/* Header */}
          <div className="relative px-4 py-3 border-b border-white/10 bg-black/40 flex items-center gap-3 shrink-0">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-50" />
            <div className="w-9 h-9 rounded-lg bg-[#00FF66]/20 border border-[#00FF66]/40 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#00FF66]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">CapTab AI Advisor</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                <p className="text-[10px] text-white/40">Live</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 items-end ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#00FF66]/20 border border-[#00FF66]/40 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#00FF66]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap ${msg.role === 'user'
                      ? 'bg-[#00FF66]/20 border border-[#00FF66]/30 text-white rounded-2xl rounded-br-sm'
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-2xl rounded-bl-sm'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (only shown before first user message) */}
          {messages.filter((m) => m.role === 'user').length === 0 && !isLoading && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="text-[10px] text-white/50 border border-white/10 rounded-full px-2.5 py-1 hover:bg-white/5 hover:text-white/80 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 shrink-0">
            <div className="flex gap-2 items-center border border-white/10 rounded-xl bg-white/5 px-3 py-2 focus-within:border-[#00FF66]/40 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a pitch or how CapTab works..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none resize-none leading-relaxed"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-lg bg-[#00FF66] text-black flex items-center justify-center hover:bg-[#00FF66]/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-center text-[9px] text-white/15 mt-1.5">Responses are AI-generated. Not real financial advice.</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
