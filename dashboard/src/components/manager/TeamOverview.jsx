import React from 'react';
import { Users, Target, Activity, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeamOverview({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: "Total Vanguards",
      value: summary.total_employees,
      icon: <Users className="w-6 h-6 text-electricBlue drop-shadow-[0_0_8px_rgba(0,240,255,1)]" />,
      color: "electricBlue",
      desc: "Active Operatives",
      bg: "bg-electricBlue/10"
    },
    {
      title: "Network Velocity",
      value: `${summary.average_productivity || 0}%`,
      icon: <Target className="w-6 h-6 text-successGreen drop-shadow-[0_0_8px_rgba(0,255,102,1)]" />,
      color: "successGreen",
      desc: "Avg Efficiency Rating",
      bg: "bg-successGreen/10"
    },
    {
      title: "Directives Cleared",
      value: summary.sprints_complete || 0,
      icon: <Activity className="w-6 h-6 text-purpleAccent drop-shadow-[0_0_8px_rgba(181,0,255,1)]" />,
      color: "purpleAccent",
      desc: "Team Aggregate",
      bg: "bg-purpleAccent/10"
    },
    {
      title: "Critical Threats",
      value: summary.at_risk_employees,
      icon: <Flame className="w-6 h-6 text-dangerRed drop-shadow-[0_0_8px_rgba(255,0,85,1)] animate-pulse" />,
      color: "dangerRed",
      desc: "Burnout Imminent",
      bg: "bg-dangerRed/10"
    }
  ];

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { type: 'spring' } } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c, i) => (
        <motion.div 
          variants={itemVars} 
          key={i} 
          className="glass-card flex flex-col p-6 bg-black/40 border-white/5 group hover:border-white/20 transition-all duration-300 relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none rounded-full ${c.bg}`} />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{c.title}</h3>
            <div className={`p-3 rounded-xl border border-${c.color}/30 shadow-[0_0_15px_rgba(currentColor,0.2)] ${c.bg}`}>
              {c.icon}
            </div>
          </div>
          
          <div className="mt-auto relative z-10">
            <span className={`text-5xl font-heading font-bold text-${c.color} drop-shadow-[0_0_15px_currentColor] group-hover:drop-shadow-[0_0_25px_currentColor] transition-all`}>
              {c.value}
            </span>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-2">{c.desc}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
