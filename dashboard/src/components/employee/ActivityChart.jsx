import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ActivityChart({ report }) {
  const breakdown = report?.category_breakdown || {};
  
  const rawData = Object.keys(breakdown).map(key => ({
    name: key,
    value: Math.round(breakdown[key] / 60)
  })).sort((a,b) => b.value - a.value);

  const data = rawData.length > 0 ? rawData : [
    { name: 'Coding', value: 120 },
    { name: 'Comms', value: 45 },
    { name: 'Browser', value: 30 }
  ];

  const colors = ['#00F0FF', '#B500FF', '#00FF66', '#FFB300', '#FF0055'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#05050A]/90 border border-[currentColor] p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md" style={{ borderColor: payload[0].payload.fill }}>
          <p className="font-bold text-white tracking-widest uppercase text-xs mb-1">{payload[0].payload.name}</p>
          <p className="text-xl font-mono font-bold" style={{ color: payload[0].payload.fill, textShadow: `0 0 10px ${payload[0].payload.fill}` }}>{payload[0].value} MIN</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card flex flex-col h-full bg-black/40 min-h-[300px] border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-t from-electricBlue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      
      <h2 className="text-xl font-heading font-medium tracking-[0.2em] mb-8 relative z-10 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="w-2 h-2 bg-electricBlue rounded-full shadow-glow-blue animate-pulse" /> TARGET ALLOCATION
      </h2>
      
      <div className="flex-grow w-full h-[250px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }} 
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
              {data.map((entry, index) => {
                const color = colors[index % colors.length];
                return <Cell key={`cell-${index}`} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
