import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import api, { fetchEmployeeReport, fetchEmployeeGoals, fetchEmployeeBreaks, fetchEmployeeHistory } from '../../api';

import ScoreCard from './ScoreCard';
import GoalsList from './GoalsList';
import ActivityChart from './ActivityChart';
import BreakTimer from './BreakTimer';
import WeekChart from './WeekChart';

export default function EmployeeDashboard({ empId, onLogout }) {
  const [report, setReport] = useState(null);
  const [goals, setGoals] = useState(null);
  const [breaks, setBreaks] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    try {
      const [repData, goalData, breakData, histData] = await Promise.all([
        fetchEmployeeReport(empId).catch(() => ({})),
        fetchEmployeeGoals(empId).catch(() => ({ goals: [], summary: {} })),
        fetchEmployeeBreaks(empId).catch(() => ({ breaks: [], summary: {} })),
        fetchEmployeeHistory(empId).catch(() => ({ history: [] }))
      ]);
      setReport(repData);
      setGoals(goalData);
      setBreaks(breakData);
      setHistoryData(histData.history || []);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [empId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-16 h-16 border-4 border-electricBlue border-t-transparent rounded-full animate-spin shadow-glow-blue" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h2 className="text-4xl font-heading font-bold text-dangerRed mb-4 text-glow-red">Connection Terminated</h2>
        <p className="text-gray-400 mb-8 max-w-md text-lg">WorkSense mainframe is unreachable. Verify telemetry port 5000 is online.</p>
        <button onClick={loadData} className="glass-button text-electricBlue border-electricBlue/50 hover:shadow-glow-blue">
          Reboot Sequence
        </button>
      </div>
    );
  }

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, y: 30, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', bounce: 0.3 } } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 relative z-10">
      
      {/* Header */}
      <motion.div variants={itemVars} className="flex justify-between items-center bg-[#05050A]/70 backdrop-blur-xl rounded-2xl p-6 border border-white/5 border-l-4 border-l-electricBlue shadow-glow-blue mt-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-heading font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-electricBlue to-purpleAccent">WorkSense.</h1>
            <span className="relative flex h-3 w-3 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-successGreen opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-successGreen shadow-[0_0_10px_#00FF66]"></span>
            </span>
          </div>
          <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} // SYNC PORT: ACTIVE</span>
        </div>

        <div className="flex items-center gap-6 border-l border-white/10 pl-6">
          <div className="text-right">
            <p className="font-bold text-white tracking-wide">{empId.toUpperCase()}</p>
            <p className="text-[10px] text-electricBlue uppercase font-bold tracking-widest">Neural Link Extracted</p>
          </div>
          <button onClick={onLogout} title="Disconnect" className="p-3 rounded-xl bg-dangerRed/10 hover:bg-dangerRed border border-transparent hover:border-dangerRed hover:shadow-glow-red text-dangerRed hover:text-white transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-3 flex flex-col gap-8 h-[750px] overflow-y-auto custom-scrollbar pr-2 pb-10">
          <motion.div variants={itemVars} className="flex-shrink-0">
            <ScoreCard report={report} />
          </motion.div>
          <motion.div variants={itemVars} className="flex-shrink-0">
            <BreakTimer breakData={breaks} empId={empId} refresh={loadData} />
          </motion.div>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-4 flex flex-col gap-8 h-[750px]">
          <motion.div variants={itemVars} className="h-full">
            <GoalsList goalData={goals} empId={empId} refresh={loadData} />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-8 h-[750px]">
          <motion.div variants={itemVars} className="flex-shrink-0">
            <ActivityChart report={report} />
          </motion.div>
          <motion.div variants={itemVars} className="flex-1">
            <WeekChart historyData={historyData} />
          </motion.div>
        </div>

      </div>

      {/* AI Behavioral Anomaly Flags */}
      {report?.suspicious_flags && report.suspicious_flags.length > 0 && (
        <motion.div variants={itemVars} className="bg-dangerRed/10 border border-dangerRed/40 rounded-xl p-4 mt-4 shadow-glow-red flex flex-col gap-2">
           <h3 className="text-dangerRed font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dangerRed animate-ping" /> AI Monitoring Intervention
           </h3>
           <ul className="list-inside space-y-1">
             {report.suspicious_flags.map((flag, idx) => (
                <li key={idx} className="text-gray-300 font-mono text-sm shadow-inner bg-black/40 px-3 py-1.5 rounded">{flag}</li>
             ))}
           </ul>
        </motion.div>
      )}

    </motion.div>
  );
}
