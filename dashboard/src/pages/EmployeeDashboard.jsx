import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import api, { fetchEmployeeReport, fetchEmployeeHistory, fetchEmployeeBreaks } from '../api';

import Header from '../components/shared/Header';
import ScoreRing from '../components/shared/ScoreRing';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import WeeklyChart from '../components/charts/WeeklyChart';

export default function EmployeeDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [breaks, setBreaks] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll for data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [repData, histData, breakData] = await Promise.all([
          fetchEmployeeReport(id).catch(() => ({})),
          fetchEmployeeHistory(id).catch(() => ({ history: [] })),
          fetchEmployeeBreaks(id).catch(() => ({ breaks: [], summary: {} }))
        ]);
        setReport(repData);
        setHistoryData(histData.history || []);
        setBreaks(breakData);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    
    loadData();
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, [id]);

  const onBreakCount = breaks?.summary?.total_break_min || 0;
  const limits = breaks?.summary?.break_limit_min || 90;
  const breakActive = breaks?.summary?.on_break_now;

  const score = report?.score_breakdown?.final || 0;

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  if (loading) return <div className="text-white flex items-center justify-center min-h-screen font-mono">NEURAL LINK INITIALIZING...</div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full relative min-h-screen flex flex-col items-center pb-20">
      <Header title={report?.emp_id || id} subtitle="Operative Profile" showTracker={true} breakActive={breakActive} />

      <div className="w-full max-w-6xl mt-10 px-6 flex flex-col gap-10">
        
        {/* SECTION 1 - SCORE RING */}
        <motion.div variants={itemVariants} className="w-full">
          <ScoreRing targetScore={score} />
        </motion.div>

        {/* SECTION 2 - APP CATEGORY USAGE */}
        <motion.div variants={itemVariants} className="w-full">
          <CategoryBarChart report={report} />
        </motion.div>

        {/* SECTION 3 - WEEKLY PRODUCTIVITY */}
        <motion.div variants={itemVariants} className="w-full">
          <WeeklyChart historyData={historyData} />
        </motion.div>

        {/* SECTION 4 - CALL TO ACTION BUTTONS */}
        <motion.div variants={itemVariants} className="w-full flex flex-col items-center gap-6 mt-6">
          <button 
            onClick={() => navigate(`/employee/${id}/goals`)}
            className="w-full max-w-sm relative overflow-hidden group bg-gradient-to-r from-electricBlue to-[#0099FF] text-black font-bold font-heading text-lg tracking-widest py-5 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:-translate-y-1 active:scale-[0.98] transition-all"
          >
            <span className="relative z-10">🎯 View Goals</span>
            <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-2xl transition-transform duration-300 opacity-0 group-active:opacity-100" />
          </button>

          <button 
            onClick={() => navigate(`/employee/${id}/break`)}
            className={`w-full max-w-sm relative overflow-hidden group font-bold font-heading text-lg tracking-widest py-5 rounded-2xl transition-all hover:-translate-y-1 active:scale-[0.98]
              ${breakActive 
                ? 'bg-gradient-to-r from-dangerRed to-[#FF0055] text-white shadow-[0_0_20px_rgba(255,0,85,0.5)] hover:shadow-[0_0_40px_rgba(255,0,85,0.8)] animate-pulse' 
                : 'bg-gradient-to-r from-successGreen to-[#00CC66] text-black shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:shadow-[0_0_40px_rgba(0,255,102,0.6)]'
              }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {breakActive ? '🔴 On Break - Return Node' : '☕ Take Break'}
            </span>
            <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-2xl transition-transform duration-300 opacity-0 group-active:opacity-100" />
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}
