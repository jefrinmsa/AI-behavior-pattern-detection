import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';

export default function ScrumMasterLogin() {
  const navigate = useNavigate();
  const [smId, setSmId] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!smId.trim()) return;

    setLoading(true);
    setError(false);
    
    // Simulating Scrum Master Verification (Assuming any valid string for now, or match specific backend logic if needed)
    // The previous implementation jumped straight in, but we can fake a delay
    setTimeout(() => {
      if (smId.trim().length > 2) {
        navigate(`/scrum/${smId.trim()}`);
      } else {
        setError(true);
        setLoading(false);
      }
    }, 600);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex-1 w-full flex flex-col relative min-h-screen">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all z-20 group"
      >
        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="flex-1 flex flex-col justify-center items-center p-6 w-full max-w-md mx-auto z-10">
        
        <div className="flex flex-col items-center mb-10 w-full">
          <Activity className="w-10 h-10 text-purpleAccent mb-4 drop-shadow-[0_0_10px_rgba(181,0,255,0.8)]" />
          <h1 className="text-4xl font-heading font-bold text-white mb-2 text-center">Scrum Master Login</h1>
          <p className="text-gray-400 font-mono text-sm text-center">Enter your Scrum Master ID to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
            <input
              type="text"
              value={smId}
              onChange={(e) => { setSmId(e.target.value); setError(false); }}
              placeholder="Enter Scrum Master ID e.g. sm_001"
              className={`w-full bg-[#05050A]/80 border ${error ? 'border-dangerRed shadow-[0_0_15px_rgba(255,0,85,0.3)]' : 'border-white/10 hover:border-purpleAccent/50 focus:border-purpleAccent focus:shadow-[0_0_20px_rgba(181,0,255,0.2)]'} rounded-xl px-6 py-4 text-white font-mono placeholder-gray-600 outline-none transition-all`}
              autoFocus
            />
            {error && (
              <p className="text-dangerRed font-mono text-xs mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-dangerRed animate-ping" />
                Invalid ID. Please check and try again.
              </p>
            )}
          </motion.div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-purpleAccent to-[#D000FF] text-white font-bold font-heading text-lg tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(181,0,255,0.4)] hover:shadow-[0_0_30px_rgba(181,0,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'AUTHENTICATING...' : "Let's Go \u2192"}
            </span>
            <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-xl transition-transform duration-300 opacity-0 group-active:opacity-100" />
          </button>
        </form>

      </div>
    </motion.div>
  );
}
