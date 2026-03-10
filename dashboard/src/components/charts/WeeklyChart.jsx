import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function WeeklyChart({ historyData = [] }) {
  const getFallbackData = () => {
    const arr = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push({ name: days[d.getDay()], score: 0, date: d.toISOString().split('T')[0] });
    }
    return arr;
  };

  const data = historyData.length > 0 ? historyData : getFallbackData();

  // Assuming the final item in the array or the one matching "Day 0" is today.
  // The backend history returns Days [today-6, ..., today]
  const todayIndex = data.length - 1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#05050A]/90 p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md border border-white/10">
          <p className="font-bold text-white tracking-widest uppercase text-xs mb-1">
            {payload[0].payload.name} {payload[0].payload.date ? `- ${payload[0].payload.date}` : ''}
          </p>
          <p className="text-xl font-mono font-bold text-white">{payload[0].value}% Productivity</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card flex flex-col h-full bg-black/40 min-h-[350px] border-white/5 relative overflow-hidden group p-6 rounded-2xl w-full max-w-4xl mx-auto shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      <h2 className="text-xl font-heading font-medium tracking-[0.2em] mb-8 relative z-10 flex items-center gap-3 border-b border-white/10 pb-4">
        This Week's Productivity
      </h2>

      <div className="flex-grow w-full h-[250px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00F0FF" stopOpacity={1}/><stop offset="100%" stopColor="#4F9CF9" stopOpacity={0.3}/></linearGradient>
              <linearGradient id="otherGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B500FF" stopOpacity={1}/><stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3}/></linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={({ x, y, payload }) => {
                const item = data.find(d => d.name === payload.value);
                const hasDate = item && item.date;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={16} textAnchor="middle" fill="#9CA3AF" fontSize={12} fontWeight="bold" fontFamily="monospace">
                      {payload.value}
                    </text>
                    {hasDate && (
                      <text x={0} y={0} dy={32} textAnchor="middle" fill="#6B7280" fontSize={10} fontFamily="monospace">
                        {item.date}
                      </text>
                    )}
                  </g>
                );
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
            <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === todayIndex ? 'url(#todayGrad)' : 'url(#otherGrad)'} 
                  style={{ filter: index === todayIndex ? 'drop-shadow(0 0 10px rgba(0,240,255,0.5))' : 'drop-shadow(0 0 10px rgba(181,0,255,0.5))' }}
                />
              ))}
              <LabelList dataKey="score" position="top" fill="#fff" fontSize={12} fontFamily="monospace" formatter={(val) => `${val}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
