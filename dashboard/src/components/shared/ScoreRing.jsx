import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function ScoreRing({ targetScore }) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = targetScore / (duration / 16); 

    const animateFill = () => {
      start += increment;
      if (start < targetScore) {
        setScore(Math.ceil(start));
        requestAnimationFrame(animateFill);
      } else {
        setScore(Math.round(targetScore));
      }
    };
    requestAnimationFrame(animateFill);
  }, [targetScore]);

  // Determine color and glow
  let color = '#EF4444'; // Red (below 60)
  let shadow = 'drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]';

  if (score >= 80) {
    color = '#10B981'; // Green
    shadow = 'drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]';
  } else if (score >= 60) {
    color = '#F59E0B'; // Yellow
    shadow = 'drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]';
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className={`w-48 h-48 relative ${shadow} transition-all duration-500`}>
        <CircularProgressbar
          value={score}
          text={`${score}%`}
          strokeWidth={8}
          styles={buildStyles({
            pathColor: color,
            textColor: '#fff',
            trailColor: 'rgba(255,255,255,0.05)',
            textSize: '24px',
            pathTransitionDuration: 0.1 // Let the state drive it smoothly
          })}
        />
        {/* Inner neural glow */}
        <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-gradient-radial from-white/5 to-transparent pointer-events-none" />
      </div>
      <p className="mt-6 text-gray-400 font-mono tracking-widest uppercase text-sm">Today's Score</p>
    </div>
  );
}
