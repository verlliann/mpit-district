import React, { useState } from 'react';
import { Card } from '../components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import { useQuery } from '@apollo/client';
import { GET_ANALYTICS } from '../services/graphql/queries';
import { TrendingUp, Clock, Video, DollarSign, AlertCircle } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [period, setPeriod] = useState<'7' | '30'>('30');
  
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - parseInt(period));
  
  const { data, loading, error } = useQuery(GET_ANALYTICS, {
    variables: {
      from: fromDate.toISOString(),
      to: new Date().toISOString()
    },
    errorPolicy: 'all'
  });

  const analytics = data?.analytics;
  
  // Преобразуем timeline данные для графиков
  const chartData = analytics?.timeline?.map((item: any) => ({
    name: new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    reach: item.reach || 0,
    engagement: item.engagement || 0,
    views: item.views || 0,
    likes: item.likes || 0
  })) || [];

  // Преобразуем данные по платформам
  const platformData = analytics?.platformBreakdown?.map((item: any) => ({
    name: item.platform === 'TELEGRAM' ? 'Telegram' :
          item.platform === 'VK' ? 'VK' :
          item.platform === 'INSTAGRAM' ? 'Insta' :
          item.platform === 'LINKEDIN' ? 'Linked' : item.platform,
    value: item.reach || 0,
    fill: item.platform === 'TELEGRAM' ? '#8b5cf6' :
          item.platform === 'VK' ? '#3b82f6' :
          item.platform === 'INSTAGRAM' ? '#ec4899' :
          item.platform === 'LINKEDIN' ? '#0ea5e9' : '#94a3b8'
  })) || [];

  // Находим лучшее время публикации
  const bestTime = analytics?.topPosts?.[0]?.publishedAt 
    ? new Date(analytics.topPosts[0].publishedAt).toLocaleDateString('ru-RU', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
    : 'Нет данных';

  // Считаем топ формат
  const topFormat = analytics?.topPosts?.length > 0 ? 'Текст с изображением' : 'Нет данных';

  // Общие метрики
  const totalReach = analytics?.totalReach || 0;
  const avgEngagement = analytics?.averageEngagement || 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (error && !analytics) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Аналитика</h1>
        <div className="flex items-center gap-3 p-6 bg-amber-50 rounded-xl border border-amber-100">
          <AlertCircle size={24} className="text-amber-600" />
          <div>
            <p className="font-semibold text-amber-800">Не удалось загрузить аналитику</p>
            <p className="text-sm text-amber-700">Проверьте подключение к серверу GraphQL на порту 4000</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Аналитика</h1>
        <select 
          className="bg-white/50 border border-slate-200 text-sm font-medium text-slate-600 rounded-lg px-3 py-2 outline-none cursor-pointer"
          value={period}
          onChange={(e) => setPeriod(e.target.value as '7' | '30')}
        >
          <option value="30">За 30 дней</option>
          <option value="7">За 7 дней</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-base font-bold text-slate-800">Динамика охватов</h3>
            {loading && (
              <span className="text-xs text-slate-400">Загрузка...</span>
            )}
          </div>
          <div className="h-[240px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                  <Area type="monotone" dataKey="reach" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" name="Охват" />
                  <Area type="monotone" dataKey="views" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorEngage)" name="Просмотры" />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Нет данных за выбранный период</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-1 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4">Эффективность платформ</h3>
          <div className="h-[240px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : platformData.length > 0 ? (
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
                    formatter={(value: number) => [formatNumber(value), 'Охват']}
                 />
                 <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <p>Нет данных по платформам</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors"></div>
          <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide flex items-center gap-1">
            <Clock size={12} /> Лучшее время
          </div>
          <div className="text-lg font-bold text-slate-800 relative z-10">
            {loading ? (
              <div className="h-6 w-32 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              bestTime
            )}
          </div>
          </Card>
          
          <Card className="p-4 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide flex items-center gap-1">
            <Video size={12} /> Топ формат
          </div>
          <div className="text-lg font-bold text-slate-800 relative z-10">
            {loading ? (
              <div className="h-6 w-28 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              topFormat
            )}
          </div>
          </Card>
          
          <Card className="p-4 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors"></div>
          <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide flex items-center gap-1">
            <TrendingUp size={12} /> Вовлеченность
          </div>
          <div className="text-lg font-bold text-slate-800 relative z-10">
            {loading ? (
              <div className="h-6 w-20 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              `${avgEngagement.toFixed(1)}%`
            )}
          </div>
          </Card>
          
          <Card className="p-4 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500"></div>
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-fuchsia-500/10 rounded-full blur-xl group-hover:bg-fuchsia-500/20 transition-colors"></div>
          <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide flex items-center gap-1">
            <DollarSign size={12} /> Охват
          </div>
          <div className="text-lg font-bold text-slate-800 relative z-10">
            {loading ? (
              <div className="h-6 w-24 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              formatNumber(totalReach)
            )}
          </div>
          </Card>
      </div>
    </div>
  );
};
