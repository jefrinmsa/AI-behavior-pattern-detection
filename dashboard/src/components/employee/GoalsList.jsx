import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { completeGoal } from '../../api';

export default function GoalsList({ goalData, empId, refresh }) {
  const goals = goalData?.goals || [];
  const summary = goalData?.summary || { total: 0, completed: 0, pending: 0, completion_rate: 0, sprint_complete: false };
  
  const [finishing, setFinishing] = useState(null);

  const handleComplete = async (goalId) => {
    setFinishing(goalId);
    try {
      const res = await completeGoal(empId, goalId);
      
      setTimeout(() => {
        if (res.sprint_complete) {
          fireConfetti();
        }
        refresh();
        setFinishing(null);
      }, 600);
      
    } catch (err) {
      console.error(err);
      setFinishing(null);
    }
  };

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, colors: ['#00F0FF', '#B500FF', '#00FF66'] };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  if (summary.total === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center p-8 h-full text-center border-white/5 bg-black/40">
        <div className="w-20 h-20 rounded-full bg-electricBlue/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)] border border-electricBlue/30">
          <Zap className="w-10 h-10 text-electricBlue drop-shadow-[0_0_10px_rgba(0,240,255,1)] animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold font-heading tracking-wide mb-3 text-white">NO DIRECTIVES</h3>
        <p className="text-sm text-gray-400 max-w-sm">Agile Command hasn't deployed any active sprint tickets to your neural queue today.</p>
      </div>
    );
  }

  if (summary.sprint_complete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card flex flex-col items-center justify-center p-8 h-full text-center border-successGreen/50 bg-[#00FF66]/10 shadow-glow-green"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,102,0.1),transparent)] pointer-events-none" />
        <div className="text-7xl mb-8 flex space-x-4 relative z-10 drop-shadow-[0_0_15px_rgba(0,255,102,0.5)]">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 2 }}>🎉</motion.div>
          <motion.div animate={{ y: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}>🚀</motion.div>
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}>✨</motion.div>
        </div>
        <h2 className="text-4xl font-heading font-bold text-successGreen mb-4 text-glow-green tracking-widest relative z-10">SPRINT COMPLETE!</h2>
        <p className="text-gray-200 font-medium text-lg relative z-10 mb-2">Primary objectives obliterated.</p>
        <p className="text-sm text-gray-400 mt-2 relative z-10">Standby for tomorrow's deployment.</p>
      </motion.div>
    );
  }

  return (
    <div className="glass-card flex flex-col h-full bg-black/40 border-white/5 relative overflow-hidden">
      
      <div className="flex justify-between items-center mb-6 relative z-10 border-b border-white/10 pb-4">
        <h2 className="text-xl font-heading font-medium tracking-[0.2em] flex items-center gap-3">
          <div className="p-2 bg-purpleAccent/10 rounded-lg border border-purpleAccent/30 text-purpleAccent shadow-[0_0_10px_rgba(181,0,255,0.3)]">
             <Zap className="w-5 h-5" />
          </div>
          ACTIVE DIRECTIVES
        </h2>
        <div className="bg-electricBlue/20 text-electricBlue border border-electricBlue/40 px-3 py-1.5 rounded-xl flex items-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <span className="text-xs font-bold uppercase tracking-widest">{summary.completed} / {summary.total} CLEAR</span>
        </div>
      </div>

      <div className="w-full h-3 bg-[#05050A] shadow-inner rounded-full mb-8 overflow-hidden border border-white/10 relative z-10 p-0.5">
        <motion.div 
          className="h-full bg-gradient-to-r from-electricBlue to-purpleAccent rounded-full shadow-[0_0_10px_rgba(0,240,255,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${summary.completion_rate}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 flex-grow relative z-10 pb-4">
        <AnimatePresence>
          {goals.map(goal => {
            const isCompleted = goal.status === 'completed';
            const isFinishing = finishing === goal.id;
            
            let badgeColors = "bg-gray-500/20 text-gray-400 border border-gray-500/30";
            let hoverGlow = "hover:border-electricBlue/50 hover:shadow-glow-blue";
            if (!isCompleted) {
              if (goal.priority === 'high') { badgeColors = "bg-dangerRed/20 text-dangerRed border border-dangerRed/30"; hoverGlow = "hover:border-dangerRed/50 hover:shadow-[0_0_15px_rgba(255,0,85,0.4)]"; }
              if (goal.priority === 'medium') { badgeColors = "bg-warningOrange/20 text-warningOrange border border-warningOrange/30"; hoverGlow = "hover:border-warningOrange/50 hover:shadow-[0_0_15px_rgba(255,179,0,0.4)]"; }
              if (goal.priority === 'low') { badgeColors = "bg-successGreen/20 text-successGreen border border-successGreen/30"; hoverGlow = "hover:border-successGreen/50 hover:shadow-[0_0_15px_rgba(0,255,102,0.4)]"; }
            }

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                className={`flex justify-between items-center p-5 rounded-2xl border transition-all duration-300 relative group
                  ${isCompleted 
                    ? 'bg-black/60 border-white/5 opacity-40 grayscale' 
                    : `bg-white/5 border-white/10 ${hoverGlow} bg-gradient-to-r from-white/5 to-transparent`
                }`}
              >
                {!isCompleted && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 rounded-l-2xl group-hover:bg-electricBlue transition-colors duration-300" />}

                <div className="flex flex-col align-start ml-2">
                  <div className="flex gap-3 items-center mb-2">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm tracking-[0.2em] shadow-sm ${badgeColors}`}>
                      [ {goal.priority} ]
                    </span>
                    {isCompleted ? (
                      <span className="text-xs text-successGreen flex items-center gap-1 font-mono tracking-widest font-bold">
                        <CheckCircle2 className="w-3 h-3" /> T-MINUS {goal.time_taken_min}m
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1 font-mono tracking-widest font-bold">
                        <Clock className="w-3 h-3 text-electricBlue" /> EST: {goal.estimated_hours}h
                      </span>
                    )}
                  </div>
                  <motion.h4 layout className={`font-medium tracking-wide text-lg ${isCompleted ? 'text-gray-500 line-through' : 'text-white drop-shadow-md'}`}>
                    {goal.title}
                  </motion.h4>
                </div>

                {!isCompleted && (
                  <button 
                    onClick={() => handleComplete(goal.id)}
                    disabled={isFinishing}
                    className={`
                      p-4 rounded-xl transition-all duration-300 transform active:scale-90
                      ${isFinishing ? 'bg-black/40 text-gray-500 cursor-not-allowed border border-white/10' : 'bg-successGreen/10 hover:bg-successGreen/20 border border-successGreen/50 text-successGreen shadow-[0_0_10px_rgba(0,255,102,0.2)] hover:shadow-[0_0_20px_rgba(0,255,102,0.6)]'}
                    `}
                  >
                    {isFinishing ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <CheckCircle2 className="w-6 h-6" />
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
