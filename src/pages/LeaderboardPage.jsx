import BoardTable from '../features/leaderboard/components/BoardTable';
import GlobalCapitalChart from '../features/leaderboard/components/GlobalCapitalChart';
import MomentumArrow from '../features/leaderboard/components/MomentumArrow';
import VolatilityBarChart from '../features/leaderboard/components/VolatilityBarChart';

export default function LeaderboardPage() {
  return (
    <div className="max-w-[1000px] mx-auto w-full px-4 py-8">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-black tracking-tight text-white/90">Market Leaderboard</h1>
        <p className="text-sm text-white/40 mt-1">Live capital flows, sector momentum, and top virtual pitches.</p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlobalCapitalChart />
        <MomentumArrow />
        <VolatilityBarChart />
      </div>

      <BoardTable />
    </div>
  );
}
