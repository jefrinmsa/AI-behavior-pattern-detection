import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeekChart({ historyData = [] }) {
  const data = historyData.length > 0 ? historyData : [
    { name: 'Mon', score: 0 },
    { name: 'Tue', score: 0 },
    { name: 'Wed', score: 0 },
    { name: 'Thu', score: 0 },
    { name: 'Fri', score: 0 },
    { name: 'Sat', score: 0 },
    { name: 'Sun', score: 0 }
  ];

  return (
    <div className="glass-card flex flex-col h-full bg-black/40 min-h-[300px] border-white/5 relative overflow-hidden">
      
      <div className="flex justify-between items-center mb-8 relative z-10 border-b border-white/10 pb-4">
        <h2 className="text-xl font-heading font-medium tracking-[0.2em] flex items-center gap-3">
          <div className="w-2 h-2 bg-purpleAccent rounded-full shadow-glow-purple" />
          7-DAY TRAJECTORY
        </h2>
        <span className="text-[10px] font-bold bg-[#B500FF]/20 text-purpleAccent px-3 py-1.5 rounded-lg flex items-center gap-2 border border-purpleAccent/50 shadow-glow-purple font-mono tracking-widest">
          ⚡ 3 DAY STREAK
        </span>
      </div>

      <div className="flex-grow w-full h-[200px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B500FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#05050A', border: '1px solid rgba(181,0,255,0.3)', borderRadius: '12px', boxShadow: '0 0 20px rgba(181,0,255,0.2)' }}
              itemStyle={{ color: '#00F0FF', fontWeight: 'bold', fontSize: '18px', textShadow: '0 0 10px #00F0FF' }}
              labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="score" stroke="#B500FF" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff', fill: '#00F0FF', style: { filter: 'drop-shadow(0 0 10px #00F0FF)' } }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
