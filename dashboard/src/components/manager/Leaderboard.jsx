import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Award } from 'lucide-react';

export default function Leaderboard({ teamMembers = [] }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const sortedTeam = [...teamMembers].sort((a,b) => (b.productivity_score || 0) - (a.productivity_score || 0));

  const getRankMedal = (index) => {
    if (index === 0) return <span className="text-4xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] filter hue-rotate-15">👑</span>;
    if (index === 1) return <span className="text-3xl drop-shadow-[0_0_10px_rgba(192,192,192,0.8)]">🥈</span>;
    if (index === 2) return <span className="text-2xl drop-shadow-[0_0_10px_rgba(205,127,50,0.8)]">🥉</span>;
    return <span className="text-gray-600 font-mono font-bold text-xl ml-2">{index + 1}</span>;
  };

  const getStatusBadge = (member) => {
    if (member.burnout_risk === 'AT RISK' || member.burnout_risk === 'BURNOUT') {
      return <span className="text-[10px] tracking-widest uppercase bg-dangerRed/10 text-dangerRed px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 border border-dangerRed/30 shadow-[0_0_10px_rgba(255,0,85,0.3)] animate-pulse"><AlertCircle className="w-3 h-3" /> THREAT DETECTED</span>;
    }
    if (member.sprint_complete) {
      return <span className="text-[10px] tracking-widest uppercase bg-successGreen/10 text-successGreen px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 border border-successGreen/30 shadow-[0_0_10px_rgba(0,255,102,0.2)]"><CheckCircle2 className="w-3 h-3" /> CLEARED</span>;
    }
    return <span className="text-[10px] tracking-widest uppercase bg-electricBlue/10 text-electricBlue px-3 py-1.5 rounded-lg font-bold border border-electricBlue/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]">ONLINE</span>;
  };

  return (
    <div className="glass-card flex flex-col h-full bg-black/40 border-white/5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 relative z-10 border-b border-white/10 pb-4">
        <h2 className="text-xl font-heading font-medium tracking-[0.2em] flex items-center gap-3">
          <div className="p-2 bg-successGreen/10 rounded-lg border border-successGreen/30 text-successGreen shadow-[0_0_10px_rgba(0,255,102,0.3)]">
             <Award className="w-5 h-5" />
          </div>
          VANGUARD RANKINGS
        </h2>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {sortedTeam.map((member, idx) => {
          const isExpanded = expandedRow === member.emp_id;

          return (
            <motion.div 
              key={member.emp_id} 
              layout 
              className={`flex flex-col rounded-2xl transition-all duration-300 relative group overflow-hidden ${isExpanded ? 'bg-[#05050A] border border-electricBlue/50 shadow-glow-blue' : 'bg-[#0A0A12] border border-white/5 hover:border-electricBlue/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] cursor-pointer'}`}
            >
              {idx === 0 && <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,215,0,0.05)] to-transparent pointer-events-none" />}

              <div 
                className="flex items-center justify-between p-5 relative z-10"
                onClick={() => setExpandedRow(isExpanded ? null : member.emp_id)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-10 text-center flex justify-center">{getRankMedal(idx)}</div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-white shadow-lg text-lg ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'bg-gradient-to-br from-[#10101A] to-[#05050A] border-white/10'}`}>
                      {member.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading font-bold text-xl tracking-wide">{member.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{member.emp_id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden sm:flex flex-col items-end w-32">
                    <span className={`text-2xl font-heading font-bold ${idx === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' : 'text-electricBlue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]'}`}>
                      {member.productivity_score}%
                    </span>
                    <div className="w-full h-1.5 bg-black/50 rounded-full mt-1 overflow-hidden border border-white/5">
                      <div className={`h-full rounded-full shadow-inner ${idx === 0 ? 'bg-yellow-400' : 'bg-electricBlue'}`} style={{ width: `${member.productivity_score}%` }} />
                    </div>
                  </div>
                  
                  <div className="hidden md:flex flex-col items-center bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <span className="text-lg font-bold font-mono text-white tracking-widest">{member.goals_completed}<span className="text-gray-600">/</span>{member.goals_total}</span>
                    <span className="text-[8px] text-gray-500 uppercase tracking-[0.2em]">Objectives</span>
                  </div>

                  <div className="w-32 flex justify-end">
                    {getStatusBadge(member)}
                  </div>

                  <div className={`text-gray-500 transition-colors ${isExpanded ? 'text-electricBlue' : 'group-hover:text-white'}`}>
                    {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-electricBlue/20 bg-black/50 relative z-10"
                  >
                    <div className="p-6 flex gap-10">
                      <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/5">
                        <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purpleAccent rounded-full shadow-[0_0_5px_#B500FF]"/> SPRINT TRAJECTORY</h4>
                        <div className="w-full bg-[#05050A] rounded-full h-3 mb-3 overflow-hidden border border-white/10 shadow-inner p-0.5">
                          <div className="h-full bg-gradient-to-r from-electricBlue to-purpleAccent rounded-full shadow-[0_0_10px_currentColor]" style={{ width: `${member.goal_completion_rate}%` }} />
                        </div>
                        <span className="text-sm font-bold tracking-widest font-mono text-gray-300">{Math.round(member.goal_completion_rate)}% PROCESSED</span>
                      </div>
                      
                      <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/5">
                        <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-1.5 bg-warningOrange rounded-full shadow-[0_0_5px_#FFB300]"/> METABOLIC STATE</h4>
                        {member.on_break ? (
                           <span className="inline-block px-4 py-2 bg-dangerRed/10 border border-dangerRed/30 text-dangerRed rounded-lg text-xs font-bold font-mono tracking-widest shadow-[0_0_15px_rgba(255,0,85,0.2)] animate-pulse shadow-inner">🔴 SUSPENDED [BREAK]</span>
                        ) : (
                           <span className="inline-block px-4 py-2 bg-successGreen/10 border border-successGreen/30 text-successGreen rounded-lg text-xs font-bold font-mono tracking-widest shadow-[0_0_15px_rgba(0,255,102,0.2)] shadow-inner">🟢 SECURE CONNECTION</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {sortedTeam.length === 0 && (
          <div className="text-center p-12 text-gray-600 font-mono tracking-[0.3em] font-bold text-sm">NO VANGUARDS ACTIVE</div>
        )}
      </div>
    </div>
  );
}
