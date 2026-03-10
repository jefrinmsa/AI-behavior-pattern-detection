import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, AlertTriangle } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api, { fetchEmployeeBreaks, startBreak, endBreak } from '../api';
import Header from '../components/shared/Header';

export default function EmployeeBreak() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [breaks, setBreaks] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState(0);

  const loadData = async () => {
    try {
      const data = await fetchEmployeeBreaks(id);
      setBreaks(data.breaks || []);
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
    if (summary.on_break_now) {
      timer = setInterval(() => {
        setActiveTimer(prev => prev + 1);
      }, 1000);
    } else {
      setActiveTimer(0);
    }
    return () => clearInterval(timer);
  }, [summary.on_break_now]);

  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync optimistic state whenever the API confirms state
  useEffect(() => {
    setIsOnBreak(!!summary.on_break_now);
  }, [summary.on_break_now]);

  const handleToggleBreak = async () => {
    if (isLoading) return; // Prevent double-clicks
    setIsLoading(true);
    
    try {
      if (isOnBreak) {
        // Optimistically update UI immediately
        setIsOnBreak(false);
        await endBreak(id);
      } else {
        // Optimistically update UI immediately
        setIsOnBreak(true);
        await startBreak(id);
      }
      // Refresh real data from API after action
      await loadData();
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setIsOnBreak(prev => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return null;

  const used = summary.total_break_min || 0;
  const limit = summary.break_limit_min || 90;
  const remaining = Math.max(0, limit - used);
  const percentage = Math.min(100, (used / limit) * 100);

  let meterColor = '#10B981'; // Green
  let meterShadow = 'drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]';
  if (used >= 80) {
    meterColor = '#EF4444'; // Red
    meterShadow = 'drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]';
  } else if (used >= 60) {
    meterColor = '#F59E0B'; // Orange
    meterShadow = 'drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]';
  }

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full relative min-h-screen flex flex-col items-center pb-20 pt-6">

      <Header title={id} subtitle="Recharge Node" showTracker={true} breakActive={summary.on_break_now} />

      {/* Header Container */}
      <div className="w-full max-w-lg px-6 mb-8 flex flex-col gap-4 relative z-20 mt-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/employee/${id}`)}
            className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-3xl font-heading font-bold text-white tracking-widest uppercase">Break Time</h1>
        </div>

        {summary.exceeded && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-dangerRed/20 border border-dangerRed/50 rounded-xl p-4 flex flex-col gap-2 shadow-glow-red mt-4">
            <span className="text-dangerRed font-bold tracking-widest flex items-center gap-2 uppercase text-sm">
              <AlertTriangle className="w-5 h-5 fill-dangerRed/20" /> Limit Exceeded
            </span>
            <p className="text-gray-300 font-mono text-xs">⚠️ Break limit reached! Any additional breaks will be flagged in your report.</p>
          </motion.div>
        )}
      </div>

      <div className="w-full max-w-lg px-6 flex flex-col gap-10 items-center">

        {/* SECTION 1 - METER */}
        <div className="glass-card flex flex-col items-center p-8 border-white/10 bg-black/40 rounded-2xl w-full">
          <div className={`w-48 h-48 relative ${meterShadow} transition-all duration-500 mb-6`}>
            <CircularProgressbar
              value={percentage}
              circleRatio={0.75}
              styles={buildStyles({
                rotation: 1 / 2 + 1 / 8,
                strokeLinecap: 'butt',
                trailColor: "rgba(255,255,255,0.05)",
                pathColor: meterColor,
              })}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-3xl font-mono font-bold" style={{ color: meterColor }}>{used}m</span>
              <span className="text-xs uppercase font-bold tracking-widest text-gray-500">USED</span>
            </div>
          </div>
          <div className="flex w-full justify-between items-center text-xs font-mono uppercase font-bold tracking-widest bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="text-gray-400">Allowed: {limit}m</span>
            <span className="text-white" style={{ textShadow: `0 0 10px ${meterColor}` }}>Remaining: {remaining}m</span>
          </div>
        </div>

        {/* SECTION 2 - BUTTON */}
        <button
          onClick={handleToggleBreak}
          disabled={isLoading}
          className={`w-full relative overflow-hidden group font-bold font-heading text-2xl tracking-widest py-8 rounded-2xl transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait
            ${isOnBreak
              ? 'bg-gradient-to-r from-dangerRed to-[#FF0055] text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:shadow-[0_0_50px_rgba(239,68,68,0.8)] animate-pulse'
              : 'bg-gradient-to-r from-successGreen to-[#00CC66] text-black shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)]'
            }`}
        >
          <span className="relative z-10 flex flex-col items-center justify-center gap-2">
            {isLoading ? (
              <div className="flex items-center gap-3">⏳ Syncing...</div>
            ) : isOnBreak ? (
              <>
                <div className="flex items-center gap-3"><div className="w-3 h-3 bg-white rounded-full animate-ping" /> End Break 🔴</div>
                <span className="font-mono text-base font-medium opacity-80 mt-1 tracking-widest bg-black/20 px-4 py-1 rounded-full">On break for {formatTimer(activeTimer)}</span>
              </>
            ) : (
              <div className="flex items-center gap-3">Start Break ☕</div>
            )}
          </span>
          <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-2xl transition-transform duration-300 opacity-0 group-active:opacity-100" />
        </button>

        {/* SECTION 3 - HISTORY */}
        <div className="w-full flex flex-col gap-4">
          <h3 className="font-heading font-bold uppercase tracking-[0.2em] text-sm text-gray-400 border-b border-white/10 pb-2">Break Logging</h3>
          <div className="flex flex-col gap-3">
            {breaks.filter(b => b.end_time).map((b, i) => (
              <div key={i} className="flex justify-between items-center bg-black/40 border border-white/5 p-4 rounded-xl shadow-inner">
                <span className="text-gray-300 font-mono text-sm">Break {b.break_number} <span className="text-gray-500 ml-2">({b.start_time} - {b.end_time})</span></span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-mono font-bold tracking-widest">{b.duration_min}m</span>
                  <span className="text-successGreen">✅</span>
                </div>
              </div>
            ))}
            {breaks.filter(b => b.end_time).length === 0 && (
              <p className="text-center text-gray-600 font-mono text-sm py-4">No breaks logged today.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
