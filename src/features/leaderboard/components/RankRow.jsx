import { TrendingUp, Users, Zap } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function RankRow({ rank, entry, type }) {
  const isTopThree = rank <= 3;
  const rankColors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group">
      {/* Rank */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono shrink-0"
        style={isTopThree ? { backgroundColor: `${rankColors[rank]}20`, color: rankColors[rank], border: `1px solid ${rankColors[rank]}40` } : {}}
      >
        {isTopThree ? (
          <span>{rank}</span>
        ) : (
          <span className="text-white/30">{rank}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">
          {type === 'backers' ? entry.username : entry.problem}
        </p>
        <p className="text-xs text-white/40 truncate">
          {type === 'backers' ? `${entry.investmentCount} investments` : entry.category}
        </p>
      </div>

      {/* Stats */}
      <div className="text-right shrink-0">
        {type === 'backers' ? (
          <>
            <p className="text-sm font-mono font-bold text-[#00FF66]">
              {entry.roi}
            </p>
            <p className="text-[10px] text-white/30">ROI</p>
          </>
        ) : (
          <>
            <p className="text-sm font-mono font-bold">
              {formatCurrency(entry.totalRaised)}
            </p>
            <div className="flex items-center justify-end gap-1 text-white/30">
              <Users className="w-3 h-3" />
              <span className="text-[10px]">{entry.investorCount}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
