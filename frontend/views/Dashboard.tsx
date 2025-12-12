import React from 'react';
import { Card, Badge } from '../components/ui';
import { TrendingUp, Users, FileText, CheckCircle, ArrowRight, Zap, PenTool } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.ReactNode; isPositive?: boolean; color: string }> = ({ title, value, trend, icon, isPositive = true, color }) => (
  <Card className="p-5 transition-all hover:-translate-y-1 hover:shadow-lg duration-300 group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-600 transition-colors uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl text-white shadow-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
    <div className="mt-3 flex items-center text-xs">
      <span className={`px-2 py-0.5 rounded-md font-bold ${isPositive ? "text-emerald-700 bg-emerald-100/60" : "text-rose-700 bg-rose-100/60"}`}>
        {trend}
      </span>
      <span className="text-slate-400 ml-2 font-medium">с прошлого месяца</span>
    </div>
  </Card>
);

const ActivityItem: React.FC<{ title: string; time: string; status: string }> = ({ title, time, status }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100/50 last:border-0 hover:bg-white/40 -mx-5 px-5 transition-all duration-200 group">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] shadow-md border border-white/20 group-hover:scale-105 transition-transform">
        AI
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{title}</h4>
        <p className="text-[10px] text-slate-500">{time}</p>
      </div>
    </div>
    <Badge variant={status === 'Опубликовано' ? 'success' : 'neutral'}>{status}</Badge>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 tracking-tight pb-1">Dashboard</h1>
          <p className="text-slate-500 text-sm">Обзор активности за последние 30 дней</p>
        </div>
        <div className="text-xs text-indigo-900/70 font-semibold px-3 py-1.5 bg-indigo-50/50 rounded-lg border border-indigo-100/50 backdrop-blur-sm shadow-sm flex items-center gap-2">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
           Live Update
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Общий охват" 
          value="127.5K" 
          trend="+12.5%" 
          icon={<Users size={18} />} 
          color="bg-gradient-to-br from-blue-500 to-cyan-500 shadow-cyan-500/30"
        />
        <StatCard 
          title="Вовлеченность" 
          value="4.2%" 
          trend="+0.8%" 
          icon={<TrendingUp size={18} />} 
          color="bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-fuchsia-500/30"
        />
        <StatCard 
          title="Всего постов" 
          value="143" 
          trend="+24" 
          icon={<FileText size={18} />} 
          color="bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30"
        />
        <StatCard 
          title="Успешные публикации" 
          value="98%" 
          trend="+1.2%" 
          icon={<CheckCircle size={18} />} 
          color="bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Последняя активность</h3>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center hover:bg-indigo-50/50 px-2 py-1 rounded-md transition-colors">
                Все действия <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="space-y-1">
              <ActivityItem title="Запуск продукта Alpha" time="2 часа назад" status="Опубликовано" />
              <ActivityItem title="Интервью с CTO" time="5 часов назад" status="Черновик" />
              <ActivityItem title="Квартальный отчет Q3" time="Вчера, 14:30" status="Запланировано" />
              <ActivityItem title="Партнерство с BigTech" time="Вчера, 10:15" status="Опубликовано" />
              <ActivityItem title="Новый офис в Дубае" time="8 дек" status="Опубликовано" />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 h-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white border-0 relative overflow-hidden group shadow-xl shadow-indigo-900/20">
            {/* Decor blob for card */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/30 rounded-full blur-3xl pointer-events-none group-hover:bg-fuchsia-500/40 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center gap-1.5 mb-3 text-indigo-100 text-xs font-semibold tracking-wide uppercase">
              <Zap size={14} className="text-yellow-300" />
              Быстрый старт
            </div>
            
            <p className="text-white/90 mb-6 text-sm relative z-10 leading-relaxed font-light">
              Создайте контент-план из одной новости за 2 минуты.
            </p>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md mb-6 border border-white/20 relative z-10 shadow-inner">
              <div className="flex justify-between items-end mb-1">
                 <div className="text-[10px] text-indigo-100 uppercase tracking-wider font-bold">Лимиты</div>
                 <div className="text-white font-mono text-xs opacity-80">01.01</div>
              </div>
              <div className="text-2xl font-bold tracking-tight">45 <span className="text-base text-white/50 font-medium">/ 50</span></div>
              <div className="w-full bg-black/20 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-300 to-blue-400 h-full rounded-full shadow-[0_0_15px_rgba(56,189,248,0.6)]" style={{ width: '90%' }}></div>
              </div>
            </div>
            
            <button className="w-full py-2.5 bg-white text-indigo-700 rounded-lg font-bold text-xs hover:bg-indigo-50 hover:scale-[1.02] transition-all shadow-lg active:scale-95 relative z-10 flex items-center justify-center gap-2">
              <PenTool size={14} /> Создать новый пост
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};