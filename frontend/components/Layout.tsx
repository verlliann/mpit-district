import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Library, 
  Settings, 
  LogOut,
  Bell,
  Search,
  PanelLeft,
  PanelLeftClose,
  Check,
  Info,
  AlertCircle
} from 'lucide-react';
import { Modal, Button } from './ui';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  collapsed?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, collapsed, onClick }) => (
  <button 
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`flex items-center rounded-lg transition-all duration-300 mb-1 group relative overflow-hidden ${
      collapsed 
        ? 'justify-center w-full py-3 px-0' 
        : 'w-full space-x-3 px-3 py-2'
    } ${
      active 
        ? 'text-indigo-700 font-semibold shadow-sm' 
        : 'text-slate-600 hover:bg-white/40 hover:text-slate-900'
    }`}
  >
    {/* Active Gradient Background */}
    {active && (
      <div className={`absolute inset-0 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100/50 rounded-lg opacity-100`}></div>
    )}
    
    <span className={`relative z-10 transition-colors flex-shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
        {icon}
    </span>
    
    {!collapsed && (
      <span className="relative z-10 text-sm whitespace-nowrap opacity-100 transition-opacity duration-300">
        {label}
      </span>
    )}
  </button>
);

const NotificationItem: React.FC<{ title: string; desc: string; type: 'success' | 'info' | 'warning'; time: string }> = ({ title, desc, type, time }) => {
   const icons = {
     success: <Check size={12} className="text-emerald-500" />,
     info: <Info size={12} className="text-blue-500" />,
     warning: <AlertCircle size={12} className="text-amber-500" />
   };
   const bgs = {
     success: "bg-emerald-100/50",
     info: "bg-blue-100/50",
     warning: "bg-amber-100/50"
   };

   return (
     <div className="flex gap-3 p-3 hover:bg-white/50 rounded-lg transition-colors cursor-pointer border-b border-slate-100 last:border-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgs[type]}`}>
          {icons[type]}
        </div>
        <div>
           <div className="flex justify-between items-start">
             <h4 className="text-xs font-bold text-slate-800">{title}</h4>
             <span className="text-[10px] text-slate-400">{time}</span>
           </div>
           <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{desc}</p>
        </div>
     </div>
   )
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onChangeView, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex text-slate-800 transition-all duration-300">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white/30 backdrop-blur-2xl border-r border-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-500 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo Section */}
        <div className={`flex items-center gap-3 h-16 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
          <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            AI
          </div>
          <span 
            className={`font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}
          >
            Newsmaker
          </span>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-6 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <div>
            <div className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 transition-all duration-300 ${isCollapsed ? 'text-center' : 'px-3'}`}>
              {isCollapsed ? '•••' : 'Меню'}
            </div>
            <SidebarItem 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              active={activeView === 'dashboard'}
              collapsed={isCollapsed}
              onClick={() => onChangeView('dashboard')}
            />
            <SidebarItem 
              icon={<PenTool size={18} />} 
              label="Создать" 
              active={activeView === 'create'}
              collapsed={isCollapsed}
              onClick={() => onChangeView('create')}
            />
            <SidebarItem 
              icon={<CalendarIcon size={18} />} 
              label="Календарь" 
              active={activeView === 'calendar'}
              collapsed={isCollapsed}
              onClick={() => onChangeView('calendar')}
            />
            <SidebarItem 
              icon={<Library size={18} />} 
              label="Библиотека" 
              active={activeView === 'library'}
              collapsed={isCollapsed}
              onClick={() => onChangeView('library')}
            />
          </div>

          <div>
             <div className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 transition-all duration-300 ${isCollapsed ? 'text-center' : 'px-3'}`}>
              {isCollapsed ? '•••' : 'Аналитика'}
            </div>
            <SidebarItem 
              icon={<BarChart2 size={18} />} 
              label="Статистика" 
              active={activeView === 'analytics'}
              collapsed={isCollapsed}
              onClick={() => onChangeView('analytics')}
            />
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className={`m-3 rounded-xl bg-gradient-to-b from-white/40 to-white/20 border border-white/50 backdrop-blur-md shadow-sm transition-all duration-300 ${isCollapsed ? 'p-1' : 'p-3'}`}>
           <SidebarItem 
              icon={<Settings size={18} />} 
              label="Настройки" 
              active={activeView === 'settings'}
              collapsed={isCollapsed}
              onClick={() => onChangeView('settings')}
           />
           <SidebarItem 
              icon={<LogOut size={18} />} 
              label="Выйти" 
              collapsed={isCollapsed}
              onClick={() => setShowLogoutModal(true)}
           />
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div 
        className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-500 ease-in-out ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Header */}
        <header className="h-16 bg-white/20 backdrop-blur-xl border-b border-white/30 flex items-center justify-between px-6 sticky top-0 z-20 transition-all duration-300">
           <div className="flex items-center flex-1 max-w-lg gap-4">
             {/* Toggle Sidebar Button */}
             <button 
               onClick={() => setIsCollapsed(!isCollapsed)}
               className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white/40 transition-colors"
             >
               {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
             </button>

             {/* Search Bar */}
             <div className="relative w-full max-w-sm group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Поиск по проектам..." 
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white/40 border border-white/40 rounded-lg focus:bg-white/60 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 outline-none transition-all shadow-sm group-hover:bg-white/50"
                />
             </div>
           </div>

           <div className="flex items-center space-x-4 relative" ref={notifRef}>
             <button 
               onClick={() => setShowNotifications(!showNotifications)}
               className={`relative p-2 rounded-full transition-all shadow-sm border ${
                 showNotifications 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                  : 'bg-white/40 hover:bg-white/60 text-slate-600 border-white/50'
               }`}
             >
               <Bell size={18} />
               <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
             </button>
             
             {/* Notification Dropdown */}
             {showNotifications && (
               <div className="absolute top-full right-0 mt-3 w-80 bg-white/80 backdrop-blur-2xl rounded-xl border border-white/60 shadow-xl shadow-indigo-900/10 z-50 overflow-hidden animate-fade-in origin-top-right">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white/40">
                    <span className="font-bold text-xs text-slate-700">Уведомления</span>
                    <button className="text-[10px] text-indigo-600 font-semibold hover:underline">Очистить все</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <NotificationItem 
                      type="success" 
                      title="Генерация завершена" 
                      desc="Посты для 'Запуск продукта' готовы к публикации" 
                      time="2 мин назад" 
                    />
                    <NotificationItem 
                      type="info" 
                      title="Новый анализ" 
                      desc="Статья 'Tech Trends 2026' успешно проанализирована" 
                      time="1 час назад" 
                    />
                    <NotificationItem 
                      type="warning" 
                      title="Лимит токенов" 
                      desc="Вы использовали 85% месячного лимита токенов" 
                      time="5 часов назад" 
                    />
                  </div>
                  <div className="p-2 bg-slate-50/50 text-center border-t border-slate-100">
                     <button className="text-[10px] text-slate-500 hover:text-indigo-600 font-medium">Показать все</button>
                  </div>
               </div>
             )}
             
             <div className="flex items-center gap-3 pl-4 border-l border-slate-300/30">
               <div className="text-right hidden md:block">
                 <div className="text-sm font-bold text-slate-800">Alex Designer</div>
                 <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold uppercase tracking-wide">PR Manager</div>
               </div>
               <div className="h-9 w-9 bg-gradient-to-tr from-fuchsia-500 to-violet-600 rounded-full border-2 border-white shadow-md ring-2 ring-indigo-500/10 p-0.5">
                  <div className="w-full h-full rounded-full bg-white/20"></div>
               </div>
             </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* Logout Modal */}
        <Modal 
          isOpen={showLogoutModal} 
          onClose={() => setShowLogoutModal(false)}
          title="Выход из системы"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Отмена</Button>
              <Button variant="danger" onClick={() => { setShowLogoutModal(false); onLogout(); }}>Выйти</Button>
            </>
          }
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500">
               <LogOut size={24} />
             </div>
             <div>
               <p className="font-semibold text-slate-800">Вы уверены, что хотите выйти?</p>
               <p className="text-sm mt-1">Несохраненные данные могут быть потеряны.</p>
             </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};