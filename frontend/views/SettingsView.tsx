import React, { useState } from 'react';
import { Card, Button, Input, Badge, Modal } from '../components/ui';
import { User, Cpu, Link as LinkIcon, Bell, CreditCard, Save, Check, LogOut, Shield, Key } from 'lucide-react';
import { useToast } from '../components/Toast';

interface SettingsViewProps {
  onLogout: () => void;
}

const TABS = [
  { id: 'general', label: 'Профиль', icon: <User size={16} /> },
  { id: 'ai', label: 'AI Настройки', icon: <Cpu size={16} /> },
  { id: 'integrations', label: 'Интеграции', icon: <LinkIcon size={16} /> },
  { id: 'billing', label: 'Тариф', icon: <CreditCard size={16} /> },
];

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div 
    onClick={onChange}
    className={`w-11 h-6 flex items-center bg-slate-200 rounded-full p-1 duration-300 ease-in-out cursor-pointer ${checked ? 'bg-indigo-500' : ''}`}
  >
    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5' : ''}`}></div>
  </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { addToast } = useToast();
  
  // Mock state for integrations to show changes
  const [integrations, setIntegrations] = useState([
    { name: 'Telegram', status: 'connected', color: 'bg-blue-500' },
    { name: 'VKontakte', status: 'connected', color: 'bg-blue-600' },
    { name: 'Instagram', status: 'disconnected', color: 'bg-pink-600' },
    { name: 'LinkedIn', status: 'disconnected', color: 'bg-sky-600' },
  ]);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        addToast('Настройки сохранены', 'success', 'Изменения успешно применены к вашему профилю.');
    }, 1500);
  };

  const handleToggleConnection = (name: string, currentStatus: string) => {
    if (currentStatus === 'connected') {
      // Disconnect immediately for demo
      setIntegrations(prev => prev.map(i => i.name === name ? { ...i, status: 'disconnected' } : i));
      addToast('Интеграция отключена', 'info', `${name} успешно отключен.`);
    } else {
      // Open modal to connect
      setConnectingPlatform(name);
    }
  };

  const confirmConnection = () => {
    if (connectingPlatform) {
      setIntegrations(prev => prev.map(i => i.name === connectingPlatform ? { ...i, status: 'connected' } : i));
      addToast('Успешное подключение', 'success', `${connectingPlatform} теперь связан с вашим аккаунтом.`);
      setConnectingPlatform(null);
    }
  };

  // --- Tab Content Renderers ---

  const renderGeneral = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-fuchsia-500 to-violet-600 p-1 shadow-lg shadow-indigo-500/20">
             <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
               <span className="text-2xl font-bold text-indigo-600">AD</span>
             </div>
          </div>
          <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-slate-100 text-slate-600 hover:text-indigo-600 transition-colors">
            <User size={14} />
          </button>
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Имя" defaultValue="Alex" />
            <Input label="Фамилия" defaultValue="Designer" />
          </div>
          <Input label="Email" defaultValue="alex.designer@company.com" />
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide opacity-80">Роль</h4>
            <Badge variant="purple">PR Manager</Badge>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6"></div>

      <div>
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Shield size={16} className="text-emerald-500" /> Безопасность
        </h3>
        <div className="space-y-4 max-w-md">
           <Input label="Текущий пароль" type="password" placeholder="••••••••" />
           <Input label="Новый пароль" type="password" />
        </div>
      </div>
    </div>
  );

  const renderAI = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 flex items-start gap-3">
        <Cpu className="text-indigo-600 mt-1" size={20} />
        <div>
          <h4 className="font-bold text-sm text-indigo-900">Модель генерации</h4>
          <p className="text-xs text-indigo-700/70 mt-1">Выберите основную языковую модель для генерации контента.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide opacity-80">Основная модель</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini Pro'].map((model) => (
              <div key={model} className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group ${model === 'GPT-4o' ? 'bg-white border-indigo-500 shadow-md shadow-indigo-500/10' : 'bg-white/40 border-slate-200 hover:bg-white/60'}`}>
                <span className={`text-sm font-semibold ${model === 'GPT-4o' ? 'text-indigo-700' : 'text-slate-600'}`}>{model}</span>
                {model === 'GPT-4o' && <Check size={14} className="text-indigo-600" />}
              </div>
            ))}
          </div>
        </div>

        <Input label="System Prompt (Tone of Voice по умолчанию)" defaultValue="Ты — опытный PR-менеджер. Пиши кратко, вовлекающе и используй эмодзи умеренно." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide opacity-80">Длина постов (Default)</label>
             <input type="range" className="w-full h-1.5 bg-slate-200/50 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
             <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
               <span>Короткие</span>
               <span>Лонгриды</span>
             </div>
           </div>
           
           <div>
             <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide opacity-80">Креативность</label>
             <input type="range" className="w-full h-1.5 bg-slate-200/50 rounded-lg appearance-none cursor-pointer accent-fuchsia-600" defaultValue="70" />
             <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
               <span>Точно</span>
               <span>Креативно</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-4 animate-fade-in">
      {integrations.map((platform) => (
        <div key={platform.name} className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md ${platform.color}`}>
              {platform.name[0]}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">{platform.name}</h4>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${platform.status === 'connected' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {platform.status === 'connected' ? 'Подключено' : 'Не подключено'}
              </span>
            </div>
          </div>
          <Button 
            variant={platform.status === 'connected' ? 'secondary' : 'primary'} 
            size="sm"
            onClick={() => handleToggleConnection(platform.name, platform.status)}
            className={platform.status === 'connected' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}
          >
            {platform.status === 'connected' ? 'Отключить' : 'Подключить'}
          </Button>
        </div>
      ))}
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="flex justify-between items-start relative z-10">
           <div>
             <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Текущий план</div>
             <h2 className="text-3xl font-bold">Pro Team</h2>
             <p className="text-slate-400 text-sm mt-1">Следующее списание 14 Января 2026</p>
           </div>
           <Badge variant="blue">Active</Badge>
         </div>

         <div className="mt-8 relative z-10">
            <div className="flex justify-between text-sm mb-2 font-medium">
               <span className="text-slate-300">Использовано токенов</span>
               <span>84%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
               <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full w-[84%] shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
            </div>
            <div className="mt-2 text-xs text-slate-400">420,000 / 500,000 токенов</div>
         </div>
      </div>

      <h3 className="text-base font-bold text-slate-800 mt-8 mb-4">История оплат</h3>
      <Card className="p-0 overflow-hidden">
         <table className="w-full text-sm text-left">
           <thead className="bg-white/40 border-b border-white/40 text-xs uppercase text-slate-500 font-semibold">
             <tr>
               <th className="px-4 py-3">Дата</th>
               <th className="px-4 py-3">Сумма</th>
               <th className="px-4 py-3">Статус</th>
               <th className="px-4 py-3">Чек</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {[1, 2, 3].map((i) => (
               <tr key={i} className="hover:bg-white/40 transition-colors">
                 <td className="px-4 py-3 text-slate-700">14 Дек 2025</td>
                 <td className="px-4 py-3 font-bold text-slate-800">$29.00</td>
                 <td className="px-4 py-3"><Badge variant="success">Paid</Badge></td>
                 <td className="px-4 py-3 text-indigo-600 hover:underline cursor-pointer">PDF</td>
               </tr>
             ))}
           </tbody>
         </table>
      </Card>
    </div>
  );

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Настройки</h1>
        <Button onClick={handleSave} isLoading={isLoading} className="shadow-indigo-500/25">
          <Save size={16} className="mr-2" /> Сохранить
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1 p-2 h-fit">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-600 hover:bg-slate-100/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="mt-4 pt-4 border-t border-slate-100 px-2">
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Выйти
            </button>
          </div>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card className="p-6 min-h-[500px]">
            {activeTab === 'general' && renderGeneral()}
            {activeTab === 'ai' && renderAI()}
            {activeTab === 'integrations' && renderIntegrations()}
            {activeTab === 'billing' && renderBilling()}
          </Card>
        </div>
      </div>

      {/* Connect Integration Modal */}
      <Modal
        isOpen={!!connectingPlatform}
        onClose={() => setConnectingPlatform(null)}
        title={`Подключение ${connectingPlatform}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConnectingPlatform(null)}>Отмена</Button>
            <Button onClick={confirmConnection}>Подключить</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-2">Введите API ключ для интеграции с {connectingPlatform}.</p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/50 text-xs text-slate-500 mb-2 flex gap-2">
            <Key size={14} className="mt-0.5 flex-shrink-0" />
            <span>Вы можете найти ключ в настройках разработчика на платформе {connectingPlatform}.</span>
          </div>
          <Input label="API Key / Access Token" placeholder="sk_..." />
          <Input label="Client Secret (Optional)" type="password" />
        </div>
      </Modal>

      {/* Settings Page Logout Confirmation */}
      <Modal 
          isOpen={showLogoutConfirm} 
          onClose={() => setShowLogoutConfirm(false)}
          title="Выход из системы"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>Отмена</Button>
              <Button variant="danger" onClick={() => { setShowLogoutConfirm(false); onLogout(); }}>Выйти</Button>
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
  );
};