import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchEmployeeGoals } from '../../api';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function WorkloadMeter({ teamMembers }) {
  const [workloads, setWorkloads] = useState([]);

  useEffect(() => {
    const fetchLoads = async () => {
      if (!teamMembers) return;
      const promises = teamMembers.map(m => fetchEmployeeGoals(m.emp_id).then(res => {
        const goals = res.goals || [];
        const pending = goals.filter(g => g.status === 'pending');
        const activeHours = pending.reduce((sum, g) => sum + (parseFloat(g.estimated_hours) || 0), 0);
        return { emp_id: m.emp_id, name: m.name, hours: activeHours };
      }));
      
      const results = await Promise.all(promises);
      setWorkloads(results.sort((a,b) => b.hours - a.hours));
    };
    
    fetchLoads();
    const inv = setInterval(fetchLoads, 30000);
    return () => clearInterval(inv);
  }, [teamMembers]);

  return (
    <div className="glass-card bg-black/40 flex-1 flex flex-col">
      <h2 className="text-lg font-heading font-medium tracking-wide mb-4 flex items-center gap-2">
        CAPACITY METER
      </h2>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
        {workloads.map(w => {
          const ratio = Math.min((w.hours / 8.0) * 100, 100);
          
          let color = "bg-successGreen";
          let textColor = "text-successGreen";
          let alertMsg = null;
          
          if (w.hours >= 8) {
            color = "bg-dangerRed";
            textColor = "text-dangerRed";
            alertMsg = <span className="text-[10px] flex items-center gap-1 text-dangerRed font-bold"><AlertTriangle className="w-3 h-3"/> OVERLOADED</span>;
          } else if (w.hours >= 6) {
            color = "bg-warningOrange";
            textColor = "text-warningOrange";
          } else if (w.hours === 0) {
            alertMsg = <span className="text-[10px] flex items-center gap-1 text-gray-500 font-bold"><CheckCircle2 className="w-3 h-3"/> EMPTY SPRINT</span>;
          }
          
          return (
            <div key={w.emp_id} className="flex flex-col gap-1 w-full bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>{w.name}</span>
                <span className={textColor}>{w.hours.toFixed(1)}h / 8.0h</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden my-1">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${ratio}%` }} 
                  className={`h-full ${color}`} 
                  transition={{ duration: 1 }}
                />
              </div>
              {alertMsg && <div className="mt-1">{alertMsg}</div>}
            </div>
          );
        })}
        {workloads.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No capacity data.</p>}
      </div>
    </div>
  );
}
