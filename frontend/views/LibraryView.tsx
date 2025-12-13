import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal } from '../components/ui';
import { Search, Filter, MoreVertical, Calendar, Eye, Heart, Share2, Trash2, Edit, AlertTriangle, Plus, FileText } from 'lucide-react';
import { Platform, PostStatus } from '../types';
import { useQuery, useMutation } from '@apollo/client';
import { GET_POSTS } from '../services/graphql/queries';
import { DELETE_POST, UPDATE_POST, CREATE_POST } from '../services/graphql/mutations';
import { useToast } from '../components/Toast';

export const LibraryView: React.FC = () => {
  const { addToast } = useToast();
  
  const { data, loading, error, refetch } = useQuery(GET_POSTS, {
    variables: { limit: 50, offset: 0 },
    pollInterval: 30000,
    errorPolicy: 'all'
  });

  const [deletePost] = useMutation(DELETE_POST, {
    onCompleted: () => {
      refetch();
      addToast('Удалено', 'success', 'Пост успешно удален');
    },
    onError: (err) => {
      addToast('Ошибка', 'error', err.message);
    }
  });

  const [updatePost] = useMutation(UPDATE_POST, {
    onCompleted: () => {
      refetch();
      addToast('Сохранено', 'success', 'Изменения сохранены');
    },
    onError: (err) => {
      addToast('Ошибка', 'error', err.message);
    }
  });

  const [createPost] = useMutation(CREATE_POST, {
    onCompleted: () => {
      refetch();
      addToast('Создано', 'success', 'Новый пост создан');
      setIsCreateModalOpen(false);
      resetCreateForm();
    },
    onError: (err) => {
      addToast('Ошибка', 'error', err.message);
    }
  });

  // Преобразуем данные из GraphQL
  const posts = data?.posts?.nodes?.map((p: any) => ({
    id: p.id,
    title: p.article?.title || 'Без названия',
    excerpt: p.content?.substring(0, 100) + '...' || '',
    platform: p.platform,
    status: p.status,
    date: new Date(p.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    image: p.images?.[0]?.url || null,
    stats: { 
      views: p.metrics?.views || 0, 
      likes: p.metrics?.likes || 0 
    },
    content: p.content
  })) || [];
  
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [postToEdit, setPostToEdit] = useState<any>(null);
  const [editContent, setEditContent] = useState('');

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostPlatform, setNewPostPlatform] = useState<Platform>(Platform.TELEGRAM);
  const [newPostStatus, setNewPostStatus] = useState<'DRAFT' | 'SCHEDULED'>('DRAFT');

  const resetCreateForm = () => {
    setNewPostContent('');
    setNewPostPlatform(Platform.TELEGRAM);
    setNewPostStatus('DRAFT');
  };

  const filteredPosts = posts.filter((post: any) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || post.platform === filter || post.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (postToDelete) {
      try {
        await deletePost({ variables: { id: postToDelete } });
        setPostToDelete(null);
      } catch (err: any) {
        console.error('Ошибка удаления:', err);
      }
    }
  };

  const handleEdit = async () => {
    if (postToEdit && editContent) {
      try {
        await updatePost({ 
          variables: { 
            id: postToEdit.id, 
            input: { content: editContent } 
          } 
        });
        setPostToEdit(null);
        setEditContent('');
      } catch (err: any) {
        console.error('Ошибка редактирования:', err);
      }
    }
  };

  const handleCreate = async () => {
    if (!newPostContent.trim()) {
      addToast('Ошибка', 'error', 'Введите текст поста');
      return;
    }

    try {
      await createPost({
        variables: {
          input: {
            platform: newPostPlatform,
            content: newPostContent,
            status: newPostStatus
          }
        }
      });
    } catch (err: any) {
      console.error('Ошибка создания:', err);
    }
  };

  const openEditModal = (post: any) => {
    setPostToEdit(post);
    setEditContent(post.content || post.excerpt.replace('...', ''));
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

  // Показываем пустое состояние если нет данных
  const isEmpty = !loading && posts.length === 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Библиотека</h1>
           <p className="text-slate-500 text-sm">
            {data ? `${data.posts?.totalCount || 0} постов` : 'Все ваши черновики и публикации'}
           </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} className="mr-1" /> Создать
          </Button>
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

      {/* Empty State */}
      {isEmpty && (
        <div className="text-center py-20">
          <div className="mb-4 mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <FileText size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Пока нет постов</h3>
          <p className="text-slate-500 mb-4">Создайте первый пост или импортируйте статью</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} className="mr-1" /> Создать пост
          </Button>
        </div>
      )}

      {/* Error State */}
      {error && posts.length === 0 && (
        <div className="text-center py-10">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 inline-block">
            <p className="text-amber-800 text-sm">
              <AlertTriangle size={16} className="inline mr-2" />
              Не удалось загрузить посты. Проверьте подключение к серверу.
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {!isEmpty && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post: any) => (
          <div key={post.id} className="group relative bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
            {/* Image Area */}
              <div className="h-40 w-full relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                {post.image ? (
               <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText size={48} className="text-slate-300" />
                  </div>
                )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                  <div className="flex gap-2">
                     <button onClick={() => openEditModal(post)} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors"><Edit size={14} /></button>
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
      )}
      
      {filteredPosts.length === 0 && posts.length > 0 && (
         <div className="text-center py-20 text-slate-400">
            <div className="mb-3 mx-auto w-12 h-12 bg-slate-200/50 rounded-full flex items-center justify-center">
               <Search size={24} className="opacity-50" />
            </div>
            <p>Ничего не найдено по вашему запросу</p>
         </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetCreateForm();
        }}
        title="Создать новый пост"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsCreateModalOpen(false);
              resetCreateForm();
            }}>Отмена</Button>
            <Button onClick={handleCreate}>Создать</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Платформа</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newPostPlatform}
              onChange={(e) => setNewPostPlatform(e.target.value as Platform)}
            >
              {Object.values(Platform).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Статус</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newPostStatus}
              onChange={(e) => setNewPostStatus(e.target.value as 'DRAFT' | 'SCHEDULED')}
            >
              <option value="DRAFT">Черновик</option>
              <option value="SCHEDULED">Запланирован</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Содержимое</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={6}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Введите текст публикации..."
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!postToEdit}
        onClose={() => {
          setPostToEdit(null);
          setEditContent('');
        }}
        title="Редактировать публикацию"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setPostToEdit(null);
              setEditContent('');
            }}>Отмена</Button>
            <Button variant="primary" onClick={handleEdit}>Сохранить</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Содержимое поста</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={6}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Введите текст публикации..."
            />
          </div>
        </div>
      </Modal>

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
            <p className="text-sm">Публикация будет удалена из библиотеки.</p>
           </div>
        </div>
      </Modal>
    </div>
  );
};
