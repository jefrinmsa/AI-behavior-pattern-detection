import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import api, { fetchEmployees, fetchEmployeeGoals, assignGoal } from '../api';

export default function AssignTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [workloads, setWorkloads] = useState({});
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [estHours, setEstHours] = useState(2.0);
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadOps = async () => {
      try {
        const data = await fetchEmployees();
        const emps = data.employees || [];
        setEmployees(emps);

        // Fetch current workloads
        const wLoads = {};
        for (const e of emps) {
          const gData = await fetchEmployeeGoals(e.id).catch(() => ({ goals: [] }));
          let totalEst = 0;
          if (gData.goals) {
            totalEst = gData.goals.filter(g => g.status === 'pending' || g.status === 'in_progress').reduce((acc, g) => acc + (parseFloat(g.estimated_hours) || 0), 0);
          }
          wLoads[e.id] = totalEst;
        }
        setWorkloads(wLoads);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    loadOps();
  }, []);

  const handleAssign = async () => {
    if (!selectedEmp || !taskName.trim()) return;
    setAssigning(true);
    try {
      await assignGoal(selectedEmp.id, {
        title: taskName,
        priority: priority.toLowerCase(),
        estimated_hours: estHours
      });
      
      setSuccessMsg(`Task assigned to ${selectedEmp.name}! ✅`);
      
      // Update local workload
      setWorkloads(prev => ({
        ...prev,
        [selectedEmp.id]: (prev[selectedEmp.id] || 0) + estHours
      }));

      // Reset form
      setTaskName('');
      setPriority('Medium');
      setEstHours(2.0);
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const getBarColor = (hrs) => {
    if (hrs >= 8) return 'bg-dangerRed shadow-glow-red';
    if (hrs >= 6) return 'bg-warningOrange shadow-[0_0_10px_rgba(245,158,11,0.8)]';
    return 'bg-successGreen shadow-glow-green';
  };

  if (loading) return null;

  const currentLoad = selectedEmp ? (workloads[selectedEmp.id] || 0) : 0;
  const newTotal = currentLoad + estHours;
  const isOverloaded = newTotal > 8;

  return (
    <div className="w-full relative min-h-screen flex flex-col items-center pb-20 pt-6">
      
      <div className="w-full max-w-4xl px-6 mb-8 flex flex-col gap-4 relative z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/scrum/${id}`)}
            className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-3xl font-heading font-bold text-white tracking-widest uppercase">Assign Task</h1>
        </div>
      </div>

      <div className="w-full max-w-4xl px-6 flex flex-col gap-10 relative z-10">
        
        {/* STEP 1 */}
        <div className="flex flex-col gap-4">
          <h2 className="font-heading font-medium tracking-[0.2em] text-gray-400 border-b border-white/10 pb-2 flex items-center gap-3">
             <span className="w-6 h-6 rounded bg-electricBlue text-black flex items-center justify-center font-bold text-xs">1</span>
             SELECT EMPLOYEE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => {
              const wl = workloads[emp.id] || 0;
              const isSelected = selectedEmp?.id === emp.id;
              
              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmp(emp)}
                  className={`glass-card p-4 rounded-xl text-left border transition-all flex flex-col gap-3 group relative overflow-hidden
                    ${isSelected ? 'bg-electricBlue/10 border-electricBlue shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                >
                  {isSelected && <CheckCircle2 className="absolute top-4 right-4 text-electricBlue w-5 h-5 shadow-glow-blue" />}
                  
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center font-heading font-bold uppercase text-gray-300 group-hover:text-white transition-colors">
                      {emp.name.substring(0,2)}
                    </div>
                    <div className="flex justify-between w-full">
                       <span className="font-bold text-white">{emp.name}</span>
                       <span className="text-xs font-mono text-gray-500">{wl}h today</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${getBarColor(wl)} transition-all`} style={{ width: `${Math.min(100, (wl/8)*100)}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2 & 3 */}
        <AnimatePresence>
          {selectedEmp && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 w-full border border-white/10 bg-black/40 p-8 rounded-2xl glass-card">
              
              <h2 className="font-heading font-medium tracking-[0.2em] text-gray-400 pb-2 flex items-center gap-3">
                 <span className="w-6 h-6 rounded bg-purpleAccent text-white flex items-center justify-center font-bold text-xs">2</span>
                 TASK DETAILS
              </h2>

              <div className="flex flex-col gap-6">
                
                <div>
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 block">Task Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter task name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full bg-[#05050A]/80 border border-white/10 hover:border-purpleAccent/50 focus:border-purpleAccent focus:shadow-[0_0_15px_rgba(181,0,255,0.3)] rounded-xl px-4 py-3 text-white font-mono outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 block">Priority</label>
                  <div className="grid grid-cols-3 gap-3">
                     {['High', 'Medium', 'Low'].map(p => {
                       const active = priority === p;
                       const c = p==='High'?'dangerRed':p==='Medium'?'warningOrange':'successGreen';
                       const cShadow = p==='High'?'shadow-[0_0_15px_rgba(239,68,68,0.5)]':p==='Medium'?'shadow-[0_0_15px_rgba(245,158,11,0.5)]':'shadow-[0_0_15px_rgba(16,185,129,0.5)]';
                       return (
                         <button 
                           key={p} 
                           onClick={() => setPriority(p)}
                           className={`py-2 rounded-lg font-bold tracking-widest uppercase text-xs transition-all border
                             ${active ? `bg-${c}/20 border-${c} text-${c} ${cShadow}` : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/30'}`}
                         >
                           {p==='High'?'🔴':p==='Medium'?'🟡':'🟢'} {p}
                         </button>
                       )
                     })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 flex justify-between">
                    <span>Estimated Time</span>
                    <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">{estHours} hours</span>
                  </label>
                  <input
                    type="range"
                    min="0.5" max="8" step="0.5"
                    value={estHours}
                    onChange={(e) => setEstHours(parseFloat(e.target.value))}
                    className="w-full accent-purpleAccent h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>

              {/* STEP 3 */}
              <div className="flex flex-col gap-4 mt-4 border-t border-white/10 pt-8">
                <h2 className="font-heading font-medium tracking-[0.2em] text-gray-400 pb-2 flex items-center gap-3">
                   <span className="w-6 h-6 rounded bg-successGreen text-black flex items-center justify-center font-bold text-xs">3</span>
                   WORKLOAD CHECK
                </h2>

                <div className="bg-black/60 border border-white/5 p-4 rounded-xl flex flex-col gap-4">
                   <div className="flex justify-between font-mono text-sm">
                      <span className="text-gray-400">Current: {currentLoad}h</span>
                      <span className="text-purpleAccent">Adding: +{estHours}h</span>
                      <span className={`font-bold ${isOverloaded ? 'text-dangerRed' : 'text-white'}`}>Total: {newTotal}h</span>
                   </div>

                   <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-gray-500" style={{ width: `${Math.min(100, (currentLoad/8)*100)}%` }} />
                      <div className={`h-full ${isOverloaded ? 'bg-dangerRed' : 'bg-purpleAccent shadow-glow-purple'} transition-all`} style={{ width: `${Math.min(100, (estHours/8)*100)}%` }} />
                   </div>
                   <div className="text-right text-xs font-mono font-bold tracking-widest uppercase text-gray-500">{newTotal}h / 8h</div>

                   {isOverloaded && (
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="border border-dangerRed bg-dangerRed/10 rounded-xl p-4 mt-2 shadow-glow-red">
                       <h4 className="text-dangerRed font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2">
                         ⚠️ TASK OVERLOAD!
                       </h4>
                       <p className="text-gray-300 font-mono text-xs">Reduce tasks before assigning. This employee already has {currentLoad}h assigned today.</p>
                     </motion.div>
                   )}
                </div>

                {successMsg && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-successGreen font-bold font-mono tracking-widest shadow-glow-green bg-successGreen/10 py-3 rounded-lg border border-successGreen/30">
                    {successMsg}
                  </motion.div>
                )}

                <button 
                  disabled={isOverloaded || assigning || !taskName.trim()}
                  onClick={handleAssign}
                  className={`w-full font-bold font-heading text-xl tracking-widest py-4 rounded-xl uppercase transition-all mt-4
                    ${isOverloaded || !taskName.trim() 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
                      : 'bg-gradient-to-r from-electricBlue to-[#0099FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:-translate-y-1'}`}
                >
                  {assigning ? 'UPLOADING DIRECTIVE...' : '✅ Assign Task'}
                </button>

              </div>
              
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
