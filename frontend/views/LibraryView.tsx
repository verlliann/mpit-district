import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal } from '../components/ui';
import { Search, Filter, MoreVertical, Calendar, Eye, Heart, Share2, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Platform, PostStatus } from '../types';
import { useQuery, useMutation } from '@apollo/client';
import { GET_POSTS } from '../services/graphql/queries';
import { DELETE_POST, UPDATE_POST } from '../services/graphql/mutations';

// Fallback mock data для демо
const FALLBACK_POSTS = [
  {
    id: '1',
    title: 'Запуск зеленого дата-центра',
    excerpt: 'TechCorp объявляет о запуске нового экологичного ЦОД...',
    platform: Platform.TELEGRAM,
    status: PostStatus.PUBLISHED,
    date: '14 Дек, 10:00',
    image: 'https://picsum.photos/seed/tech/400/300',
    stats: { views: 1240, likes: 45 }
  },
  {
    id: '2',
    title: 'Итоги года: рост на 200%',
    excerpt: 'Подводим итоги уходящего года. Мы выросли вдвое...',
    platform: Platform.LINKEDIN,
    status: PostStatus.DRAFT,
    date: '15 Дек, 14:00',
    image: 'https://picsum.photos/seed/growth/400/300',
    stats: { views: 0, likes: 0 }
  },
  {
    id: '3',
    title: 'Новая фича: AI Генерация',
    excerpt: 'Встречайте обновление! Теперь вы можете генерировать...',
    platform: Platform.VK,
    status: PostStatus.SCHEDULED,
    date: '16 Дек, 09:00',
    image: 'https://picsum.photos/seed/ai/400/300',
    stats: { views: 0, likes: 0 }
  },
  {
    id: '4',
    title: 'Наш офис изнутри',
    excerpt: 'Небольшой рум-тур по нашему новому пространству...',
    platform: Platform.INSTAGRAM,
    status: PostStatus.PUBLISHED,
    date: '10 Дек, 18:30',
    image: 'https://picsum.photos/seed/office/400/300',
    stats: { views: 3500, likes: 210 }
  },
  {
    id: '5',
    title: 'Вакансия: Senior Frontend',
    excerpt: 'Ищем крутого разработчика в команду платформы...',
    platform: Platform.LINKEDIN,
    status: PostStatus.PUBLISHED,
    date: '08 Дек, 11:15',
    image: 'https://picsum.photos/seed/code/400/300',
    stats: { views: 890, likes: 12 }
  },
  {
    id: '6',
    title: '5 советов по продуктивности',
    excerpt: 'Как успевать больше и уставать меньше? Читайте...',
    platform: Platform.TELEGRAM,
    status: PostStatus.DRAFT,
    date: 'Нет даты',
    image: 'https://picsum.photos/seed/work/400/300',
    stats: { views: 0, likes: 0 }
  },
];

export const LibraryView: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_POSTS, {
    variables: { limit: 50, offset: 0 },
    pollInterval: 30000 // Обновлять каждые 30 сек
  });

  const [deletePost] = useMutation(DELETE_POST, {
    onCompleted: () => {
      refetch(); // Обновляем список после удаления
    }
  });

  const [updatePost] = useMutation(UPDATE_POST, {
    onCompleted: () => {
      refetch(); // Обновляем список после редактирования
    }
  });

  // Debug
  console.log('🔍 LibraryView Debug:', { 
    hasData: !!data, 
    postsCount: data?.posts?.nodes?.length,
    loading, 
    error: error?.message 
  });

  // Преобразуем данные из GraphQL
  const graphqlPosts = data?.posts?.nodes?.map((p: any) => ({
    id: p.id,
    title: p.article?.title || 'Без названия',
    excerpt: p.content.substring(0, 100) + '...',
    platform: p.platform,
    status: p.status,
    date: new Date(p.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    image: p.images?.[0]?.url || 'https://picsum.photos/seed/default/400/300',
    stats: { 
      views: p.metrics?.views || 0, 
      likes: p.metrics?.likes || 0 
    }
  })) || [];

  const [posts, setPosts] = useState(graphqlPosts.length > 0 ? graphqlPosts : FALLBACK_POSTS);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Обновляем posts когда приходят данные
  React.useEffect(() => {
    if (graphqlPosts.length > 0) {
      setPosts(graphqlPosts);
    }
  }, [data]);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || post.platform === filter || post.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (postToDelete) {
      try {
        await deletePost({ variables: { id: postToDelete } });
        setPosts(posts.filter(p => p.id !== postToDelete));
        setPostToDelete(null);
      } catch (err: any) {
        console.error('Ошибка удаления:', err);
        alert('Не удалось удалить пост: ' + err.message);
      }
    }
  };

  const getStatusVariant = (status: PostStatus) => {
    switch (status) {
      case PostStatus.PUBLISHED: return 'success';
      case PostStatus.SCHEDULED: return 'warning';
      case PostStatus.DRAFT: return 'neutral';
      default: return 'neutral';
    }
  };

  // Показываем загрузку
  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Загрузка постов...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 font-semibold mb-2">Ошибка загрузки</p>
          <p className="text-red-600 text-sm">{error.message}</p>
          <p className="text-slate-500 text-xs mt-2">Проверьте что GraphQL API работает на localhost:4000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Библиотека</h1>
           <p className="text-slate-500 text-sm">
             {data ? `${data.posts?.totalCount || 0} постов из базы данных` : 'Все ваши черновики и публикации в одном месте'}
           </p>
        </div>
        
        <div className="flex gap-2">
           <Button>+ Создать</Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-3 flex flex-col md:flex-row gap-3 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              placeholder="Поиск по заголовку..." 
              className="w-full pl-9 pr-4 py-2 text-sm bg-white/40 border border-white/60 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         
         <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <select 
              className="px-3 py-2 bg-white/40 border border-white/60 rounded-lg text-sm text-slate-600 outline-none cursor-pointer hover:bg-white/60 min-w-[120px]"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Все платформы</option>
              {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            
             <select 
              className="px-3 py-2 bg-white/40 border border-white/60 rounded-lg text-sm text-slate-600 outline-none cursor-pointer hover:bg-white/60 min-w-[120px]"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Любой статус</option>
              {Object.values(PostStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <button className="p-2 bg-white/40 border border-white/60 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-white/80 transition-colors">
               <Filter size={18} />
            </button>
         </div>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="group relative bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
            {/* Image Area */}
            <div className="h-40 w-full relative overflow-hidden">
               <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                  <div className="flex gap-2">
                     <button className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors"><Edit size={14} /></button>
                     <button 
                      onClick={() => setPostToDelete(post.id)}
                      className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-red-500/60 transition-colors"
                     >
                      <Trash2 size={14} />
                     </button>
                  </div>
               </div>
               <div className="absolute top-3 left-3">
                  <Badge variant="neutral" className="bg-white/90 backdrop-blur-md border-0 shadow-sm">{post.platform}</Badge>
               </div>
               <div className="absolute top-3 right-3">
                  <Badge variant={getStatusVariant(post.status)} className="shadow-sm">{post.status}</Badge>
               </div>
            </div>

            {/* Content Area */}
            <div className="p-5">
               <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mb-2">
                  <Calendar size={12} />
                  <span>{post.date}</span>
               </div>
               
               <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-700 transition-colors">{post.title}</h3>
               <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
               
               <div className="pt-3 border-t border-slate-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5 text-xs text-slate-500" title="Views">
                        <Eye size={14} /> {post.stats.views > 0 ? post.stats.views : '-'}
                     </div>
                     <div className="flex items-center gap-1.5 text-xs text-slate-500" title="Likes">
                        <Heart size={14} /> {post.stats.likes > 0 ? post.stats.likes : '-'}
                     </div>
                  </div>
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                     <MoreVertical size={16} />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredPosts.length === 0 && (
         <div className="text-center py-20 text-slate-400">
            <div className="mb-3 mx-auto w-12 h-12 bg-slate-200/50 rounded-full flex items-center justify-center">
               <Search size={24} className="opacity-50" />
            </div>
            <p>Ничего не найдено по вашему запросу</p>
         </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        title="Удалить публикацию?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPostToDelete(null)}>Отмена</Button>
            <Button variant="danger" onClick={handleDelete}>Удалить</Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
           <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500 mt-1">
             <AlertTriangle size={20} />
           </div>
           <div>
             <p className="font-semibold text-slate-800 mb-1">Это действие нельзя отменить.</p>
             <p className="text-sm">Публикация будет удалена из библиотеки и перестанет отображаться в аналитике, если она была черновиком.</p>
           </div>
        </div>
      </Modal>
    </div>
  );
};