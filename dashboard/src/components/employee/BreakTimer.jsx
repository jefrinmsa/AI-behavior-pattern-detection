import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Play, Square } from 'lucide-react';
import { startBreak, endBreak } from '../../api';

export default function BreakTimer({ breakData, empId, refresh }) {
  const summary = breakData?.summary || { total_breaks: 0, total_break_min: 0, break_limit_min: 90, remaining_min: 90, exceeded: false, on_break_now: false };
  const breaks = breakData?.breaks || [];
  
  const [loading, setLoading] = useState(false);
  const [activeElapsed, setActiveElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (summary.on_break_now && breaks.length > 0) {
      const active = breaks[breaks.length - 1];
      if (!active.end_time && active.start_time) {
        const now = new Date();
        const startParts = active.start_time.split(':');
        const startObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(startParts[0]), parseInt(startParts[1]), 0);
        
        const tick = () => {
          const diffSecs = Math.floor((now - startObj) / 1000); // Fixed static `new Date()` bug by recalculating internally
          const realDiff = Math.floor((new Date() - startObj) / 1000);
          setActiveElapsed(realDiff > 0 ? realDiff : 0);
        };
        tick();
        interval = setInterval(tick, 1000);
      }
    } else {
      setActiveElapsed(0);
    }
    return () => clearInterval(interval);
  }, [summary.on_break_now, breaks]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (summary.on_break_now) {
        await endBreak(empId);
      } else {
        await startBreak(empId);
      }
      refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatSecs = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const usedRatio = Math.min((summary.total_break_min / summary.break_limit_min) * 100, 100);
  let barColor = "bg-successGreen shadow-[0_0_15px_#00FF66]";
  if (usedRatio > 75) barColor = "bg-warningOrange shadow-[0_0_15px_#FFB300]";
  if (usedRatio >= 95) barColor = "bg-dangerRed shadow-[0_0_15px_#FF0055]";

  return (
    <div className="glass-card flex flex-col h-full bg-black/40 min-h-[350px] border-white/5 relative overflow-hidden group">
      
      {/* Dynamic Background */}
      <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${summary.on_break_now ? 'bg-dangerRed' : 'group-hover:bg-electricBlue/10'}`} />

      <div className="flex justify-between items-center mb-8 relative z-10 border-b border-white/10 pb-4">
        <h2 className="text-xl font-heading font-medium tracking-[0.2em] flex items-center gap-3">
          <div className="p-2 bg-electricBlue/10 rounded-lg border border-electricBlue/30 text-electricBlue shadow-[0_0_10px_rgba(0,240,255,0.3)]">
             <Coffee className="w-5 h-5" />
          </div>
          RECHARGE STATION
        </h2>
        {summary.on_break_now && (
          <div className="flex items-center gap-2 bg-dangerRed/20 px-3 py-1 rounded-full border border-dangerRed/50 shadow-glow-red">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dangerRed opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-dangerRed shadow-[0_0_5px_#FF0055]"></span>
            </span>
            <span className="text-[10px] uppercase font-bold text-dangerRed tracking-widest">Active</span>
          </div>
        )}
      </div>

      <div className="w-full flex-grow relative z-10 flex flex-col items-center justify-center">
        
        {/* Enormous Button */}
        <button 
          onClick={handleToggle}
          disabled={loading}
          className={`
            relative group/btn flex flex-col items-center justify-center w-full max-w-[220px] aspect-square rounded-[3rem] transition-all duration-500 overflow-hidden
            ${summary.on_break_now 
              ? 'bg-dangerRed/10 border border-dangerRed border-b-4 border-r-4 shadow-glow-red hover:bg-dangerRed/20 hover:-translate-y-1' 
              : 'bg-successGreen/10 border border-successGreen border-b-4 border-r-4 shadow-glow-green hover:bg-successGreen/20 hover:-translate-y-1'
            }
            ${loading ? 'opacity-50 cursor-not-allowed scale-95' : 'cursor-pointer'}
          `}
        >
          {loading ? (
             <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : summary.on_break_now ? (
            <>
              <Square className="w-14 h-14 text-white mb-2 drop-shadow-[0_0_10px_rgba(255,0,85,1)]" fill="#FF0055" />
              <span className="text-white font-heading font-bold text-2xl tracking-wide drop-shadow-md">END BREAK</span>
              <span className="text-dangerRed font-mono font-bold text-xl mt-2 tracking-widest bg-black/50 px-3 py-1 rounded-lg border border-dangerRed/30">{formatSecs(activeElapsed)}</span>
            </>
          ) : (
            <>
              <Play className="w-16 h-16 text-white mb-1 drop-shadow-[0_0_10px_rgba(0,255,102,1)] ml-2" fill="#00FF66" />
              <span className="text-white font-heading font-bold text-2xl tracking-wide drop-shadow-md">INITIALIZE</span>
              <span className="text-successGreen text-xs mt-2 uppercase font-bold tracking-[0.2em] opacity-80">Ready Status</span>
            </>
          )}
        </button>

        {/* Cyberpunk Progress Bar Component */}
        <div className="w-full mt-10 p-4 bg-black/40 rounded-2xl border border-white/5">
          <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-widest">
            <span className="text-white">Capacity: {Math.floor(summary.total_break_min)}m used</span>
            <span>{Math.floor(summary.remaining_min)}m remains</span>
          </div>
          <div className="w-full h-2.5 bg-[#05050A] rounded-full overflow-hidden shadow-inner border border-white/5">
            <motion.div 
              className={`h-full rounded-full ${barColor} origin-left`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: usedRatio / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
