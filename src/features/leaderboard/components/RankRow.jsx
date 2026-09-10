import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { setHighlightPitchId } from '../../pitches/pitchesSlice';

export default function RankRow({ rank, entry, type }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isPitch = type !== 'backers';
  const isTopThree = rank <= 3;
  const rankColors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

  const handleRowClick = () => {
    if (isPitch && entry?.id) {
      dispatch(setHighlightPitchId(entry.id));
      navigate(`/?pitch=${entry.id}`);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
        isPitch
          ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-[#00FF66]/30 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(0,255,102,0.06)]'
          : 'bg-white/[0.03] border-white/5'
      }`}
      title={isPitch ? `View "${entry.problem}" in feed` : undefined}
    >
      {/* Rank */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono shrink-0 transition-transform group-hover:scale-105"
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
        <p className={`text-sm font-semibold truncate transition-colors ${
          isPitch ? 'text-white group-hover:text-[#00FF66]' : 'text-white'
        }`}>
          {type === 'backers' ? entry.username : entry.problem}
        </p>
        <div className="flex items-center gap-2 text-xs text-white/40 truncate mt-0.5">
          <span>{type === 'backers' ? `${entry.investmentCount} investments` : entry.category}</span>
          {isPitch && (
            <span className="text-[10px] text-[#00FF66]/60 font-mono hidden sm:inline">
              ${Number(entry.currentPrice || 0.01).toFixed(4)}/sh
            </span>
          )}
        </div>
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
            <p className="text-sm font-mono font-bold text-white group-hover:text-[#00FF66] transition-colors">
              {formatCurrency(entry.totalRaised)}
            </p>
            <div className="flex items-center justify-end gap-1 text-white/30">
              <Users className="w-3 h-3" />
              <span className="text-[10px]">{entry.investorCount}</span>
            </div>
          </>
        )}
      </div>

      {/* View indicator for pitches */}
      {isPitch && (
        <div className="text-white/20 group-hover:text-[#00FF66] group-hover:translate-x-0.5 transition-all shrink-0">
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
