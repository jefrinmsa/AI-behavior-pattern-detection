import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

function AnimatedCounter({ from, to, duration = 1.5 }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * (to - from) + from));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [from, to, duration]);

  return <>{count}</>;
}

export default function ScoreCard({ report }) {
  const prodScore = report?.productivity_score || 0;
  
  let ringColor = "#FF0055"; // dangerRed
  let trailColor = "rgba(255, 0, 85, 0.1)";
  let glowClass = "text-glow-red";
  if (prodScore > 80) {
    ringColor = "#00FF66"; // successGreen
    trailColor = "rgba(0, 255, 102, 0.1)";
    glowClass = "text-glow-green";
  } else if (prodScore >= 60) {
    ringColor = "#FFB300"; // warningOrange
    trailColor = "rgba(255, 179, 0, 0.1)";
    glowClass = "text-glow-orange";
  }

  return (
    <div className="glass-card flex flex-col items-center justify-center p-8 h-full relative overflow-visible border-white/5">
      
      {/* Background Core Glow */}
      <div 
        className="absolute w-[250px] h-[250px] rounded-full blur-[100px] opacity-30 pointer-events-none" 
        style={{ backgroundColor: ringColor }}
      />
      
      <div className="flex w-full justify-between items-center mb-8 relative z-10">
        <h2 className="text-xl font-heading font-medium tracking-[0.2em] text-white">NEURAL SCORE</h2>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-20"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
        </div>
      </div>
      
      <div className="w-56 h-56 relative z-10 mb-10 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        {/* Decorative outer ring */}
        <div className="absolute inset-[-15px] rounded-full border border-white/5 border-dashed opacity-50 animate-[spin_20s_linear_infinite]" />
        <div className="absolute inset-[-25px] rounded-full border border-white/5 opacity-20 animate-[spin_30s_linear_infinite_reverse]" />

        <CircularProgressbar
          value={prodScore}
          strokeWidth={6}
          styles={buildStyles({
            pathColor: ringColor,
            trailColor: trailColor,
            strokeLinecap: 'round',
          })}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className={`text-7xl font-heading font-bold ${glowClass}`}
            style={{ color: ringColor }}
          >
            <AnimatedCounter from={0} to={prodScore} />
          </span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">
            Output %
          </span>
        </div>
      </div>

      <div className="w-full flex justify-between gap-4 mt-auto relative z-10">
        <MiniScore label="Telemetry" score={report?.score_breakdown?.activity || 0} color="#00F0FF" glow="shadow-glow-blue" />
        <MiniScore label="Sprints" score={report?.score_breakdown?.goal || 0} color="#B500FF" glow="shadow-glow-purple" />
        <MiniScore label="Rest" score={report?.score_breakdown?.break || 0} color="#00FF66" glow="shadow-glow-green" />
      </div>
    </div>
  );
}

function MiniScore({ label, score, color, glow }) {
  return (
    <div className={`flex bg-black/40 rounded-2xl p-4 flex-1 flex-col items-center justify-center border border-white/10 hover:border-white/30 transition-all ${glow} group`}>
      <span className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">{label}</span>
      <span className="text-xl font-bold font-heading drop-shadow-md group-hover:drop-shadow-[0_0_10px_currentColor] transition-all" style={{ color }}>
        <AnimatedCounter from={0} to={score} duration={1} />%
      </span>
      <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden shadow-inner flex">
        <motion.div 
          className="h-full rounded-full w-full origin-left" 
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: score / 100 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
