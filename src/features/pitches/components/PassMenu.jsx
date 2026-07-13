import { useState } from 'react';
import { X } from 'lucide-react';

const PASS_REASONS = [
  'Too crowded market',
  'Unclear monetization',
  'Weak differentiation',
  'Not the right timing',
  'Team concerns',
  'Already exists',
  'Not my domain',
  'Too early / vague',
];

export default function PassMenu({ isOpen, onClose, onPass }) {
  const [selected, setSelected] = useState(null);

  if (!isOpen) return null;

  const handlePass = () => {
    onPass(selected);
    setSelected(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] p-6 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF3366] to-transparent opacity-60 rounded-t-xl" />

        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold mb-1">Why did you pass?</h3>
        <p className="text-sm text-white/40 mb-5">Optional — helps founders improve.</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {PASS_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelected(reason === selected ? null : reason)}
              className={`p-2.5 rounded-lg text-xs font-medium text-left transition-all border ${
                selected === reason
                  ? 'bg-[#FF3366]/20 border-[#FF3366]/50 text-[#FF3366]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { onPass(null); onClose(); }}
            className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 transition-all"
          >
            Skip
          </button>
          <button
            onClick={handlePass}
            className="flex-1 py-2.5 rounded-lg bg-[#FF3366] text-white text-sm font-bold hover:bg-[#FF3366]/80 transition-all shadow-[0_0_15px_rgba(255,51,102,0.3)]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
