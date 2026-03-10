import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, Crosshair } from 'lucide-react';
import api, { fetchEmployeeReport, fetchEmployeeGoals, fetchBurnout } from '../api';
import ScoreRing from '../components/shared/ScoreRing';

export default function SingleEmployeeDetail() {
  const { id, empId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState({});
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({});
  const [burnout, setBurnout] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOps = async () => {
      try {
        const [rep, gs, bo] = await Promise.all([
          fetchEmployeeReport(empId).catch(() => ({})),
          fetchEmployeeGoals(empId).catch(() => ({ goals: [], summary: {} })),
          fetchBurnout(empId, 'manager').catch(() => ({}))
        ]);
        setReport(rep);
        setGoals(gs.goals || []);
        setSummary(gs.summary || {});
        setBurnout(bo);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    loadOps();
  }, [empId]);

  if (loading) return null;

  const score = report?.score_breakdown?.final || 0;
  const warnings = report?.suspicious_flags || [];

  const getBurnoutColors = (lvl) => {
    const r = lvl?.toUpperCase();
    if (r === 'BURNOUT') return { bg: 'bg-dangerRed/10', border: 'border-dangerRed', text: 'text-dangerRed', shadow: 'shadow-glow-red', icon: <AlertTriangle className="w-8 h-8" /> };
    if (r === 'AT RISK') return { bg: 'bg-warningOrange/10', border: 'border-warningOrange', text: 'text-warningOrange', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]', icon: <ShieldAlert className="w-8 h-8" /> };
    if (r === 'WATCH') return { bg: 'bg-[#EAB308]/10', border: 'border-[#EAB308]', text: 'text-[#EAB308]', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]', icon: <ShieldAlert className="w-8 h-8" /> };
    return { bg: 'bg-successGreen/10', border: 'border-successGreen', text: 'text-successGreen', shadow: 'shadow-glow-green', icon: <Crosshair className="w-8 h-8" /> };
  };

  const boStyle = getBurnoutColors(burnout.risk_level);

  return (
    <div className="w-full relative min-h-screen flex flex-col items-center pb-20 pt-6">
      
      <div className="w-full max-w-6xl px-6 mb-8 flex flex-col gap-8 relative z-20">
        
        <div className="flex items-center gap-6 border-b border-white/10 pb-6">
          <button 
            onClick={() => navigate(`/scrum/${id}/employees`)}
            className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="w-16 h-16 rounded-full bg-black border-2 border-electricBlue flex items-center justify-center font-heading font-bold text-2xl text-white shadow-glow-blue">
            {empId.substring(0,3).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-heading font-bold text-white tracking-widest">{empId}</h1>
            <span className="text-gray-400 font-mono tracking-widest uppercase text-xs">Deep Scan Diagnostics</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="flex flex-col gap-8">
            <div className="glass-card p-8 bg-black/40 border-white/5 flex flex-col items-center justify-center rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
               <h2 className="font-heading font-bold tracking-[0.2em] text-gray-400 uppercase text-xs mb-4 w-full text-left">Target Neural Efficiency</h2>
               <ScoreRing targetScore={score} />
            </div>

            <div className={`glass-card p-6 rounded-2xl border-2 ${boStyle.border} ${boStyle.bg} ${boStyle.shadow} ${burnout.risk_level?.toUpperCase() === 'BURNOUT' ? 'animate-pulse' : ''} flex flex-col gap-4`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${boStyle.border} bg-black/40 ${boStyle.text}`}>
                    {boStyle.icon}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-heading font-bold tracking-[0.2em] text-white uppercase text-2xl">Burnout Status</h2>
                    <span className={`font-bold tracking-widest uppercase ${boStyle.text}`}>{burnout.risk_level || 'HEALTHY'} — SCORE {burnout.risk_score || 0}/100</span>
                  </div>
                </div>
                {burnout.signals && (
                  <div className="mt-4 bg-black/60 border border-white/10 p-4 rounded-xl flex flex-col gap-2 shadow-inner">
                    <span className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-1 border-b border-white/10 pb-2">Telemetry Signals</span>
                    {Object.entries(burnout.signals).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center text-xs font-mono">
                        <span className="text-gray-300">{k.replace('_', ' ')}</span>
                        <span className={v > 0 ? boStyle.text : 'text-gray-600'}>+{v} risk</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="glass-card p-6 bg-black/40 border-white/5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col gap-4">
              <h2 className="font-heading font-bold tracking-[0.2em] text-gray-400 uppercase text-xs flex justify-between border-b border-white/10 pb-2">
                <span>Goals Timeline</span>
                <span className="text-electricBlue">COMPLETED: {summary.completed || 0}/{summary.total || 0}</span>
              </h2>
              
              <div className="flex flex-col gap-3 mt-2">
                {goals.length === 0 && <span className="text-gray-600 font-mono text-sm py-4">No active directives.</span>}
                {goals.map(g => (
                  <div key={g.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-3 shadow-inner">
                     <span className={`font-bold font-heading ${g.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>{g.title}</span>
                     {g.status === 'completed' ? (
                       <div className="flex items-center justify-between text-xs font-mono border-t border-white/5 pt-2">
                          <span className="text-successGreen flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> DONE ({g.time_taken_min}m)</span>
                          {g.time_taken_min < (g.estimated_hours * 60) ? <span className="text-successGreen drop-shadow-[0_0_5px_rgba(0,255,102,0.8)]">⚡ {((g.estimated_hours*60) - g.time_taken_min)}m under</span> : <span className="text-warningOrange drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">🟡 {g.time_taken_min - (g.estimated_hours*60)}m over</span>}
                       </div>
                     ) : (
                       <div className="flex items-center justify-between text-xs font-mono border-t border-white/5 pt-2">
                          <span className="text-gray-400 flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</span>
                          <span className="text-gray-500 text-right">Est: {g.estimated_hours}h</span>
                       </div>
                     )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 bg-black/40 border-white/5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col gap-4">
              <h2 className="font-heading font-bold tracking-[0.2em] text-gray-400 uppercase text-xs flex items-center gap-2 border-b border-white/10 pb-2">
                <Cpu className="w-4 h-4" /> AI WARNINGS
              </h2>
              {warnings.length > 0 ? (
                <div className="flex flex-col gap-3 mt-2">
                  {warnings.map((w, i) => (
                     <div key={i} className="bg-dangerRed/10 border border-dangerRed/40 p-4 rounded-xl shadow-inner flex gap-3 text-sm text-gray-300 font-mono">
                        <AlertTriangle className="w-5 h-5 text-dangerRed flex-shrink-0" />
                        <span>{w}</span>
                     </div>
                  ))}
                </div>
              ) : (
                <div className="bg-successGreen/10 border border-successGreen/30 p-4 rounded-xl text-successGreen font-mono text-sm tracking-widest mt-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> No abnormal behaviour detected today.
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
