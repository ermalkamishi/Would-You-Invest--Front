import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { day: 'Mon', value: 120000 },
  { day: 'Tue', value: 180000 },
  { day: 'Wed', value: 150000 },
  { day: 'Thu', value: 250000 },
  { day: 'Fri', value: 210000 },
  { day: 'Sat', value: 90000 },
  { day: 'Sun', value: 110000 },
];

const formatYAxis = (tickItem) => {
  if (tickItem >= 1000) {
    return `$${tickItem / 1000}k`;
  }
  return `$${tickItem}`;
};

export default function VolatilityBarChart() {
  return (
    <div className="rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] p-6 relative overflow-hidden">
      {/* Flickering Grid Line */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#00FF66]/20 opacity-50 animate-pulse pointer-events-none" />
      
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
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="neonBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF66" stopOpacity={1} />
                <stop offset="100%" stopColor="#00FF66" stopOpacity={0.1} />
              </linearGradient>
              <filter id="bar-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00FF66" floodOpacity="0.5" />
              </filter>
            </defs>
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#00FF66', fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Volume']}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              animationBegin={200}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="url(#neonBar)" 
                  style={{ filter: 'url(#bar-glow)' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Custom X Axis labels for precise layout */}
      <div className="flex justify-between items-center mt-2 px-2">
        {data.map((d) => (
          <span key={d.day} className="text-[8px] text-white/40 uppercase font-mono">{d.day}</span>
        ))}
      </div>
    </div>
  );
}
