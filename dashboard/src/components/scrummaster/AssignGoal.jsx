import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Cpu } from 'lucide-react';
import { assignGoal } from '../../api';

export default function AssignGoal({ teamMembers, onAssigned }) {
  const [empId, setEmpId] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [hours, setHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empId || !title.trim()) return;

    setLoading(true);
    setSuccessMsg('');
    setWarningMsg('');

    try {
      const res = await assignGoal(empId, { title, priority, estimated_hours: hours });
      setSuccessMsg(`Command uploaded to ${res.message.split('to ')[1]}`);
      if (res.overload_warning) {
        setWarningMsg(`⚠️ CRITICAL LOAD: Agent at ${res.total_estimated_hours}h allocation.`);
      }
      setTitle('');
      setHours(2);
      onAssigned();
      setTimeout(() => { setSuccessMsg(''); setWarningMsg(''); }, 5000);
    } catch {
      setWarningMsg("Transmission failed. Reboot connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card bg-black/40 border-warningOrange/20 shadow-[0_0_20px_rgba(255,179,0,0.05)] relative overflow-visible">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-warningOrange/10 blur-[50px] pointer-events-none rounded-full" />

      <h2 className="text-xl font-heading font-medium tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
        <div className="p-2 bg-warningOrange/10 rounded-lg border border-warningOrange/30 text-warningOrange shadow-[0_0_10px_rgba(255,179,0,0.3)]">
             <Cpu className="w-5 h-5" />
        </div>
        ASSIGN TICKET
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10 pb-2">
        
        {/* Employee */}
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Target Operative</label>
          <div className="relative">
            <select 
              required
              value={empId} 
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-warningOrange focus:ring-1 focus:ring-warningOrange appearance-none shadow-inner transition-colors cursor-pointer"
            >
              <option value="" disabled>Select Operative...</option>
              {teamMembers.map(m => (
                <option key={m.emp_id} value={m.emp_id}>{m.name} // {m.emp_id}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-warningOrange animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Protocol Directive</label>
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Override mainframe access firewall"
            className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-warningOrange focus:ring-1 focus:ring-warningOrange shadow-inner transition-colors"
          />
        </div>

        {/* Priority */}
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Threat Level</label>
          <div className="flex gap-2">
            {[
              { id: 'low', color: 'successGreen' },
              { id: 'medium', color: 'warningOrange' },
              { id: 'high', color: 'dangerRed' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all transform active:scale-95 ${
                  priority === p.id 
                    ? `bg-${p.color}/20 text-${p.color} border border-${p.color} shadow-[0_0_10px_currentColor]` 
                    : `bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10 hover:border-white/30`
                }`}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Hours Slider */}
        <div className="flex flex-col mt-2 p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Time Allocation Unit</label>
            <span className="text-sm font-bold text-electricBlue font-mono tracking-widest bg-electricBlue/10 px-2 py-0.5 rounded border border-electricBlue/30">{hours.toFixed(1)} HRS</span>
          </div>
          <input 
            type="range" 
            min="0.5" max="8" step="0.5" 
            value={hours} 
            onChange={(e) => setHours(parseFloat(e.target.value))}
            className="w-full accent-electricBlue cursor-pointer"
          />
        </div>

        {/* Alerts */}
        <div className="min-h-[40px]">
          <AnimatePresence>
            {successMsg && (
              <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="bg-successGreen/10 border border-successGreen text-successGreen text-xs p-3 rounded-xl font-mono tracking-wide shadow-glow-green">
                <span className="flex items-center gap-2 font-bold"><PlusCircle className="w-4 h-4"/> {successMsg}</span>
              </motion.div>
            )}
            {warningMsg && (
              <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="bg-dangerRed/10 border border-dangerRed text-dangerRed text-xs p-3 rounded-xl font-mono tracking-wide shadow-glow-red font-bold animate-pulse mt-2">
                {warningMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          type="submit" 
          disabled={loading || !empId || !title}
          className="glass-button bg-warningOrange/10 text-warningOrange hover:bg-warningOrange/20 hover:border-warningOrange hover:shadow-glow-orange w-full"
        >
          {loading ? "TRANSMITTING..." : "DEPLOY PROTOCOL"} 
        </button>
        
      </form>
    </div>
  );
}
