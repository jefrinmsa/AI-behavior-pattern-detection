import React from 'react';
import { motion } from 'framer-motion';

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020205]">
      
      {/* Dynamic Floating Orbs */}
      <motion.div 
        animate={{ 
          x: [0, 100, -100, 0],
          y: [0, 50, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-electricBlue/15 blur-[120px] mix-blend-screen" 
      />
      <motion.div 
        animate={{ 
          x: [0, -150, 150, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.4, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-purpleAccent/15 blur-[120px] mix-blend-screen" 
      />
      <motion.div 
        animate={{ 
          x: [0, 200, -200, 0],
          y: [0, 150, -150, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-dangerRed/10 blur-[120px] mix-blend-screen" 
      />
      
      {/* High-tech grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.07]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
        }}
      />
      
      {/* Heavy Edge Vignette for theatrical lighting */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, #05050A 110%)'
        }}
      />
      
    </div>
  );
}
