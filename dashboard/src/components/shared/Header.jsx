import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function Header({ title, subtitle, showTracker = false, breakActive = false }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <header className="w-full flex justify-between items-center py-6 px-8 bg-black/40 border-b border-white/5 backdrop-blur-md relative z-20">
      
      {/* Left side: Logo */}
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-electricBlue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
        <h1 className="text-2xl font-heading font-bold tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
          WorkSense
        </h1>
      </div>

      {/* Right side: Identity & Tracker */}
      <div className="flex items-center gap-8">
        
        {showTracker && (
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${breakActive ? 'bg-dangerRed/10 border-dangerRed/30 shadow-glow-red' : 'bg-successGreen/10 border-successGreen/30 shadow-glow-green'}`}>
             <div className={`w-2 h-2 rounded-full animate-ping ${breakActive ? 'bg-dangerRed' : 'bg-successGreen'}`} />
             <span className={`text-[10px] uppercase font-bold tracking-widest ${breakActive ? 'text-dangerRed' : 'text-successGreen'}`}>
               {breakActive ? 'Tracker Paused - Break Active' : 'Tracker Active'}
             </span>
          </div>
        )}

        <div className="text-right">
          <p className="text-white font-bold tracking-wider">{title}</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">{subtitle}</span>
            <span className="text-[10px] text-gray-600 font-mono">• {dateStr}</span>
          </div>
        </div>

      </div>
    </header>
  );
}
