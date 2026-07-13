import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'AI', value: 400, color: '#00FF66' },
  { name: 'Climate Tech', value: 300, color: '#00CC55' },
  { name: 'FinTech', value: 200, color: '#009944' },
  { name: 'Consumer', value: 100, color: '#006622' },
];

export default function GlobalCapitalChart() {
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
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00FF66" floodOpacity="0.5" />
              </filter>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#00FF66', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ display: 'none' }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              style={{ filter: 'url(#neon-glow)' }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="hover:opacity-80 transition-opacity duration-300 cursor-pointer outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-mono font-bold text-[#00FF66]">$1.2M</span>
          <span className="text-[8px] text-white/40 uppercase tracking-widest">Total Vol</span>
        </div>
      </div>
    </div>
  );
}
