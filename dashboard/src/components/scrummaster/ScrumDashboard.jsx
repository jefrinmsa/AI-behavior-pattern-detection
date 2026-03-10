import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fetchTeamProgress } from '../../api';

import AssignGoal from './AssignGoal';
import KanbanBoard from './KanbanBoard';
import WorkloadMeter from './WorkloadMeter';

export default function ScrumDashboard({ onLogout }) {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchTeamProgress();
      setTeamData(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !teamData) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-16 h-16 border-4 border-warningOrange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Aggregate stats
  let totalAssigned = 0;
  let totalCompleted = 0;
  let overloadedCount = 0;

  teamData.team.forEach(t => {
    totalAssigned += t.goals_total || 0;
    totalCompleted += t.goals_completed || 0;
    // Assuming we calculate overload natively in WorkloadMeter, mock overview here
    // Wait, Workload is based on hours. Our API doesn't return total_hours in /progress right now.
  });
  
  const compRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' } } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="w-full max-w-[1400px] mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <motion.div variants={itemVars} className="flex justify-between items-center bg-black/30 backdrop-blur-md rounded-2xl p-4 px-6 border border-white/5 border-l-4 border-l-warningOrange">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">WorkSense.</h1>
            <span className="text-xs uppercase tracking-widest bg-warningOrange/20 text-warningOrange font-bold px-2 py-0.5 rounded ml-2">Scrum Master View</span>
          </div>
          <span className="text-xs text-gray-500">Sprint Timeline: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>

        <button onClick={onLogout} className="p-2 ml-4 rounded-xl bg-white/5 hover:bg-dangerRed/20 text-gray-400 hover:text-dangerRed transition-colors">
            <LogOut className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVars} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card bg-black/40 flex items-center p-4 gap-4">
          <div className="p-3 rounded-xl bg-electricBlue/10 text-electricBlue"><Target className="w-6 h-6" /></div>
          <div><p className="text-xs text-gray-400 font-bold mb-1">Assigned Tickets</p><p className="text-2xl font-bold">{totalAssigned}</p></div>
        </div>
        <div className="glass-card bg-black/40 flex items-center p-4 gap-4">
          <div className="p-3 rounded-xl bg-successGreen/10 text-successGreen"><CheckCircle2 className="w-6 h-6" /></div>
          <div><p className="text-xs text-gray-400 font-bold mb-1">Completed Tickets</p><p className="text-2xl font-bold">{totalCompleted}</p></div>
        </div>
        <div className="glass-card bg-black/40 flex items-center p-4 gap-4">
          <div className="p-3 rounded-xl bg-purpleAccent/10 text-purpleAccent"><Target className="w-6 h-6" /></div>
          <div><p className="text-xs text-gray-400 font-bold mb-1">Team Completion</p><p className="text-2xl font-bold">{compRate}%</p></div>
        </div>
        <div className="glass-card bg-black/40 flex items-center p-4 gap-4 border border-white/5 hover:border-warningOrange/30">
          <div className="p-3 rounded-xl bg-warningOrange/10 text-warningOrange"><AlertTriangle className="w-6 h-6" /></div>
          <div><p className="text-xs text-gray-400 font-bold mb-1">Overloaded Staff</p><p className="text-2xl font-bold">{overloadedCount}</p></div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        {/* Left Side: Assign Goal & Workload */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar">
          <motion.div variants={itemVars}>
            <AssignGoal teamMembers={teamData.team} onAssigned={loadData} />
          </motion.div>
          <motion.div variants={itemVars}>
            <WorkloadMeter teamMembers={teamData.team} />
          </motion.div>
        </div>
        
        {/* Right Side: Kanban */}
        <div className="lg:col-span-9 h-full">
          <motion.div variants={itemVars} className="h-full">
            <KanbanBoard teamMembers={teamData.team} onGoalUpdated={loadData} />
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
}
