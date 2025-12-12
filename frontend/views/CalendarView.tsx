import React, { useState } from 'react';
import { Card, Badge, Modal, Input, Button } from '../components/ui';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Platform } from '../types';

export const CalendarView: React.FC = () => {
  const days = Array.from({ length: 35 }, (_, i) => i + 1); // Mock calendar days
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const handleDayClick = (day: number) => {
    if (day <= 31) {
      setSelectedDay(day);
      setIsModalOpen(true);
    }
  };

  const handleSavePost = () => {
    setIsModalOpen(false);
    addToast('Пост запланирован', 'success', `Публикация добавлена на ${selectedDay} Декабря.`);
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
             <button className="p-1 hover:bg-white/50 rounded-md text-slate-600 transition-colors"><ChevronLeft size={16} /></button>
             <span className="font-bold text-slate-800 w-28 text-center text-sm">Декабрь 2025</span>
             <button className="p-1 hover:bg-white/50 rounded-md text-slate-600 transition-colors"><ChevronRight size={16} /></button>
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
            {days.map((day, i) => {
                // Mock logic to show some posts
                const hasPost = i % 3 === 0 && day < 31; 
                const hasDraft = i % 7 === 0 && day < 31;
                const isCurrentMonth = day <= 31;
                
                return (
                <div 
                  key={i} 
                  onClick={() => handleDayClick(day)}
                  className={`bg-white/60 backdrop-blur-sm p-2 min-h-[80px] relative hover:bg-white/80 transition-all duration-200 group ${!isCurrentMonth ? 'text-slate-300 bg-slate-50/50 pointer-events-none' : 'cursor-pointer hover:shadow-inner'}`}
                >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${!isCurrentMonth ? '' : 'text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors'}`}>
                        {isCurrentMonth ? day : day - 31}
                      </span>
                      {isCurrentMonth && (
                         <PlusCircle size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-opacity" />
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                    {hasPost && (
                        <div className="text-[10px] p-1.5 bg-blue-100/60 text-blue-700 rounded-md border border-blue-200/50 truncate cursor-pointer hover:scale-[1.02] transition-transform font-medium shadow-sm" onClick={(e) => { e.stopPropagation(); addToast('Открыт пост', 'info', 'Редактирование поста...'); }}>
                        🚀 Запуск продукта...
                        </div>
                    )}
                    {hasDraft && (
                        <div className="text-[10px] p-1.5 bg-slate-100/60 text-slate-600 rounded-md border border-slate-200/50 border-dashed truncate cursor-pointer hover:bg-slate-200/60 transition-colors" onClick={(e) => { e.stopPropagation(); addToast('Открыт черновик', 'info', 'Редактирование черновика...'); }}>
                        📝 Черновик: Итоги...
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
        onClose={() => setIsModalOpen(false)}
        title={`Планирование на ${selectedDay} Декабря`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSavePost}>Запланировать</Button>
          </>
        }
      >
        <div className="space-y-4">
           <Input label="Заголовок / Тема" placeholder="Например: Анонс вебинара" autoFocus />
           
           <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide opacity-80">Время публикации</label>
              <div className="flex gap-2">
                 <input type="time" className="bg-white/40 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" defaultValue="10:00" />
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide opacity-80">Платформы</label>
              <div className="flex gap-2 flex-wrap">
                 {[Platform.TELEGRAM, Platform.VK, Platform.INSTAGRAM].map(p => (
                   <Badge key={p} variant="neutral" className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200">{p}</Badge>
                 ))}
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
};