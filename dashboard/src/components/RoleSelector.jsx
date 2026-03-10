import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Users } from 'lucide-react';
import { fetchEmployees } from '../api';

export default function RoleSelector({ onSelect }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [empId, setEmpId] = useState("");
  const [error, setError] = useState("");

  const handleRoleClick = (r) => {
    setSelectedRole(r);
    setError("");
    if (r === 'manager' || r === 'scrummaster') {
      onSelect(r, "mgr_001"); 
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!empId.trim()) {
      setError("Identification override required.");
      return;
    }
    
    try {
      const data = await fetchEmployees();
      const validIds = data.employees?.map(em => em.id) || [];
      if (validIds.includes(empId.trim())) {
        onSelect('employee', empId.trim());
      } else {
        onSelect('employee', empId.trim());
      }
    } catch (err) {
      onSelect('employee', empId.trim());
    }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVars = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] relative z-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-16 text-center"
      >
        <span className="text-electricBlue uppercase tracking-[0.3em] text-xs font-bold block mb-4">Secure Authentication Grid</span>
        <h1 className="text-6xl md:text-8xl font-heading font-bold mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-electricBlue to-purpleAccent drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">
          WorkSense.
        </h1>
        <p className="text-gray-300 text-lg font-medium tracking-wide">Select your neural portal to establish connection</p>
      </motion.div>

      {!selectedRole ? (
        <motion.div 
          variants={containerVars} 
          initial="hidden" 
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4"
        >
          {/* Employee */}
          <motion.div variants={cardVars} onClick={() => handleRoleClick('employee')} className="glass-card cursor-pointer group flex flex-col items-center text-center p-12 hover:border-electricBlue shadow-glow-blue border-white/5">
            <div className="w-24 h-24 rounded-full bg-electricBlue/10 border border-electricBlue/20 flex items-center justify-center mb-8 relative group-hover:scale-110 group-hover:bg-electricBlue/20 transition-all duration-500 shadow-glow-blue">
              <div className="absolute inset-0 rounded-full border border-electricBlue animate-ping opacity-20 group-hover:opacity-50" style={{ animationDuration: '3s' }} />
              <User className="w-12 h-12 text-electricBlue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] group-hover:animate-pulse" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-3 text-glow-blue">Employee Interface</h2>
            <p className="text-sm text-gray-400 font-medium my-auto leading-relaxed">Access personal telemetry, active sprint objectives, and capacity modules.</p>
            <div className="mt-6 uppercase tracking-widest text-[10px] text-electricBlue font-bold bg-electricBlue/10 px-3 py-1 rounded-full border border-electricBlue/20 group-hover:bg-electricBlue group-hover:text-black transition-colors">
              Access Matrix
            </div>
          </motion.div>

          {/* Manager */}
          <motion.div variants={cardVars} onClick={() => handleRoleClick('manager')} className="glass-card cursor-pointer group flex flex-col items-center text-center p-12 hover:border-dangerRed shadow-glow-red border-white/5">
            <div className="w-24 h-24 rounded-full bg-dangerRed/10 border border-dangerRed/20 flex items-center justify-center mb-8 relative group-hover:scale-110 group-hover:bg-dangerRed/20 transition-all duration-500 shadow-glow-red">
               <div className="absolute inset-0 rounded-full border border-dangerRed animate-ping opacity-20 group-hover:opacity-50" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
              <Briefcase className="w-12 h-12 text-dangerRed drop-shadow-[0_0_8px_rgba(255,0,85,0.8)] group-hover:animate-pulse" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-3 text-glow-red">Manager Console</h2>
            <p className="text-sm text-gray-400 font-medium my-auto leading-relaxed">Initialize global team oversight, AI burnout diagnostics, and performance indices.</p>
            <div className="mt-6 uppercase tracking-widest text-[10px] text-dangerRed font-bold bg-dangerRed/10 px-3 py-1 rounded-full border border-dangerRed/20 group-hover:bg-dangerRed group-hover:text-black transition-colors">
              Admin Override
            </div>
          </motion.div>

          {/* Scrum Master */}
          <motion.div variants={cardVars} onClick={() => handleRoleClick('scrummaster')} className="glass-card cursor-pointer group flex flex-col items-center text-center p-12 hover:border-warningOrange shadow-glow-orange border-white/5">
            <div className="w-24 h-24 rounded-full bg-warningOrange/10 border border-warningOrange/20 flex items-center justify-center mb-8 relative group-hover:scale-110 group-hover:bg-warningOrange/20 transition-all duration-500 shadow-glow-orange">
               <div className="absolute inset-0 rounded-full border border-warningOrange animate-ping opacity-20 group-hover:opacity-50" style={{ animationDuration: '3s', animationDelay: '1s' }} />
              <Users className="w-12 h-12 text-warningOrange drop-shadow-[0_0_8px_rgba(255,179,0,0.8)] group-hover:animate-pulse" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-3 text-glow-orange">Agile Director</h2>
            <p className="text-sm text-gray-400 font-medium my-auto leading-relaxed">Provision sprint objectives, monitor capacity bounds, and orchestrate Kanban arrays.</p>
            <div className="mt-6 uppercase tracking-widest text-[10px] text-warningOrange font-bold bg-warningOrange/10 px-3 py-1 rounded-full border border-warningOrange/20 group-hover:bg-warningOrange group-hover:text-black transition-colors">
              Deploy Directives
            </div>
          </motion.div>

        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card w-full max-w-md p-10 shadow-glow-blue border-electricBlue/30"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="p-3 bg-electricBlue/20 rounded-xl shadow-glow-blue">
              <User className="text-electricBlue w-8 h-8 drop-shadow-[0_0_5px_rgba(0,240,255,1)]" />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold text-glow-blue tracking-wide">Auth Matrix</h2>
              <span className="text-xs text-electricBlue uppercase font-bold tracking-widest opacity-80">Employee Subsystem</span>
            </div>
          </div>
          
          <form onSubmit={handleJoin} className="flex flex-col gap-6">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest block">Neural ID Input</label>
              <input 
                type="text" 
                autoFocus
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="e.g. emp_001" 
                className="w-full bg-[#020205]/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-mono focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all shadow-inner"
              />
              {error && <p className="text-dangerRed text-sm mt-3 font-bold flex items-center gap-1">⚠️ {error}</p>}
            </div>
            
            <button type="submit" className="glass-button w-full text-electricBlue hover:text-white hover:border-electricBlue mt-2 hover:shadow-glow-blue text-lg">
              Initialize Connection
            </button>
            
            <button type="button" onClick={() => setSelectedRole(null)} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-electricBlue mt-4 transition-colors text-center w-full">
              [ Terminate & Return to Grid ]
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
