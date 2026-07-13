import { useMemo } from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function VolatilityBarChart({ investments = [] }) {
  const chartData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const list = [];
    
    // Construct last 7 days starting from 6 days ago up to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = dayNames[d.getDay()];
      
      // Calculate start and end of that calendar day
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      
      let dailyVolume = 0;
      investments.forEach((inv) => {
        const invTime = new Date(inv.timestamp);
        if (invTime >= dayStart && invTime <= dayEnd) {
          dailyVolume += Number(inv.amountInvested || 0);
        }
      });

      list.push({
        day: dayName,
        value: dailyVolume
      });
    }

    return list;
  }, [investments]);

  // Determine if there is any volume to highlight/glow
  const hasVolume = useMemo(() => {
    return chartData.some((d) => d.value > 0);
  }, [chartData]);

  return (
    <div className="rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] p-6 relative overflow-hidden">
      {/* Glow highlight line if there is any volume */}
      <div className={`absolute top-1/2 left-0 w-full h-[1px] ${hasVolume ? 'bg-[#00FF66]/20 animate-pulse' : 'bg-white/5'} pointer-events-none`} />
      
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white/90">Capital Inflows</h3>
          <p className="text-[10px] text-white/40">7-day volume</p>
        </div>
        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
          <span className="text-[10px] font-mono text-white/60">Weekly</span>
        </div>
      </div>

      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="neonBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF66" stopOpacity={1} />
                <stop offset="100%" stopColor="#00FF66" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="emptyBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" stopOpacity={1} />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" stopOpacity={0.1} />
              </linearGradient>
              <filter id="bar-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00FF66" floodOpacity="0.4" />
              </filter>
            </defs>
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#00FF66', fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Volume']}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              animationBegin={200}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => {
                // If there's no volume on any day, render a tiny placeholder height so it looks neat but is obviously zero
                const fillUrl = hasVolume && entry.value > 0 ? 'url(#neonBar)' : 'url(#emptyBar)';
                const hasGlow = hasVolume && entry.value > 0;
                
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={fillUrl} 
                    style={hasGlow ? { filter: 'url(#bar-glow)' } : undefined}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Custom X Axis labels */}
      <div className="flex justify-between items-center mt-2 px-2">
        {chartData.map((d) => (
          <span key={d.day} className="text-[8px] text-white/40 uppercase font-mono">{d.day}</span>
        ))}
      </div>
    </div>
  );
}
