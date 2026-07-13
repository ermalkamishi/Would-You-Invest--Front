import { motion } from 'framer-motion';

export default function MomentumArrow() {
  return (
    <div className="rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] p-6 relative overflow-hidden group flex flex-col justify-between">
      {/* Matrix digital grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#00FF66 1px, transparent 1px), linear-gradient(90deg, #00FF66 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: 'center center',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)'
        }}
      />
      
      <div className="relative z-10 mb-4">
        <h3 className="text-sm font-bold tracking-tight text-white/90">Market Momentum</h3>
        <p className="text-[10px] text-[#00FF66]">Active Bull Trend</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <motion.div
          animate={{
            y: [-5, 5, -5],
            filter: [
              'drop-shadow(0 0 10px rgba(0,255,102,0.3))',
              'drop-shadow(0 0 25px rgba(0,255,102,0.6))',
              'drop-shadow(0 0 10px rgba(0,255,102,0.3))'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg width="80" height="120" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="neonGradient" x1="50" y1="150" x2="50" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#004411" />
                <stop offset="0.5" stopColor="#00FF66" />
                <stop offset="1" stopColor="#AAFFCC" />
              </linearGradient>
            </defs>
            <path d="M50 0L100 50H70V150H30V50H0L50 0Z" fill="url(#neonGradient)" />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10 flex justify-between items-end mt-4">
        <div>
          <span className="text-2xl font-mono font-black text-[#00FF66] tracking-tighter">+14.2%</span>
          <p className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">Velocity (1h)</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse shadow-[0_0_10px_rgba(0,255,102,1)]" />
      </div>
    </div>
  );
}
