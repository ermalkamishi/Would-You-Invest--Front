import { useSelector } from 'react-redux';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function WalletStatus() {
  const balance = useSelector((s) => s.wallet.balance);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/10">
      <Wallet className="w-4 h-4 text-[#00FF66]" />
      <span className="font-mono text-sm font-medium text-white">
        {formatCurrency(balance)}
      </span>
    </div>
  );
}
