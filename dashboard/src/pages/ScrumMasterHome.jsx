import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/shared/Header';
import { ClipboardList, Users } from 'lucide-react';

export default function ScrumMasterHome() {
  const { id } = useParams();
  const navigate = useNavigate();

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full relative min-h-screen flex flex-col items-center pb-20">
      <Header title={id} subtitle="Scrum Commander Node" />

      <div className="w-full max-w-2xl px-6 flex flex-col items-center justify-center flex-1 gap-8 mt-10">
        
        <motion.div variants={itemVariants} className="text-center mb-6">
          <h2 className="text-4xl font-heading font-bold tracking-widest uppercase shadow-glow-purple text-white drop-shadow-[0_0_15px_rgba(181,0,255,0.8)]">Command Center</h2>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase mt-4">Select Directive Matrix</p>
        </motion.div>

        <motion.button 
          variants={itemVariants}
          onClick={() => navigate(`/scrum/${id}/assign`)}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-electricBlue to-[#0099FF] text-black font-bold font-heading text-2xl tracking-widest py-10 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.6)] hover:-translate-y-2 active:scale-[0.98] transition-all"
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            <ClipboardList className="w-8 h-8" /> 📋 Assign Task
          </span>
          <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-2xl transition-transform duration-500 opacity-0 group-active:opacity-100" />
        </motion.button>

        <motion.button 
          variants={itemVariants}
          onClick={() => navigate(`/scrum/${id}/employees`)}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-purpleAccent to-[#D000FF] text-white font-bold font-heading text-2xl tracking-widest py-10 rounded-2xl shadow-[0_0_30px_rgba(181,0,255,0.3)] hover:shadow-[0_0_50px_rgba(181,0,255,0.6)] hover:-translate-y-2 active:scale-[0.98] transition-all"
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            <Users className="w-8 h-8" /> 👥 Employee Details
          </span>
          <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-2xl transition-transform duration-500 opacity-0 group-active:opacity-100" />
        </motion.button>

      </div>
    </motion.div>
  );
}
