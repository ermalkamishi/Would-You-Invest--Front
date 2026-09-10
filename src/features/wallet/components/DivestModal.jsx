import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addToWallet } from '../walletSlice';
import { divestFromPortfolio } from '../../auth/authSlice';
import { formatCurrency } from '../../../utils/formatCurrency';

const PERCENT_BUTTONS = [25, 50, 75, 100];

export default function DivestModal({ isOpen, onClose, holding, onDivest }) {
  const dispatch = useDispatch();
  const currentWalletBalance = useSelector((s) => s.wallet.balance);

  // Holding props
  // holding: { id, problem, category, entryPrice, currentPrice, sharesBought, amountInvested, ... }
  const totalSharesOwned = Number(holding?.sharesBought || holding?.shares || 0);
  const currentPrice = Number(holding?.currentPrice || 0.01);
  const entryPrice = Number(holding?.entryPrice || currentPrice);
  const totalInvested = Number(holding?.amountInvested || totalSharesOwned * entryPrice);

  const [sharesToSell, setSharesToSell] = useState(() => Math.floor(totalSharesOwned));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  // Sync initial state when modal opens
  const effectiveShares = Math.min(Math.max(0, Number(sharesToSell) || 0), totalSharesOwned);

  // Math calculations
  const proceeds = parseFloat((effectiveShares * currentPrice).toFixed(2));
  const costBasisFraction = totalSharesOwned > 0 ? (effectiveShares / totalSharesOwned) : 1;
  const costBasisSold = parseFloat((totalInvested * costBasisFraction).toFixed(2));
  const realizedPnL = parseFloat((proceeds - costBasisSold).toFixed(2));
  const isPnLPositive = realizedPnL >= 0;
  const pnlPercent = costBasisSold > 0 ? ((realizedPnL / costBasisSold) * 100).toFixed(2) : '0.00';
  const remainingShares = Math.max(0, parseFloat((totalSharesOwned - effectiveShares).toFixed(4)));
  const newWalletBalance = parseFloat((Number(currentWalletBalance || 0) + proceeds).toFixed(2));

  if (!isOpen || !holding) return null;

  const handleQuickPercent = (pct) => {
    setError(null);
    if (pct === 100) {
      setSharesToSell(totalSharesOwned);
    } else {
      const computed = Math.floor(totalSharesOwned * (pct / 100));
      setSharesToSell(Math.max(1, computed));
    }
  };

  const handleConfirmDivest = async () => {
    if (effectiveShares <= 0) {
      setError('Please select at least 1 share to cash out');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (onDivest) {
        await onDivest(holding.id, effectiveShares, proceeds);
      }

      // Optimistically update local Redux state
      dispatch(addToWallet(proceeds));
      dispatch(divestFromPortfolio({
        id: holding.id,
        sharesSold: effectiveShares,
        returnAmount: proceeds,
      }));

      setSuccessInfo({
        proceeds,
        sharesSold: effectiveShares,
        remainingShares,
      });

      setTimeout(() => {
        setSuccessInfo(null);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Divestment failed:', err);
      setError(err.message || 'Failed to cash out investment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[hsl(240,12%,7%)] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Ambient Top Glow Line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${
          isPnLPositive ? 'via-[#00FF66]' : 'via-amber-400'
        } to-transparent opacity-80`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Cash Out Investment
            </h3>
            <p className="text-[11px] text-white/40 font-mono">
              Take money back from this idea
            </p>
          </div>
        </div>

        {/* Startup Pitch Info */}
        <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
          <p className="text-xs font-bold text-white line-clamp-2">
            {holding.problem || 'Startup Idea'}
          </p>
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/50 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/70">
              {holding.category || 'Startup'}
            </span>
            <span>Current: <strong className="text-[#00FF66]">${currentPrice.toFixed(4)}</strong></span>
            <span>Avg Entry: <strong>${entryPrice.toFixed(4)}</strong></span>
            <span>Owned: <strong className="text-white">{totalSharesOwned.toLocaleString()} shs</strong></span>
          </div>
        </div>

        {/* Success Overlay Animation */}
        {successInfo ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-[#00FF66]/20 border border-[#00FF66]/40 flex items-center justify-center mx-auto text-[#00FF66]">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-lg font-black text-white">Funds Returned!</h4>
            <p className="text-xs text-white/60 font-mono">
              +{formatCurrency(successInfo.proceeds)} added directly to your buying power.
            </p>
          </div>
        ) : (
          <>
            {/* Quick Percentage Buttons */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Select Amount to Cash Out
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PERCENT_BUTTONS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      sharesToSell === (pct === 100 ? totalSharesOwned : Math.max(1, Math.floor(totalSharesOwned * (pct / 100))))
                        ? 'bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.15)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {pct === 100 ? 'ALL-OUT' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Shares Slider / Custom Input */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Custom Shares</span>
                <span className="font-mono text-white/70">
                  {effectiveShares.toLocaleString()} / {totalSharesOwned.toLocaleString()} shares
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(1, totalSharesOwned)}
                step={1}
                value={effectiveShares}
                onChange={(e) => setSharesToSell(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00FF66]"
              />
            </div>

            {/* Financial Summary Card */}
            <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Proceeds (Cash to Wallet)</span>
                <span className="font-mono text-sm font-black text-[#00FF66]">
                  +{formatCurrency(proceeds)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Realized Profit / Loss</span>
                <span className={`font-mono text-xs font-bold flex items-center gap-1 ${
                  isPnLPositive ? 'text-[#00FF66]' : 'text-[#FF3366]'
                }`}>
                  {isPnLPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPnLPositive ? '+' : ''}{formatCurrency(realizedPnL)} ({isPnLPositive ? '+' : ''}{pnlPercent}%)
                </span>
              </div>

              <div className="h-[1px] bg-white/5" />

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/40">New Wallet Buying Power</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(newWalletBalance)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/40">Remaining Shares in Idea</span>
                <span className="font-mono font-medium text-white/80">
                  {remainingShares.toLocaleString()} shares
                </span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={handleConfirmDivest}
                disabled={isSubmitting || effectiveShares <= 0}
                className="w-full py-3 rounded-xl bg-[#00FF66] hover:bg-[#00FF66]/80 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(0,255,102,0.25)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowDownRight className="w-4 h-4" />
                {isSubmitting ? 'Processing Cash Out...' : `Confirm Cash Out (+${formatCurrency(proceeds)})`}
              </button>

              <p className="text-[10px] text-white/30 text-center font-mono">
                Proceeds are immediately returned to your buying power at live market price.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
