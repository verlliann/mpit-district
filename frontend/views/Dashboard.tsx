import React from 'react';
import { Card, Badge, Button } from '../components/ui';
import { TrendingUp, Users, FileText, CheckCircle, ArrowRight, Zap, PenTool, AlertCircle } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_POSTS, GET_ANALYTICS } from '../services/graphql/queries';

const StatCard: React.FC<{ title: string; value: string; trend?: string; icon: React.ReactNode; isPositive?: boolean; color: string; loading?: boolean }> = ({ title, value, trend, icon, isPositive = true, color, loading }) => (
  <Card className="p-5 transition-all hover:-translate-y-1 hover:shadow-lg duration-300 group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-600 transition-colors uppercase tracking-wide">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-slate-200 animate-pulse rounded mt-1"></div>
        ) : (
          <h3 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</h3>
        )}
      </div>
      <div className={`p-3 rounded-xl text-white shadow-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center text-xs">
        <span className={`px-2 py-0.5 rounded-md font-bold ${isPositive ? "text-emerald-700 bg-emerald-100/60" : "text-rose-700 bg-rose-100/60"}`}>
          {trend}
        </span>
        <span className="text-slate-400 ml-2 font-medium">с прошлого месяца</span>
      </div>
    )}
  </Card>
);

const ActivityItem: React.FC<{ title: string; time: string; status: string; platform?: string }> = ({ title, time, status, platform }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100/50 last:border-0 hover:bg-white/40 -mx-5 px-5 transition-all duration-200 group">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] shadow-md border border-white/20 group-hover:scale-105 transition-transform">
        {platform ? platform.charAt(0) : 'AI'}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{title}</h4>
        <p className="text-[10px] text-slate-500">{time}</p>
      </div>
    </div>
    <Badge variant={status === 'PUBLISHED' ? 'success' : status === 'SCHEDULED' ? 'warning' : 'neutral'}>
      {status === 'PUBLISHED' ? 'Опубликовано' : status === 'SCHEDULED' ? 'Запланировано' : 'Черновик'}
    </Badge>
  </div>
);

export const Dashboard: React.FC = () => {
  // Получаем последние посты
  const { data: postsData, loading: postsLoading, error: postsError } = useQuery(GET_POSTS, {
    variables: { limit: 5, offset: 0 },
    errorPolicy: 'all',
    fetchPolicy: 'network-only'
  });

  // Получаем аналитику за последние 30 дней
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: analyticsData, loading: analyticsLoading } = useQuery(GET_ANALYTICS, {
    variables: {
      from: thirtyDaysAgo.toISOString(),
      to: new Date().toISOString()
    },
    errorPolicy: 'all',
    fetchPolicy: 'network-only'
  });

  const posts = postsData?.posts?.nodes || [];
  const totalPosts = postsData?.posts?.totalCount ?? 0;
  const analytics = analyticsData?.analytics;

  const totalReach = analytics?.totalReach ?? 0;
  const avgEngagement = analytics?.averageEngagement ?? 0;
  const publishedCount = posts.filter((p: any) => p.status === 'PUBLISHED').length;
  
  // Не показываем загрузку дольше 3 секунд - показываем 0
  const [forceShow, setForceShow] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setForceShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'только что';
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays === 1) return 'вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  // Если forceShow=true - прекращаем показывать загрузку
  const isLoading = (postsLoading || analyticsLoading) && !forceShow;
  const hasError = postsError && posts.length === 0;

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
          value={formatNumber(totalReach)}
          icon={<Users size={18} />} 
          color="bg-gradient-to-br from-blue-500 to-cyan-500 shadow-cyan-500/30"
          loading={isLoading}
        />
        <StatCard 
          title="Вовлеченность" 
          value={`${avgEngagement.toFixed(1)}%`}
          icon={<TrendingUp size={18} />} 
          color="bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-fuchsia-500/30"
          loading={isLoading}
        />
        <StatCard 
          title="Всего постов" 
          value={totalPosts.toString()}
          icon={<FileText size={18} />} 
          color="bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30"
          loading={isLoading}
        />
        <StatCard 
          title="Опубликовано" 
          value={publishedCount.toString()}
          icon={<CheckCircle size={18} />} 
          color="bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30"
          loading={isLoading}
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
            
            {hasError && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <AlertCircle size={20} className="text-amber-600" />
                <p className="text-sm text-amber-800">Не удалось загрузить данные. Проверьте подключение к серверу.</p>
              </div>
            )}
            
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-48 bg-slate-200 animate-pulse rounded"></div>
                      <div className="h-3 w-24 bg-slate-100 animate-pulse rounded mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && !hasError && posts.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                <p>Пока нет активности</p>
                <p className="text-xs mt-1">Создайте первый пост, чтобы начать</p>
              </div>
            )}
            
            {!isLoading && !hasError && posts.length > 0 && (
              <div className="space-y-1">
                {posts.map((post: any) => (
                  <ActivityItem 
                    key={post.id}
                    title={post.article?.title || post.content?.substring(0, 50) || 'Без названия'}
                    time={formatTime(post.createdAt)}
                    status={post.status}
                    platform={post.platform}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 h-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white border-0 relative overflow-hidden group shadow-xl shadow-indigo-900/20">
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
                <div className="text-[10px] text-indigo-100 uppercase tracking-wider font-bold">Постов создано</div>
                <div className="text-white font-mono text-xs opacity-80">сегодня</div>
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {isLoading ? (
                  <div className="h-8 w-16 bg-white/20 animate-pulse rounded"></div>
                ) : (
                  <>{totalPosts} <span className="text-base text-white/50 font-medium">постов</span></>
                )}
              </div>
              <div className="w-full bg-black/20 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-300 to-blue-400 h-full rounded-full shadow-[0_0_15px_rgba(56,189,248,0.6)]" 
                  style={{ width: `${Math.min((totalPosts / 50) * 100, 100)}%` }}
                ></div>
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
