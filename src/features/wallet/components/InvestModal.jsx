import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deductFromWallet } from '../walletSlice';
import { addToPortfolio } from '../../auth/authSlice';
import { X, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function InvestModal({ isOpen, onClose, startup, onInvest }) {
  const dispatch = useDispatch();
  const balance = useSelector((s) => s.wallet.balance);
  const [amount, setAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !startup) return null;

  const maxAllowed = Math.min(balance, balance * 0.2); // 20% concentration limit
  const sharePrice = Number(startup.currentPrice);
  const sharesYouGet = amount / sharePrice;
  const isOverLimit = amount > maxAllowed;
  const isInsufficientFunds = amount > balance;

  const handleInvest = async () => {
    if (isOverLimit || isInsufficientFunds || amount <= 0) return;
    setIsSubmitting(true);
    try {
      await onInvest(startup.id, amount);
      dispatch(deductFromWallet(amount));
      // Add this holding to the portfolio immediately
      dispatch(addToPortfolio({
        id: startup.id,
        problem: startup.problem,
        category: startup.category,
        entryPrice: sharePrice,
        currentPrice: sharePrice,
        sharesBought: Math.floor(sharesYouGet),
        amountInvested: amount,
      }));
      onClose();
    } catch (err) {
      console.error('Investment failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] p-6 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-60 rounded-t-xl" />

        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold mb-1">Invest in {startup.problem?.slice(0, 40)}...</h3>
        <p className="text-sm text-white/40 mb-5">
          Current price: <span className="text-[#00FF66] font-mono">${sharePrice.toFixed(4)}</span>/share
        </p>

        {/* Quick amount buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(q)}
              className={`py-2 rounded-lg text-sm font-mono font-medium transition-all border ${
                amount === q
                  ? 'bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {formatCurrency(q)}
            </button>
          ))}
        </div>

        {/* All-in button */}
        <button
          onClick={() => setAmount(Math.floor(maxAllowed))}
          className="w-full mb-4 py-2 rounded-lg text-sm font-bold transition-all border border-[#00FF66]/30 bg-[#00FF66]/10 text-[#00FF66] hover:bg-[#00FF66]/20"
        >
          ALL-IN ({formatCurrency(Math.floor(maxAllowed))})
        </button>

        {/* Custom amount */}
        <div className="mb-4">
          <label className="block text-xs text-white/40 mb-1">Custom amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
            max={maxAllowed}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-[#00FF66]/50 transition-all"
          />
        </div>

        {/* Warnings */}
        {isOverLimit && (
          <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Max 20% of wallet in one idea ({formatCurrency(Math.floor(maxAllowed))})
          </div>
        )}
        {isInsufficientFunds && (
          <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-[#FF3366]/10 border border-[#FF3366]/30 text-[#FF3366] text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Insufficient funds. Balance: {formatCurrency(balance)}
          </div>
        )}

        {/* Summary */}
        <div className="mb-5 p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-white/40">You invest</span>
            <span className="font-mono font-bold">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Shares you get</span>
            <span className="font-mono font-bold text-[#00FF66]">{sharesYouGet.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Entry price</span>
            <span className="font-mono">${sharePrice.toFixed(4)}</span>
          </div>
        </div>

        <button
          onClick={handleInvest}
          disabled={isSubmitting || isOverLimit || isInsufficientFunds || amount <= 0}
          className="w-full py-3 rounded-lg bg-[#00FF66] text-black font-bold text-lg hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <TrendingUp className="w-5 h-5 inline-block mr-2 -mt-0.5" />
          {isSubmitting ? 'Processing...' : 'Confirm Investment'}
        </button>

        <p className="mt-3 text-[10px] text-white/20 text-center">
          Not real investment. Not securities. Virtual game only.
        </p>
      </div>
    </div>
  );
}
