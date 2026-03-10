import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function CategoryBarChart({ report }) {
  const breakdown = report?.category_breakdown || {};
  
  // Need to map specific gradients to names based on requirements
  const getCategoryColor = (name) => {
    const n = name.toLowerCase();
    if (n.includes('cod')) return 'url(#blueGrad)';
    if (n.includes('comm')) return 'url(#purpleGrad)';
    if (n.includes('enter') || n.includes('yout') || n.includes('game')) return 'url(#redGrad)';
    if (n.includes('term') || n.includes('bash')) return 'url(#greenGrad)';
    return 'url(#greyGrad)';
  };

  const rawData = Object.keys(breakdown).map(key => ({
    name: key,
    value: Math.round(breakdown[key] / 60)
  })).sort((a,b) => b.value - a.value);

  const data = rawData.length > 0 ? rawData : [
    { name: 'Coding', value: 120 },
    { name: 'Terminal', value: 45 },
    { name: 'Other', value: 30 }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#05050A]/90 p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md border border-white/10">
          <p className="font-bold text-white tracking-widest uppercase text-xs mb-1">{payload[0].payload.name}</p>
          <p className="text-xl font-mono font-bold text-white">{payload[0].value} MIN</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card flex flex-col h-full bg-black/40 min-h-[350px] border-white/5 relative overflow-hidden group p-6 rounded-2xl w-full max-w-4xl mx-auto shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      <h2 className="text-xl font-heading font-medium tracking-[0.2em] mb-8 relative z-10 flex items-center gap-3 border-b border-white/10 pb-4">
        App Usage Today
      </h2>
      
      <div className="flex-grow w-full relative z-10" style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 50, left: 30, bottom: 0 }}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4F9CF9" stopOpacity={0.8}/><stop offset="100%" stopColor="#00F0FF" stopOpacity={1}/></linearGradient>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/><stop offset="100%" stopColor="#B500FF" stopOpacity={1}/></linearGradient>
              <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.8}/><stop offset="100%" stopColor="#FF0055" stopOpacity={1}/></linearGradient>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/><stop offset="100%" stopColor="#00FF66" stopOpacity={1}/></linearGradient>
              <linearGradient id="greyGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6B7280" stopOpacity={0.8}/><stop offset="100%" stopColor="#9CA3AF" stopOpacity={1}/></linearGradient>
            </defs>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' }} 
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
              ))}
              <LabelList dataKey="value" position="right" fill="#fff" fontSize={12} fontFamily="monospace" formatter={(val) => `${val}m`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
