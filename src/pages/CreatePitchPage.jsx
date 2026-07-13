import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPitch } from '../features/pitches/pitchesApi';
import { CheckCircle2, AlertTriangle, Rocket, UserCircle2, ChevronRight, ChevronLeft, Sparkles, DollarSign, Zap, Target, Tag, Link, BarChart2, Award } from 'lucide-react';
import { openLoginModal } from '../features/auth/authSlice';

const CATEGORIES = ['AI', 'Climate', 'Consumer', 'B2B', 'Fintech', 'Health', 'Education', 'Crypto', 'Other'];

const STEPS = [
  { id: 1, label: 'The Problem' },
  { id: 2, label: 'The Solution' },
  { id: 3, label: 'Business' },
  { id: 4, label: 'Extras' },
];

const inputClass = "w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF66]/60 focus:ring-1 focus:ring-[#00FF66]/20 transition-all text-sm";

export default function CreatePitchPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const token = useSelector((s) => s.auth.token);
  const isFounder = user?.role === 'founder';
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    problem: '',
    solution: '',
    whoPays: '',
    whyNow: '',
    ask: '',
    category: 'AI',
    demoClipUrl: '',
    tractionSnapshot: '',
    founderCredibility: '',
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-[800px] mx-auto w-full px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <UserCircle2 className="w-14 h-14 text-white/15 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-sm text-white/40 mb-6">Create a Founder account to submit your pitch</p>
        <button
          onClick={() => dispatch(openLoginModal())}
          className="px-6 py-2.5 rounded-lg bg-[#00FF66] text-black font-bold text-sm hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.2)]"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!isFounder) {
    return (
      <div className="max-w-[800px] mx-auto w-full px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-14 h-14 rounded-full bg-[#00FF66]/10 flex items-center justify-center mb-4 border border-[#00FF66]/20">
          <Rocket className="w-7 h-7 text-[#00FF66]/60" />
        </div>
        <h2 className="text-xl font-bold mb-2">Founders Only</h2>
        <p className="text-sm text-white/40 max-w-xs mb-2">
          This section is reserved for Founders. Angel Investors browse and back ideas — they don't submit them.
        </p>
        <p className="text-xs text-white/20 mt-2">
          Want to pitch? Create a new account with the <span className="text-[#00FF66]">Founder</span> role.
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return false;
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|loom\.com)\/.+/i;
    return regex.test(url);
  };

  const hasDuplicates = () => {
    const fields = [
      form.problem.trim().toLowerCase(),
      form.solution.trim().toLowerCase(),
      form.whyNow.trim().toLowerCase(),
      form.whoPays.trim().toLowerCase(),
      form.ask.trim().toLowerCase()
    ].filter(text => text.length > 0);
    const unique = new Set(fields);
    return unique.size !== fields.length;
  };

  const isStepValid = () => {
    if (hasDuplicates()) return false;
    switch (step) {
      case 1: 
        return form.problem.trim().length >= 40;
      case 2: 
        return form.solution.trim().length >= 40 && form.whyNow.trim().length >= 10;
      case 3: 
        return form.whoPays.trim().length >= 3 && form.ask.trim().length >= 3;
      case 4: 
        return (form.demoClipUrl.trim() === '' || isValidUrl(form.demoClipUrl)) && 
               (form.tractionSnapshot.trim() === '' || form.tractionSnapshot.trim().length >= 3) && 
               (form.founderCredibility.trim() === '' || form.founderCredibility.trim().length >= 3);
      default: return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createPitch({ ...form, founderId: user?.id }, token);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-[800px] mx-auto w-full px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#00FF66]/20 blur-xl" />
          <div className="relative w-16 h-16 rounded-full bg-[#00FF66]/20 flex items-center justify-center border border-[#00FF66]/30">
            <CheckCircle2 className="w-8 h-8 text-[#00FF66]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Pitch Live! 🚀</h2>
        <p className="text-sm text-white/40 max-w-xs">
          Your idea is now on the feed. Virtual investors can start backing you immediately.
        </p>
        <button
          onClick={() => { setSubmitted(false); setStep(1); setForm({ problem: '', solution: '', whoPays: '', whyNow: '', ask: '', category: 'AI', demoClipUrl: '', tractionSnapshot: '', founderCredibility: '' }); }}
          className="mt-6 px-6 py-2.5 rounded-lg bg-[#00FF66] text-black font-bold hover:bg-[#00FF66]/80 transition-all"
        >
          Submit Another
        </button>
      </div>
    );
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-[800px] mx-auto w-full px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#00FF66]" />
          <span className="text-xs text-[#00FF66] font-semibold uppercase tracking-widest">Founder Studio</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Submit Your Pitch</h1>
        <p className="text-sm text-white/30 mt-1">Bet on ideas, not outcomes. 60 seconds. Fake money. Real signal.</p>
      </div>

      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step === s.id
                    ? 'bg-[#00FF66] text-black shadow-[0_0_10px_rgba(0,255,102,0.5)]'
                    : step > s.id
                    ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40'
                    : 'bg-white/5 text-white/20 border border-white/10'
                }`}
              >
                {step > s.id ? '✓' : s.id}
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 w-10 h-px bg-white/10 mx-1">
                  <div
                    className="h-full bg-[#00FF66]/50 transition-all duration-500"
                    style={{ width: step > s.id ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40">Step {step} of {STEPS.length} — <span className="text-white/60">{STEPS[step - 1].label}</span></p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-[#FF3366]/10 border border-[#FF3366]/30 text-[#FF3366] text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {hasDuplicates() && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-[#FF3366]/10 border border-[#FF3366]/30 text-[#FF3366] text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Fields must be unique across all description inputs. Please do not paste duplicate text.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: The Problem */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl border border-white/8 bg-white/[0.025] space-y-4">
              <div className="flex items-center gap-2 text-[#00FF66] mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">The Problem</span>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  What pain point are you solving? <span className="text-white/20 text-xs">(1 sentence)</span>
                </label>
                <textarea
                  name="problem"
                  value={form.problem}
                  onChange={handleChange}
                  required
                  maxLength={280}
                  rows={3}
                  className={inputClass + " resize-none"}
                  placeholder="e.g., Compliance teams spend 40 hrs/week reviewing docs manually"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-[10px] ${form.problem.length > 0 && form.problem.length < 40 ? 'text-[#FF3366]' : 'text-white/20'}`}>
                    {form.problem.length > 0 && form.problem.length < 40 ? 'Min 40 characters required' : ''}
                  </span>
                  <span className="text-[10px] text-white/20 text-right">{form.problem.length}/280</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                        form.category === cat
                          ? 'bg-[#00FF66]/15 border-[#00FF66]/40 text-[#00FF66]'
                          : 'bg-white/5 border-white/8 text-white/35 hover:bg-white/8'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: The Solution */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl border border-white/8 bg-white/[0.025] space-y-4">
              <div className="flex items-center gap-2 text-[#00FF66] mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">The Solution</span>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  How does your product solve it? <span className="text-white/20 text-xs">(1 sentence)</span>
                </label>
                <textarea
                  name="solution"
                  value={form.solution}
                  onChange={handleChange}
                  required
                  maxLength={280}
                  rows={3}
                  className={inputClass + " resize-none"}
                  placeholder="e.g., AI swarm auto-highlights regulatory gaps in seconds"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-[10px] ${form.solution.length > 0 && form.solution.length < 40 ? 'text-[#FF3366]' : 'text-white/20'}`}>
                    {form.solution.length > 0 && form.solution.length < 40 ? 'Min 40 characters required' : ''}
                  </span>
                  <span className="text-[10px] text-white/20 text-right">{form.solution.length}/280</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Why Now?</label>
                <input
                  type="text"
                  name="whyNow"
                  value={form.whyNow}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g., LLMs just became reliable enough for regulated industries"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-[10px] ${form.whyNow.length > 0 && form.whyNow.length < 10 ? 'text-[#FF3366]' : 'text-white/20'}`}>
                    {form.whyNow.length > 0 && form.whyNow.length < 10 ? 'Min 10 characters required' : 'Minimum 10 characters'}
                  </span>
                  <span className="text-[10px] text-white/20 text-right">{form.whyNow.length} chars</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Business */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl border border-white/8 bg-white/[0.025] space-y-4">
              <div className="flex items-center gap-2 text-[#00FF66] mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">The Business</span>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Who Pays? <span className="text-white/20 text-xs">(your customer)</span>
                </label>
                <input
                  type="text"
                  name="whoPays"
                  value={form.whoPays}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g., Enterprise legal teams"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-[10px] ${form.whoPays.length > 0 && form.whoPays.length < 3 ? 'text-[#FF3366]' : 'text-white/20'}`}>
                    {form.whoPays.length > 0 && form.whoPays.length < 3 ? 'Min 3 characters required' : 'Minimum 3 characters'}
                  </span>
                  <span className="text-[10px] text-white/20 text-right">{form.whoPays.length} chars</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  The Ask <span className="text-white/20 text-xs">(what you want from investors)</span>
                </label>
                <input
                  type="text"
                  name="ask"
                  value={form.ask}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g., Beta testers, cofounder, $150k pre-seed"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-[10px] ${form.ask.length > 0 && form.ask.length < 3 ? 'text-[#FF3366]' : 'text-white/20'}`}>
                    {form.ask.length > 0 && form.ask.length < 3 ? 'Min 3 characters required' : 'Minimum 3 characters'}
                  </span>
                  <span className="text-[10px] text-white/20 text-right">{form.ask.length} chars</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Extras */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl border border-white/8 bg-white/[0.025] space-y-4">
              <div className="flex items-center gap-2 text-white/40 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Extras</span>
                <span className="text-[10px] text-white/20 ml-auto">Boosts credibility</span>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5" /> Demo Clip URL <span className="text-white/20 text-xs">(Optional, 15 sec)</span>
                </label>
                <input
                  type="url"
                  name="demoClipUrl"
                  value={form.demoClipUrl}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://youtube.com/..."
                />
                {form.demoClipUrl.length > 0 && !isValidUrl(form.demoClipUrl) && (
                  <p className="text-[10px] text-[#FF3366] mt-1">Must be a valid YouTube, Vimeo, or Loom link.</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> Traction Snapshot <span className="text-white/20 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="tractionSnapshot"
                  value={form.tractionSnapshot}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder='e.g., "500 waitlist signups", "$2k MRR"'
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Founder Credibility <span className="text-white/20 text-xs">(Optional, 1 line)</span>
                </label>
                <input
                  type="text"
                  name="founderCredibility"
                  value={form.founderCredibility}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g., Ex-compliance lead at Goldman Sachs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white/8 border border-white/10 text-white font-semibold text-sm hover:bg-white/12 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/8"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isStepValid()}
              className="flex-1 py-2.5 rounded-lg bg-[#00FF66] text-black font-bold text-sm hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              🚀 Submit Pitch
            </button>
          )}
        </div>

        <p className="text-[10px] text-white/15 text-center mt-4">
          Not financial advice. Clearly labeled as pre-product / idea stage.
        </p>
      </form>
    </div>
  );
}
