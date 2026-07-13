import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemo } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function GlobalCapitalChart({ pitches = [] }) {
  const { chartData, totalVolume } = useMemo(() => {
    const categoryTotals = {};
    let total = 0;

    pitches.forEach((pitch) => {
      const category = pitch.category || 'Other';
      const raised = Number(pitch.totalRaised || 0);
      categoryTotals[category] = (categoryTotals[category] || 0) + raised;
      total += raised;
    });

    const colors = ['#00FF66', '#00CC55', '#009944', '#006622', '#33FF88', '#66FFaa', '#99FFcc'];
    const activeCategories = Object.keys(categoryTotals)
      .map((cat, idx) => ({
        name: cat,
        value: categoryTotals[cat],
        color: colors[idx % colors.length]
      }))
      .filter((item) => item.value > 0);

    // Empty state fallback for chart rendering
    if (activeCategories.length === 0) {
      return {
        totalVolume: 0,
        chartData: [{ name: 'No Investments', value: 1, color: 'rgba(255,255,255,0.05)' }]
      };
    }

    return {
      totalVolume: total,
      chartData: activeCategories
    };
  }, [pitches]);

  return (
    <div className="rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FF66]/30 to-transparent opacity-50" />
      
      <div className="mb-4">
        <h3 className="text-sm font-bold tracking-tight text-white/90">Global Capital Breakdown</h3>
        <p className="text-[10px] text-white/40">Market share by sector</p>
      </div>

      <div className="h-[200px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00FF66" floodOpacity="0.3" />
              </filter>
            </defs>
            {totalVolume > 0 && (
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#00FF66', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ display: 'none' }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Raised']}
              />
            )}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              style={{ filter: totalVolume > 0 ? 'url(#neon-glow)' : 'none' }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="hover:opacity-85 transition-opacity duration-300 cursor-pointer outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-lg font-mono font-bold ${totalVolume > 0 ? 'text-[#00FF66]' : 'text-white/30'}`}>
            {totalVolume > 0 ? formatCurrency(totalVolume) : '$0'}
          </span>
          <span className="text-[8px] text-white/40 uppercase tracking-widest">Total Vol</span>
        </div>
      </div>
    </div>
  );
}
