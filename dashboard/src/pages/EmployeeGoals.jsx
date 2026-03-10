import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Play, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import api, { fetchEmployeeGoals, completeGoal } from '../api';

export default function EmployeeGoals() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [activeTimer, setActiveTimer] = useState(0);

  const loadData = async () => {
    try {
      const data = await fetchEmployeeGoals(id);
      setGoals(data.goals || []);
      setSummary(data.summary || {});
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    let timer;
    if (activeGoalId !== null) {
      timer = setInterval(() => {
        setActiveTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeGoalId]);

  const handleStart = (goalId) => {
    if (activeGoalId !== null && activeGoalId !== goalId) {
      alert("⚠️ Please complete your current task before starting a new one.");
      return;
    }
    setActiveGoalId(goalId);
    setActiveTimer(0);
  };

  const handleComplete = async (goalId) => {
    try {
      const res = await completeGoal(id, goalId);
      if (res.sprint_complete) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#B500FF', '#00FF66']
        });
      }
      setActiveGoalId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderBadge = (prio) => {
    const p = prio?.toLowerCase() || 'low';
    if (p === 'high') return <span className="bg-dangerRed/20 text-dangerRed border border-dangerRed/50 px-3 py-1 rounded-full text-xs font-bold tracking-widest shadow-glow-red flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-dangerRed" /> HIGH</span>;
    if (p === 'medium') return <span className="bg-warningOrange/20 text-warningOrange border border-warningOrange/50 px-3 py-1 rounded-full text-xs font-bold tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-warningOrange" /> MEDIUM</span>;
    return <span className="bg-successGreen/20 text-successGreen border border-successGreen/50 px-3 py-1 rounded-full text-xs font-bold tracking-widest shadow-glow-green flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-successGreen" /> LOW</span>;
  };

  if (loading) return null;

  const isComplete = summary.sprint_complete;

  return (
    <div className="w-full relative min-h-screen flex flex-col items-center pb-20 pt-6">
      
      {/* Header Container */}
      <div className="w-full max-w-4xl px-6 mb-8 flex flex-col gap-4 relative z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/employee/${id}`)}
            className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-3xl font-heading font-bold text-white tracking-widest uppercase">My Goals Today</h1>
        </div>

        <div className="glass-card flex flex-col p-6 border-white/10 bg-black/40">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-mono tracking-widest text-sm uppercase">{summary.completed || 0} of {summary.total || 0} Completed</span>
            <span className="text-electricBlue font-bold font-mono shadow-glow-blue text-sm">{summary.completion_rate || 0}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${summary.completion_rate || 0}%` }} 
              className={`h-full ${summary.completion_rate === 100 ? 'bg-successGreen shadow-glow-green' : 'bg-electricBlue shadow-glow-blue'} transition-all`} 
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isComplete && summary.total > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-4xl px-6 mb-8 text-center flex flex-col items-center gap-2"
          >
            <h2 className="text-4xl font-heading font-bold text-successGreen drop-shadow-[0_0_20px_rgba(0,255,102,0.8)] tracking-widest animate-pulse">🎉 SPRINT COMPLETE!</h2>
            <p className="text-gray-300 font-mono">Amazing work! You have earned your free time today 🏆</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      <div className="w-full max-w-4xl px-6 flex flex-col gap-6">
        {goals.map((g, i) => {
          const isStarted = activeGoalId === g.id;
          const isDone = g.status === 'completed';

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              key={g.id} 
              className="glass-card bg-black/40 border-white/5 hover:border-white/20 hover:-translate-y-1 transition-all p-6 rounded-2xl flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            >
              
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-xl font-heading font-bold ${isDone ? 'text-gray-500 line-through' : 'text-white'} transition-colors tracking-wide`}>
                  {g.title}
                </h3>
                {renderBadge(g.priority)}
              </div>

              <div className="flex items-center gap-2 text-gray-400 font-mono text-xs mb-6 uppercase tracking-widest">
                <Clock className="w-4 h-4" /> 
                <span>Estimated: {g.estimated_hours} hours</span>
              </div>

              <div className="mt-auto">
                {isDone ? (
                  <div className="bg-successGreen/10 border border-successGreen/30 rounded-xl p-4 flex flex-col gap-2 shadow-[inset_0_0_20px_rgba(0,255,102,0.1)]">
                    <div className="flex items-center gap-2 text-successGreen font-bold tracking-widest text-sm">
                      <CheckCircle2 className="w-5 h-5 shadow-glow-green rounded-full bg-black" />
                      COMPLETED
                    </div>
                    {/* Simplified mock logic for estimate vs actual */}
                    <span className="text-xs font-mono text-gray-300">Completed in: {g.time_taken_min}m</span>
                    {g.time_taken_min < (g.estimated_hours * 60) ? (
                      <span className="text-xs font-mono text-successGreen drop-shadow-[0_0_5px_rgba(0,255,102,0.8)]">⚡ Faster than estimate! Great work 🏆</span>
                    ) : (
                      <span className="text-xs font-mono text-electricBlue drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">✅ Right on time! Well done</span>
                    )}
                  </div>
                ) : isStarted ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-successGreen/10 border border-successGreen/50 rounded-xl p-4 shadow-glow-green animate-pulse">
                      <span className="font-bold tracking-widest text-successGreen flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-successGreen" /> IN PROGRESS
                      </span>
                      <span className="font-mono text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{formatTime(activeTimer)}</span>
                    </div>
                    <button 
                      onClick={() => handleComplete(g.id)}
                      className="w-full bg-gradient-to-r from-successGreen to-[#00CC66] text-black font-bold font-heading py-3 rounded-xl shadow-glow-green hover:shadow-[0_0_30px_rgba(0,255,102,0.8)] transition-all flex justify-center items-center gap-2 uppercase tracking-widest"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Mark Complete
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleStart(g.id)}
                    className="w-full bg-gradient-to-r from-electricBlue to-[#0099FF] text-black font-bold font-heading py-3 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all flex justify-center items-center gap-2 uppercase tracking-widest"
                  >
                    <Play className="w-5 h-5 fill-black" /> Start Task
                  </button>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
