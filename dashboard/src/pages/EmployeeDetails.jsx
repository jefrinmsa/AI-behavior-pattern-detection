import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Shield, Flame } from 'lucide-react';
import api, { fetchEmployees, fetchEmployeeReport, fetchBurnout } from '../api';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOps = async () => {
      try {
        const data = await fetchEmployees();
        const emps = data.employees || [];
        
        let detailedTeam = [];
        for (const e of emps) {
          const [repData, boData] = await Promise.all([
            fetchEmployeeReport(e.id).catch(() => ({ score_breakdown: { final: 0 }})),
            fetchBurnout(e.id, 'manager').catch(() => ({ risk_level: 'HEALTHY' }))
          ]);
          detailedTeam.push({
            ...e,
            score: repData?.score_breakdown?.final || 0,
            burnout: boData?.risk_level || 'HEALTHY'
          });
        }
        setTeam(detailedTeam);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    loadOps();
    const interval = setInterval(loadOps, 30000);
    return () => clearInterval(interval);
  }, []);

  const getBorderColor = (risk) => {
    const r = risk?.toUpperCase();
    if (r === 'BURNOUT') return 'border-dangerRed shadow-glow-red animate-pulse';
    if (r === 'AT RISK') return 'border-warningOrange shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    if (r === 'WATCH') return 'border-[#EAB308] shadow-[0_0_10px_rgba(234,179,8,0.5)]';
    return 'border-successGreen shadow-glow-green';
  };

  if (loading) return null;

  return (
    <div className="w-full relative min-h-screen flex flex-col items-center pb-20 pt-6">
      
      <div className="w-full max-w-5xl px-6 mb-8 flex flex-col gap-4 relative z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/scrum/${id}`)}
            className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-3xl font-heading font-bold text-white tracking-widest uppercase">Team Directory</h1>
        </div>
      </div>

      <div className="w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {team.map((emp, i) => (
          <motion.button
            key={emp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(`/scrum/${id}/employee/${emp.id}`)}
            className={`glass-card p-6 flex items-center justify-between group transition-all duration-300 hover:-translate-y-2 border-2 ${getBorderColor(emp.burnout)} bg-black/60`}
          >
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-black border border-white/20 flex flex-col items-center justify-center font-heading font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                 {emp.name.substring(0,2).toUpperCase()}
               </div>
               <div className="flex flex-col items-start gap-1">
                 <span className="font-bold text-lg tracking-wider group-hover:text-electricBlue transition-colors">{emp.name}</span>
                 <span className="font-mono text-xs text-gray-500 uppercase">{emp.id}</span>
               </div>
            </div>

            <div className="flex flex-col items-end gap-2">
               <div className="bg-electricBlue/10 border border-electricBlue/30 text-electricBlue font-mono font-bold px-3 py-1 rounded-lg text-sm flex items-center gap-2 shadow-glow-blue">
                 <Target className="w-4 h-4" /> {emp.score}%
               </div>
               {emp.burnout === 'BURNOUT' && <Flame className="w-5 h-5 text-dangerRed drop-shadow-[0_0_8px_rgba(255,0,85,0.8)] animate-pulse" />}
               {emp.burnout === 'HEALTHY' && <Shield className="w-5 h-5 text-successGreen drop-shadow-[0_0_8px_rgba(0,255,102,0.8)]" />}
            </div>
          </motion.button>
        ))}
      </div>

    </div>
  );
}
