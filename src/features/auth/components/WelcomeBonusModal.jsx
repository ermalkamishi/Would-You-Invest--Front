import { useDispatch, useSelector } from 'react-redux';
import { closeWelcomeBonus } from '../authSlice';
import { Wallet, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import Confetti from 'react-confetti';
import { useEffect, useState } from 'react';

export default function WelcomeBonusModal() {
  const dispatch = useDispatch();
  const showWelcomeBonus = useSelector((s) => s.auth.showWelcomeBonus);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showWelcomeBonus) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeBonus]);

  if (!showWelcomeBonus) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          colors={['#00FF66', '#FFFFFF', '#004411', '#AAFFCC']}
        />
      )}

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-[#00FF66]/30 bg-gradient-to-b from-[hsl(240,10%,10%)] to-[hsl(240,10%,6%)] p-8 shadow-[0_0_50px_rgba(0,255,102,0.15)] text-center animate-in fade-in zoom-in duration-300">
        
        {/* Glowing orb behind icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#00FF66]/20 rounded-full blur-3xl" />
        
        <div className="relative mx-auto w-20 h-20 rounded-full bg-[#00FF66]/10 flex items-center justify-center border border-[#00FF66]/40 shadow-[0_0_30px_rgba(0,255,102,0.2)] mb-6">
          <Wallet className="w-10 h-10 text-[#00FF66]" />
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-white animate-pulse" />
        </div>

        <h2 className="text-3xl font-black mb-2 text-white">Welcome, Angel Investor!</h2>
        
        <p className="text-white/60 mb-6 text-sm leading-relaxed">
          You've just been granted <strong className="text-white">virtual capital</strong> to start backing the next big ideas. Your wallet has been credited:
        </p>

        <div className="bg-black/50 border border-white/10 rounded-xl p-6 mb-8 flex items-center justify-center gap-3">
          <TrendingUp className="w-8 h-8 text-[#00FF66]" />
          <span className="font-mono text-5xl font-black tracking-tight text-[#00FF66]">
            {formatCurrency(10000)}
          </span>
        </div>

        <button
          onClick={() => dispatch(closeWelcomeBonus())}
          className="w-full py-4 rounded-xl bg-[#00FF66] text-black font-black text-lg hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] transform hover:scale-[1.02]"
        >
          Let's Invest
        </button>

        <p className="mt-4 text-[10px] text-white/20">
          This is a game. Not real money. Not financial advice.
        </p>
      </div>
    </div>
  );
}
