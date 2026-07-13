import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BoardTable from '../features/leaderboard/components/BoardTable';
import GlobalCapitalChart from '../features/leaderboard/components/GlobalCapitalChart';
import MomentumArrow from '../features/leaderboard/components/MomentumArrow';
import VolatilityBarChart from '../features/leaderboard/components/VolatilityBarChart';
import { fetchPitches } from '../features/pitches/pitchesApi';
import { setPitches } from '../features/pitches/pitchesSlice';
import { fetchAllInvestments } from '../features/auth/authApi';

export default function LeaderboardPage() {
  const dispatch = useDispatch();
  const pitches = useSelector((s) => s.pitches.feed) || [];
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    
    async function loadData() {
      try {
        const [pitchesData, investmentsData] = await Promise.all([
          fetchPitches(),
          fetchAllInvestments()
        ]);
        
        if (active) {
          dispatch(setPitches(pitchesData));
          setInvestments(investmentsData);
        }
      } catch (err) {
        console.error('Error loading leaderboard page data:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [dispatch]);

  return (
    <div className="max-w-[1000px] mx-auto w-full px-4 py-8">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-black tracking-tight text-white/90">Market Leaderboard</h1>
        <p className="text-sm text-white/40 mt-1">Live capital flows, sector momentum, and top virtual pitches.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#00FF66] border-t-transparent animate-spin mb-4" />
          <p className="text-xs text-white/40">Loading live market metrics...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlobalCapitalChart pitches={pitches} />
            <MomentumArrow investments={investments} />
            <VolatilityBarChart investments={investments} />
          </div>

          <BoardTable />
        </>
      )}
    </div>
  );
}
