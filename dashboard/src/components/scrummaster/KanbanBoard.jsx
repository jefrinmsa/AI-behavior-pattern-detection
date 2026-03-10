import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchEmployeeGoals, completeGoal } from '../../api';
import { Clock, CheckCircle2, Terminal } from 'lucide-react';

export default function KanbanBoard({ teamMembers, onGoalUpdated }) {
  const [allGoals, setAllGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBoard = async () => {
    try {
      if (!teamMembers || teamMembers.length === 0) return;
      
      const promises = teamMembers.map(m => fetchEmployeeGoals(m.emp_id).then(res => ({
        emp_id: m.emp_id,
        name: m.name,
        goals: res.goals || []
      })));
      
      const results = await Promise.all(promises);
      let combined = [];
      results.forEach(r => {
        r.goals.forEach(g => {
          combined.push({ ...g, emp_id: r.emp_id, emp_name: r.name });
        });
      });
      setAllGoals(combined);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
    const inv = setInterval(fetchBoard, 30000);
    return () => clearInterval(inv);
  }, [teamMembers]);

  const handleComplete = async (empId, goalId) => {
    try {
      await completeGoal(empId, goalId);
      await fetchBoard();
      onGoalUpdated();
    } catch (e) { console.error(e); }
  };

  const pending = allGoals.filter(g => g.status === 'pending');
  // API currently doesn't delineate 'In Progress', mapping visually
  const completed = allGoals.filter(g => g.status === 'completed');

  if (loading) {
     return <div className="h-full flex items-center justify-center border border-white/5 rounded-3xl bg-black/40 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"><div className="w-12 h-12 border-4 border-warningOrange border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,179,0,0.5)]" /></div>;
  }

  const Column = ({ title, items, color, bgCore, canComplete }) => (
    <div className={`flex-1 flex flex-col bg-[#05050A]/60 border border-white/5 rounded-3xl overflow-hidden h-full shadow-lg relative group ${bgCore}`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      
      <div className={`p-5 border-b border-white/5 bg-black/50 flex justify-between items-center backdrop-blur-md`}>
        <h3 className={`font-bold uppercase tracking-[0.2em] text-${color} text-sm flex items-center gap-2`}>
           <Terminal className="w-4 h-4 opacity-70" />
           {title}
        </h3>
        <span className={`bg-${color}/10 border border-${color}/30 text-${color} px-3 py-1 rounded-lg text-xs font-bold font-mono shadow-[0_0_10px_currentColor] drop-shadow-md`}>
           {items.length.toString().padStart(2, '0')}
        </span>
      </div>
      
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar relative z-10">
        <AnimatePresence>
          {items.map(g => {
             let baseGlow = "hover:border-successGreen hover:shadow-[0_0_20px_rgba(0,255,102,0.3)]";
             if (g.priority === 'medium') baseGlow = "hover:border-warningOrange hover:shadow-[0_0_20px_rgba(255,179,0,0.3)]";
             if (g.priority === 'high') baseGlow = "hover:border-dangerRed hover:shadow-[0_0_20px_rgba(255,0,85,0.3)]";
             if (!canComplete) baseGlow = "hover:border-white/20";

             return (
              <motion.div 
                key={`${g.emp_id}-${g.id}`}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group/card bg-[#0A0A12] border-white/10 ${baseGlow}`}
              >
                {/* Visual priority tab */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    g.priority === 'high' ? 'bg-dangerRed shadow-[0_0_10px_#FF0055]' : 
                    g.priority === 'medium' ? 'bg-warningOrange shadow-[0_0_10px_#FFB300]' : 
                    'bg-successGreen shadow-[0_0_10px_#00FF66]'
                } ${!canComplete && 'grayscale opacity-50'}`} />

                <div className="flex justify-between items-start ml-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center text-[10px] font-bold shadow-inner">
                      {g.emp_name.substring(0,2).toUpperCase()}
                    </div>
                    <span className="text-xs text-white uppercase font-bold tracking-wider">{g.emp_name}</span>
                  </div>
                  {canComplete && (
                    <button onClick={() => handleComplete(g.emp_id, g.id)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-successGreen/20 hover:border-successGreen hover:shadow-glow-green hover:text-successGreen transition-all transform active:scale-90">
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <h4 className={`text-sm font-bold ml-2 mt-1 tracking-wide leading-relaxed ${!canComplete ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                   {g.title}
                </h4>
                
                <div className="flex items-center gap-3 mt-2 ml-2 bg-black/40 p-2 rounded-lg border border-white/5 w-fit">
                   {canComplete ? (
                      <span className="text-[10px] text-electricBlue flex items-center gap-1.5 font-mono tracking-widest font-bold">
                        <Clock className="w-3.5 h-3.5" /> {g.estimated_hours} HRS
                      </span>
                   ) : (
                      <span className="text-[10px] text-successGreen flex items-center gap-1.5 font-mono tracking-widest font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> END {g.time_taken_min} M
                      </span>
                   )}
                </div>
              </motion.div>
             )
          })}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-600 text-xs font-bold font-mono tracking-[0.2em] italic py-20 px-4 text-center">
            [ CONTAINER_EMPTY ]
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 h-full p-2">
      <Column title="Assigned Queue" items={pending} color="white" bgCore="hover:border-white/10" canComplete={true} />
      {/* Visual spacer block for "In Progress" in standard Agile setups */}
      <Column title="Active Processing" items={[]} color="electricBlue" bgCore="border-electricBlue/20 shadow-[0_0_30px_rgba(0,240,255,0.02)]" canComplete={false} />
      <Column title="Validated Sieve" items={completed} color="successGreen" bgCore="border-successGreen/20 shadow-[0_0_30px_rgba(0,255,102,0.02)]" canComplete={false} />
    </div>
  );
}
