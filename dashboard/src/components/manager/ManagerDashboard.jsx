import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { fetchTeamProgress, fetchTeamHistory } from '../../api';

import TeamOverview from './TeamOverview';
import Leaderboard from './Leaderboard';
import BurnoutRadar from './BurnoutRadar';
import ActivityTimeline from './ActivityTimeline';

export default function ManagerDashboard({ onLogout }) {
  const [teamData, setTeamData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    try {
      const [data, hist] = await Promise.all([
        fetchTeamProgress(),
        fetchTeamHistory().catch(() => ({ history: [] }))
      ]);
      setTeamData(data);
      setHistoryData(hist.history || []);
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-20 h-20 border-4 border-dangerRed border-t-transparent rounded-full animate-spin shadow-glow-red" />
      </div>
    );
  }

  if (error || !teamData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h2 className="text-4xl font-heading font-bold text-dangerRed mb-4 text-glow-red">Connection Terminated</h2>
        <p className="text-gray-400 mb-8 max-w-md text-lg">WorkSense mainframe is unreachable. Verify telemetry port 5000 is online.</p>
        <button onClick={loadData} className="glass-button text-dangerRed border-dangerRed/50 hover:shadow-glow-red">
          Reboot Sequence
        </button>
      </div>
    );
  }

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, y: 30, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', bounce: 0.3 } } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="w-full max-w-[1500px] mx-auto flex flex-col gap-8 relative z-10">
      
      {/* Header */}
      <motion.div variants={itemVars} className="flex justify-between items-center bg-[#05050A]/70 backdrop-blur-xl rounded-2xl p-6 border border-white/5 border-l-4 border-l-dangerRed shadow-glow-red mt-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-heading font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-electricBlue to-purpleAccent">WorkSense.</h1>
            <span className="text-[10px] uppercase tracking-[0.3em] bg-[#FF0055]/10 text-dangerRed font-bold px-3 py-1 rounded ml-4 border border-dangerRed/30 shadow-[0_0_10px_rgba(255,0,85,0.4)]">Admin View</span>
          </div>
          <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} // GLOBAL SYNC ACTIVE</span>
        </div>

        <button onClick={onLogout} title="Disconnect" className="p-3 rounded-xl bg-dangerRed/10 hover:bg-dangerRed border border-transparent hover:border-dangerRed hover:shadow-glow-red text-dangerRed hover:text-white transition-all ml-6">
            <LogOut className="w-5 h-5" />
        </button>
      </motion.div>

      <motion.div variants={itemVars}>
        <TeamOverview summary={teamData.summary} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[750px] overflow-hidden">
        <motion.div variants={itemVars} className="flex flex-col gap-8 h-full">
          <BurnoutRadar teamMembers={teamData.team} />
        </motion.div>
        
        <motion.div variants={itemVars} className="flex flex-col gap-8 h-full">
          <div className="flex-1 overflow-hidden">
            <Leaderboard teamMembers={teamData.team} />
          </div>
          <div className="h-[300px] flex-shrink-0">
            <ActivityTimeline historyData={historyData} />
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
