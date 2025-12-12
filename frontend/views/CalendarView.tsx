import React, { useState } from 'react';
import { Card, Badge, Modal, Input, Button } from '../components/ui';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Platform } from '../types';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SCHEDULED_POSTS } from '../services/graphql/queries';
import { CREATE_POST } from '../services/graphql/mutations';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postTime, setPostTime] = useState('10:00');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.TELEGRAM]);
  const { addToast } = useToast();

  // Получаем начало и конец месяца
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data, loading, refetch } = useQuery(GET_SCHEDULED_POSTS, {
    variables: {
      from: startOfMonth.toISOString(),
      to: endOfMonth.toISOString()
    },
    pollInterval: 60000 // Обновлять каждую минуту
  });

  const [createPost] = useMutation(CREATE_POST, {
    onCompleted: () => {
      refetch();
      addToast('Пост запланирован', 'success', `Публикация добавлена на ${selectedDay} ${currentDate.toLocaleDateString('ru-RU', { month: 'long' })}`);
    },
    onError: (error) => {
      addToast('Ошибка', 'error', error.message);
    }
  });

  const scheduledPosts = data?.scheduledPosts || [];

  // Генерируем дни календаря
  const firstDayOfWeek = (startOfMonth.getDay() + 6) % 7; // 0 = Пн
  const daysInMonth = endOfMonth.getDate();
  const days = Array.from({ length: 35 }, (_, i) => {
    const day = i - firstDayOfWeek + 1;
    return {
      day,
      isCurrentMonth: day > 0 && day <= daysInMonth
    };
  });

  const handleDayClick = (day: number) => {
    if (day <= 31) {
      setSelectedDay(day);
      setIsModalOpen(true);
    }
  };

  const handleSavePost = async () => {
    if (!postContent.trim()) {
      addToast('Ошибка', 'error', 'Введите текст поста');
      return;
    }

    if (selectedPlatforms.length === 0) {
      addToast('Ошибка', 'error', 'Выберите хотя бы одну платформу');
      return;
    }

    // Создаем дату с выбранным временем
    const scheduledDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay!,
      parseInt(postTime.split(':')[0]),
      parseInt(postTime.split(':')[1])
    );

    try {
      // Создаем пост для каждой выбранной платформы
      for (const platform of selectedPlatforms) {
        await createPost({
          variables: {
            input: {
              platform,
              content: postContent,
              status: 'SCHEDULED',
              scheduledAt: scheduledDate.toISOString()
            }
          }
        });
      }

      // Очищаем форму
      setPostContent('');
      setPostTime('10:00');
      setSelectedPlatforms([Platform.TELEGRAM]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Календарь</h1>
        <div className="flex items-center space-x-4 self-end sm:self-auto">
          <div className="flex bg-white/40 backdrop-blur-md rounded-lg shadow-sm border border-white/40 p-1">
            <button className="px-3 py-1 text-xs font-semibold bg-white/80 rounded-md text-slate-800 shadow-sm">Месяц</button>
            <button className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">Неделя</button>
          </div>
          <div className="flex items-center gap-2 bg-white/30 px-2 py-1 rounded-lg border border-white/40 backdrop-blur-sm">
             <button 
               onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
               className="p-1 hover:bg-white/50 rounded-md text-slate-600 transition-colors"
             >
               <ChevronLeft size={16} />
             </button>
             <span className="font-bold text-slate-800 w-28 text-center text-sm">
               {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
             </span>
             <button 
               onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
               className="p-1 hover:bg-white/50 rounded-md text-slate-600 transition-colors"
             >
               <ChevronRight size={16} />
             </button>
          </div>
        </div>
      </div>

      <Card className="flex-1 p-0 overflow-hidden flex flex-col shadow-2xl shadow-blue-900/5 relative">
        <div className="overflow-x-auto h-full flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-white/40 bg-white/30 backdrop-blur-md min-w-[600px] md:min-w-0">
            {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(day => (
                <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-500 tracking-wider">
                {day}
                </div>
            ))}
            </div>
            
            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-200/50 gap-[1px] min-w-[600px] md:min-w-0">
            {days.map(({ day, isCurrentMonth }, i) => {
                // Находим посты для этого дня
                const dayPosts = scheduledPosts.filter((post: any) => {
                  if (!post.scheduledAt) return false;
                  const postDate = new Date(post.scheduledAt);
                  return postDate.getDate() === day && 
                         postDate.getMonth() === currentDate.getMonth() &&
                         postDate.getFullYear() === currentDate.getFullYear();
                });
                
                return (
                <div 
                  key={i} 
                  onClick={() => isCurrentMonth && handleDayClick(day)}
                  className={`bg-white/60 backdrop-blur-sm p-2 min-h-[80px] relative hover:bg-white/80 transition-all duration-200 group ${!isCurrentMonth ? 'text-slate-300 bg-slate-50/50 pointer-events-none' : 'cursor-pointer hover:shadow-inner'}`}
                >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${!isCurrentMonth ? '' : 'text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors'}`}>
                        {day}
                      </span>
                      {isCurrentMonth && (
                         <PlusCircle size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-opacity" />
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                    {dayPosts.slice(0, 3).map((post: any) => (
                        <div 
                          key={post.id}
                          className={`text-[10px] p-1.5 rounded-md border truncate cursor-pointer hover:scale-[1.02] transition-transform font-medium shadow-sm ${
                            post.status === 'SCHEDULED' 
                              ? 'bg-blue-100/60 text-blue-700 border-blue-200/50' 
                              : 'bg-slate-100/60 text-slate-600 border-slate-200/50 border-dashed'
                          }`}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            addToast('Открыт пост', 'info', `Пост #${post.id.slice(0, 8)} - ${post.platform}`); 
                          }}
                        >
                          {post.platform === 'TELEGRAM' && '📱'} 
                          {post.platform === 'VK' && '🔵'} 
                          {post.platform === 'INSTAGRAM' && '📸'} 
                          {post.platform === 'LINKEDIN' && '💼'} 
                          {' '}
                          {post.content?.substring(0, 15) || 'Без текста'}...
                        </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-[9px] text-slate-500 text-center font-semibold">
                        +{dayPosts.length - 3} еще
                      </div>
                    )}
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </Card>

      {/* Quick Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPostContent('');
          setPostTime('10:00');
          setSelectedPlatforms([Platform.TELEGRAM]);
        }}
        title={`Планирование на ${selectedDay} ${currentDate.toLocaleDateString('ru-RU', { month: 'long' })}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setPostContent('');
              setPostTime('10:00');
              setSelectedPlatforms([Platform.TELEGRAM]);
            }}>Отмена</Button>
            <Button onClick={handleSavePost}>Запланировать</Button>
          </>
        }
      >
        <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide opacity-80">Текст публикации</label>
             <textarea
               className="w-full bg-white/40 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
               placeholder="Например: Анонс вебинара по AI..."
               value={postContent}
               onChange={(e) => setPostContent(e.target.value)}
               autoFocus
             />
           </div>
           
           <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide opacity-80">Время публикации</label>
              <div className="flex gap-2">
                 <input 
                   type="time" 
                   className="bg-white/40 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" 
                   value={postTime}
                   onChange={(e) => setPostTime(e.target.value)}
                 />
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide opacity-80">Платформы</label>
              <div className="flex gap-2 flex-wrap">
                 {[Platform.TELEGRAM, Platform.VK, Platform.INSTAGRAM, Platform.LINKEDIN].map(p => (
                   <Badge 
                     key={p} 
                     variant={selectedPlatforms.includes(p) ? "primary" : "neutral"} 
                     className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                     onClick={() => {
                       if (selectedPlatforms.includes(p)) {
                         setSelectedPlatforms(selectedPlatforms.filter(pl => pl !== p));
                       } else {
                         setSelectedPlatforms([...selectedPlatforms, p]);
                       }
                     }}
                   >
                     {p}
                   </Badge>
                 ))}
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
};