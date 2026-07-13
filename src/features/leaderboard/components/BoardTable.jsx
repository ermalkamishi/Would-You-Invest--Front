import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Flame, Trophy, TrendingUp, Zap, LayoutGrid } from 'lucide-react';
import RankRow from './RankRow';
import { API_BASE } from '../../../config';

const TABS = [
  { key: 'hot', label: 'Hot Today', icon: Flame, desc: '24h capital inflow' },
  { key: 'funded', label: 'Most Funded', icon: Trophy, desc: 'All-time virtual $ raised' },
  { key: 'roi', label: 'Best ROI Backers', icon: TrendingUp, desc: 'Top portfolio performers' },
  { key: 'rising', label: 'Rising Fast', icon: Zap, desc: 'Velocity / growth rate' },
  { key: 'category', label: 'Category Kings', icon: LayoutGrid, desc: 'AI, Climate, B2B, Consumer' },
];

// BoardTable.jsx

export default function BoardTable() {
  const [activeTab, setActiveTab] = useState('hot');
  const [selectedCategory, setSelectedCategory] = useState('AI');
  const [backersLeaderboard, setBackersLeaderboard] = useState([]);
  const realPitches = useSelector((s) => s.pitches.feed) || [];

  // Fetch real ROI leaderboard from backend when ROI tab is selected
  useEffect(() => {
    if (activeTab === 'roi') {
      fetch(`${API_BASE}/users/leaderboard/roi`)
        .then((res) => {
          if (!res.ok) throw new Error('API failed');
          return res.json();
        })
        .then((data) => {
          // Format ROI values as strings
          const formatted = data.map((b) => ({
            ...b,
            roi: `${b.roi >= 0 ? '+' : ''}${b.roi.toFixed(1)}%`,
          }));
          setBackersLeaderboard(formatted);
        })
        .catch((err) => {
          console.error('Error loading ROI leaderboard:', err);
          setBackersLeaderboard([]);
        });
    }
  }, [activeTab]);

  const isBackerBoard = activeTab === 'roi';
  
  const entries = useMemo(() => {
    if (isBackerBoard) {
      return backersLeaderboard;
    }
    
    const combined = realPitches.map(p => ({
      ...p,
      totalRaised: Number(p.totalRaised) || 0,
      investorCount: Number(p.investorCount) || 0,
      currentPrice: Number(p.currentPrice) || 0.10,
    }));
    
    if (activeTab === 'funded') {
      return combined.sort((a, b) => b.totalRaised - a.totalRaised);
    }
    
    if (activeTab === 'hot') {
      // Sort by absolute virtual raised volume
      return combined.sort((a, b) => b.totalRaised - a.totalRaised);
    }

    if (activeTab === 'rising') {
      // Sort by backer count velocity
      return combined.sort((a, b) => b.investorCount - a.investorCount);
    }

    if (activeTab === 'category') {
      // Filter by selected category, sort by funding
      const normalizedCat = selectedCategory === 'B2B SaaS' ? 'B2B' : selectedCategory;
      return combined
        .filter((p) => p.category?.toLowerCase() === normalizedCat.toLowerCase())
        .sort((a, b) => b.totalRaised - a.totalRaised);
    }
    
    return combined;
  }, [isBackerBoard, activeTab, selectedCategory, realPitches, backersLeaderboard]);

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto pb-3 mb-5 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#00FF66]/15 border-[#00FF66]/30 text-[#00FF66]'
                  : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active tab description */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-white/30">
          {TABS.find((t) => t.key === activeTab)?.desc}
        </p>
        
        {/* Category Kings subselector */}
        {activeTab === 'category' && (
          <div className="flex gap-1.5 overflow-x-auto max-w-[60%] scrollbar-hide">
            {['AI', 'Climate', 'Consumer', 'B2B SaaS', 'Fintech', 'Health'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#00FF66]/20 border-[#00FF66]/40 text-[#00FF66]'
                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard entries */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-white/5 bg-white/[0.015] text-white/30 text-xs">
            No rankings available yet.
          </div>
        ) : (
          entries.map((entry, i) => (
            <RankRow
              key={entry.id}
              rank={i + 1}
              entry={entry}
              type={isBackerBoard ? 'backers' : 'pitches'}
            />
          ))
        )}
      </div>
    </div>
  );
}
