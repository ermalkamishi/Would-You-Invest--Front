import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function MomentumArrow({ investments = [] }) {
  const { velocity, isUp, trendText, color, glowColor, arrowRotation } = useMemo(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let recentSum = 0;
    let totalSum = 0;

    investments.forEach((inv) => {
      const amount = Number(inv.amountInvested || 0);
      totalSum += amount;
      
      const timestamp = new Date(inv.timestamp);
      if (timestamp >= oneDayAgo) {
        recentSum += amount;
      }
    });

    // Velocity is the % of all-time investments made in the last 24 hours
    const computedVelocity = totalSum > 0 ? (recentSum / totalSum) * 100 : 0;
    
    if (computedVelocity > 0) {
      return {
        velocity: `+${computedVelocity.toFixed(1)}%`,
        isUp: true,
        trendText: 'Active Bull Trend',
        color: '#00FF66',
        glowColor: 'rgba(0,255,102,0.4)',
        arrowRotation: 0
      };
    }

    return {
      velocity: '0.0%',
      isUp: false,
      trendText: 'Flat / Neutral Trend',
      color: '#a1a1aa',
      glowColor: 'rgba(161,161,170,0.1)',
      arrowRotation: 90
    };
  }, [investments]);

  return (
    <div className="rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] p-6 relative overflow-hidden group flex flex-col justify-between min-h-[300px]">
      {/* Grid line background */}
      <div 
        className="absolute inset-0 opacity-10 transition-colors duration-500"
        style={{
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: 'center center',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)'
        }}
      />
      
      <div className="relative z-10 mb-4">
        <h3 className="text-sm font-bold tracking-tight text-white/90">Market Momentum</h3>
        <p className="text-[10px] transition-colors duration-500 font-medium" style={{ color }}>
          {trendText}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <motion.div
          style={{ rotate: arrowRotation }}
          animate={isUp ? {
            y: [-5, 5, -5],
            filter: [
              `drop-shadow(0 0 10px ${glowColor})`,
              `drop-shadow(0 0 25px ${glowColor})`,
              `drop-shadow(0 0 10px ${glowColor})`
            ]
          } : {
            y: 0,
            filter: `drop-shadow(0 0 5px ${glowColor})`
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="transition-transform duration-700"
        >
          <svg width="80" height="100" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="trendGradient" x1="50" y1="150" x2="50" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor={isUp ? '#004411' : '#27272a'} />
                <stop offset="0.5" stopColor={color} />
                <stop offset="1" stopColor={isUp ? '#AAFFCC' : '#e4e4e7'} />
              </linearGradient>
            </defs>
            <path d="M50 0L100 50H70V150H30V50H0L50 0Z" fill="url(#trendGradient)" />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10 flex justify-between items-end mt-4">
        <div>
          <span className="text-2xl font-mono font-black tracking-tighter transition-colors duration-500" style={{ color }}>
            {velocity}
          </span>
          <p className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">Velocity (1h)</p>
        </div>
        <div 
          className="w-2 h-2 rounded-full animate-pulse transition-all duration-500" 
          style={{ 
            backgroundColor: color, 
            boxShadow: `0 0 10px ${color}` 
          }} 
        />
      </div>
    </div>
  );
}
