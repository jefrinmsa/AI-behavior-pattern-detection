import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle, Flame, XCircle } from 'lucide-react';
import { fetchBurnout } from '../../api';

export default function BurnoutRadar({ teamMembers = [] }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const members = teamMembers.filter(m => m.name);

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'HEALTHY': return { bg: 'bg-successGreen/5', border: 'border-successGreen/30', text: 'text-successGreen', shadow: 'hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:border-successGreen border-b-2', icon: <ShieldCheck className="w-8 h-8 drop-shadow-[0_0_8px_rgba(0,255,102,0.8)]" /> };
      case 'WATCH': return { bg: 'bg-warningOrange/5', border: 'border-warningOrange/40', text: 'text-warningOrange', shadow: 'hover:shadow-[0_0_25px_rgba(255,179,0,0.4)] hover:border-warningOrange border-b-4', icon: <AlertTriangle className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,179,0,0.8)]" /> };
      case 'AT RISK': return { bg: 'bg-dangerRed/10', border: 'border-dangerRed/60', text: 'text-dangerRed', shadow: 'shadow-[0_0_15px_rgba(255,0,85,0.4)] hover:shadow-[0_0_30px_rgba(255,0,85,0.6)] border-dangerRed border-b-[6px]', icon: <AlertTriangle className="w-8 h-8 drop-shadow-[0_0_10px_rgba(255,0,85,1)]" /> };
      case 'BURNOUT': return { bg: 'bg-purpleAccent/20', border: 'border-purpleAccent shadow-[0_0_20px_rgba(181,0,255,0.6)] border-b-[8px]', text: 'text-purpleAccent', shadow: 'hover:shadow-[0_0_40px_rgba(181,0,255,0.8)]', icon: <Flame className="w-8 h-8 drop-shadow-[0_0_12px_rgba(181,0,255,1)]" animate={{scale:[1,1.3,1]}} transition={{repeat:Infinity, duration:0.5}} /> };
      default: return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-gray-400', shadow: '', icon: <Activity className="w-8 h-8" /> };
    }
  };

  const handleCardClick = async (member) => {
    setLoading(true);
    setSelectedUser(member);
    try {
      const data = await fetchBurnout(member.emp_id, 'manager');
      setDetails(data);
    } catch {
      setDetails({ error: "DIAGNOSTIC FAILED. AGENT UNREACHABLE." });
    }
    setLoading(false);
  };

  const closeMenu = () => {
    setSelectedUser(null);
    setDetails(null);
  };

  return (
    <div className="glass-card flex flex-col h-full bg-black/40 border-white/5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 relative z-10 border-b border-white/10 pb-4">
        <h2 className="text-xl font-heading font-medium tracking-[0.2em] flex items-center gap-3">
          <div className="p-2 bg-dangerRed/10 rounded-lg border border-dangerRed/30 text-dangerRed shadow-[0_0_10px_rgba(255,0,85,0.3)]">
             <Activity className="w-5 h-5" />
          </div>
          NEURAL HEALTH RADAR
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 flex-grow relative z-10">
        {members.map(member => {
          const risk = member.burnout_risk || 'HEALTHY';
          const theme = getRiskColor(risk);
          const isBad = risk === 'AT RISK' || risk === 'BURNOUT';
          
          return (
            <motion.div
              key={member.emp_id}
              onClick={() => handleCardClick(member)}
              whileHover={{ y: -5, scale: 1.05 }}
              animate={isBad ? { x: [-2, 2, -2, 2, 0] } : {}}
              transition={isBad ? { repeat: Infinity, duration: 4, repeatDelay: 2 } : {}}
              className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${theme.bg} ${theme.border} ${theme.shadow}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
              
              <div className={`mb-4 relative z-10 ${theme.text}`}>
                {theme.icon}
              </div>
              <span className="font-bold text-xl leading-tight mb-2 tracking-wide text-white drop-shadow-md relative z-10">{member.name}</span>
              <span className={`text-[9px] uppercase font-bold tracking-[0.2em] px-3 py-1 bg-[#05050A] shadow-inner rounded-md border border-white/10 relative z-10 ${theme.text}`}>
                [ {risk} ]
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Extreme Diagnostic Overlay */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-2 z-50 rounded-3xl bg-[#05050A]/95 backdrop-blur-2xl border border-electricBlue/30 p-8 flex flex-col shadow-glow-blue"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electricBlue via-purpleAccent to-electricBlue animate-[pulse_2s_ease-in-out_infinite]" />

            <div className="flex justify-between items-start mb-6 border-b border-electricBlue/20 pb-6">
              <div>
                <span className="text-electricBlue font-bold tracking-[0.3em] text-[10px] uppercase block mb-2">Deep Scan Initialized</span>
                <h3 className="text-3xl font-heading font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{selectedUser.name}</h3>
                <span className="text-gray-400 font-mono text-sm tracking-widest mt-1 block">ID/ {selectedUser.emp_id}</span>
              </div>
              <button onClick={closeMenu} className="p-3 bg-dangerRed/10 border border-dangerRed/30 hover:bg-dangerRed text-dangerRed hover:text-white rounded-xl transition-all shadow-glow-red flex-shrink-0 group">
                <XCircle className="w-8 h-8 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-4">
              {loading ? (
                <div className="flex justify-center items-center h-full flex-col gap-4">
                  <div className="w-16 h-16 border-4 border-electricBlue border-t-transparent rounded-full animate-spin shadow-glow-blue" />
                  <span className="text-electricBlue font-mono uppercase tracking-[0.2em] text-xs animate-pulse">Running AI Diagnostics...</span>
                </div>
              ) : details?.error ? (
                <div className="text-center text-dangerRed mt-20 flex flex-col items-center">
                  <AlertTriangle className="w-16 h-16 mb-6 drop-shadow-[0_0_15px_rgba(255,0,85,1)] animate-ping" />
                  <p className="font-heading text-2xl tracking-widest uppercase font-bold text-glow-red">{details.error}</p>
                </div>
              ) : details ? (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col gap-8">
                  
                  <div className="flex items-center justify-between bg-black/50 p-6 rounded-2xl border border-white/10 shadow-inner">
                    <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Calculated AI Threat Score</span>
                    <span className={`text-6xl font-heading font-bold ${getRiskColor(details.risk_level).text} drop-shadow-[0_0_15px_currentColor]`}>{details.risk_score}</span>
                  </div>

                  <div className="bg-dangerRed/5 border border-dangerRed/20 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-dangerRed shadow-[0_0_10px_#FF0055]" />
                    <h4 className="text-xs font-bold text-dangerRed uppercase tracking-[0.2em] mb-4">Diagnostic Signals Triggered</h4>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(details.signals || {}).map(k => {
                        const val = details.signals[k];
                        if (val <= 0) return null;
                        return (
                          <span key={k} className="text-xs font-mono bg-[#05050A] text-gray-300 px-4 py-2 rounded-lg border border-dangerRed/30 shadow-[0_0_10px_rgba(255,0,85,0.1)] flex items-center gap-2">
                            {k}: <span className="text-dangerRed font-bold drop-shadow-[0_0_5px_#FF0055]">+{val}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {details.observations && details.observations.length > 0 && (
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <h4 className="text-xs font-bold text-purpleAccent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> AI Isolation Forest Logs
                      </h4>
                      <ul className="space-y-3">
                        {details.observations.map((obs, i) => (
                           <li key={i} className="text-sm font-mono text-gray-300 bg-black/40 p-3 rounded border border-white/5 flex gap-3 items-start">
                             <span className="text-purpleAccent mt-0.5">{'>'}</span> {obs}
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {details.recommended_actions && details.recommended_actions.length > 0 && (
                    <div className="bg-successGreen/5 border border-successGreen/30 p-6 rounded-2xl">
                      <h4 className="text-xs font-bold text-successGreen uppercase tracking-[0.2em] mb-4">Mandatory Interventions</h4>
                      <ul className="space-y-3">
                        {details.recommended_actions.map((act, i) => (
                           <li key={i} className="text-sm font-mono text-successGreen bg-successGreen/10 p-3 rounded border border-successGreen/20 flex gap-3 items-start font-bold uppercase tracking-wider">
                             <span className="text-white mt-0.5">※</span> {act}
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </motion.div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
