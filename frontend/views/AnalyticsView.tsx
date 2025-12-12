import React from 'react';
import { Card } from '../components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';

const data = [
  { name: '1 Дек', reach: 4000, engagement: 2400 },
  { name: '5 Дек', reach: 3000, engagement: 1398 },
  { name: '10 Дек', reach: 2000, engagement: 9800 },
  { name: '15 Дек', reach: 2780, engagement: 3908 },
  { name: '20 Дек', reach: 1890, engagement: 4800 },
  { name: '25 Дек', reach: 2390, engagement: 3800 },
  { name: '30 Дек', reach: 3490, engagement: 4300 },
];

const platformData = [
  { name: 'Telegram', value: 45, fill: '#8b5cf6' }, // Violet
  { name: 'VK', value: 25, fill: '#3b82f6' }, // Blue
  { name: 'Insta', value: 20, fill: '#ec4899' }, // Pink
  { name: 'Linked', value: 10, fill: '#0ea5e9' }, // Sky
];

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Аналитика</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-base font-bold text-slate-800">Динамика охватов</h3>
             <select className="bg-white/50 border-none text-xs font-medium text-slate-600 rounded-md outline-none cursor-pointer">
               <option>За 30 дней</option>
               <option>За 7 дней</option>
             </select>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.3)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    color: '#1e293b',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="reach" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                <Area type="monotone" dataKey="engagement" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorEngage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-1 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4">Эффективность платформ</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(203, 213, 225, 0.3)"/>
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                 <Tooltip 
                    cursor={{fill: 'rgba(241, 245, 249, 0.4)'}} 
                    contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        backdropFilter: 'blur(4px)',
                        fontSize: '12px'
                    }}
                 />
                 <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors"></div>
             <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Лучшее время</div>
             <div className="text-lg font-bold text-slate-800 relative z-10">Вторник, 10:00</div>
          </Card>
          
          <Card className="p-4 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>
             <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Топ формат</div>
             <div className="text-lg font-bold text-slate-800 relative z-10">Видео (Reels)</div>
          </Card>
          
          <Card className="p-4 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors"></div>
             <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">ROI</div>
             <div className="text-lg font-bold text-slate-800 relative z-10">320%</div>
          </Card>
          
          <Card className="p-4 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500"></div>
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-fuchsia-500/10 rounded-full blur-xl group-hover:bg-fuchsia-500/20 transition-colors"></div>
             <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Экономия</div>
             <div className="text-lg font-bold text-slate-800 relative z-10">120 часов</div>
          </Card>
      </div>
    </div>
  );
};