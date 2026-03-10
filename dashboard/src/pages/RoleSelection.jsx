import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit"
      className="flex-1 w-full flex flex-col items-center justify-center p-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col items-center mb-16">
        <div className="flex items-center gap-3 text-electricBlue mb-2">
          <Activity className="w-12 h-12" />
          <h1 className="text-5xl font-heading font-bold tracking-widest uppercase drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">WorkSense</h1>
        </div>
        <p className="font-mono text-gray-400 tracking-widest uppercase text-sm">Neural Link Establishment</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        
        {/* Employee Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/employee/login')}
          className="glass-card flex flex-col items-center p-12 bg-black/40 border-white/5 hover:border-electricBlue/50 hover:bg-electricBlue/5 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] transition-all duration-500 rounded-2xl group w-full relative overflow-hidden"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-electricBlue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <span className="text-7xl mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] group-hover:drop-shadow-[0_0_30px_rgba(0,240,255,0.8)] transition-all">👤</span>
          <h2 className="text-3xl font-heading font-bold text-white mb-2 tracking-wider group-hover:text-electricBlue transition-colors">Employee</h2>
          <p className="text-gray-400 font-mono text-sm text-center">View your goals and productivity</p>
        </motion.button>

        {/* Scrum Master Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/scrum/login')}
          className="glass-card flex flex-col items-center p-12 bg-black/40 border-white/5 hover:border-purpleAccent/50 hover:bg-purpleAccent/5 hover:shadow-[0_0_40px_rgba(181,0,255,0.15)] transition-all duration-500 rounded-2xl group w-full relative overflow-hidden"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-purpleAccent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <span className="text-7xl mb-6 drop-shadow-[0_0_15px_rgba(181,0,255,0.5)] group-hover:drop-shadow-[0_0_30px_rgba(181,0,255,0.8)] transition-all">🧑‍💼</span>
          <h2 className="text-3xl font-heading font-bold text-white mb-2 tracking-wider group-hover:text-purpleAccent transition-colors">Scrum Master</h2>
          <p className="text-gray-400 font-mono text-sm text-center">Manage your team</p>
        </motion.button>

      </div>
    </motion.div>
  );
}
