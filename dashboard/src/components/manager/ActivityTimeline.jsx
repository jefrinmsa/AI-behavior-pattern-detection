import React from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ActivityTimeline({ historyData = [] }) {
  const data = historyData.length > 0 ? historyData : [
    { name: 'Day 1', activity: 0 },
    { name: 'Day 2', activity: 0 },
    { name: 'Day 3', activity: 0 },
    { name: 'Day 4', activity: 0 },
    { name: 'Day 5', activity: 0 },
    { name: 'Day 6', activity: 0 },
    { name: 'Day 7', activity: 0 }
  ];

  return (
    <div className="glass-card flex flex-col h-full bg-black/40 border-white/5 relative overflow-hidden group min-h-[250px]">
      
      <div className="flex justify-between items-center mb-6 relative z-10 border-b border-white/10 pb-4">
        <h2 className="text-xl font-heading font-medium tracking-[0.2em] flex items-center gap-3">
          <div className="w-2 h-2 bg-electricBlue rounded-full shadow-glow-blue" />
          NETWORK VOLUME
        </h2>
        <span className="text-[10px] uppercase font-bold text-electricBlue tracking-[0.3em] font-mono">Last 7 Cycles</span>
      </div>

      <div className="flex-grow w-full relative z-10 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#05050A', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,240,255,0.2)' }}
              itemStyle={{ color: '#00F0FF', fontWeight: 'bold', fontSize: '18px', textShadow: '0 0 10px #00F0FF' }}
              labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="activity" 
              stroke="#00F0FF" 
              strokeWidth={4} 
              dot={{ r: 4, strokeWidth: 2, fill: '#05050A', stroke: '#00F0FF' }} 
              activeDot={{ r: 8, strokeWidth: 2, fill: '#00F0FF', stroke: '#fff', style: { filter: 'drop-shadow(0 0 12px #00F0FF)' } }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-electricBlue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
}
