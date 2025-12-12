import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { Lock, Mail, Sparkles } from 'lucide-react';
import { useToast } from '../components/Toast';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { addToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        addToast('Ошибка входа', 'error', 'Пожалуйста, заполните все поля');
        return;
    }
    
    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      // Сохраняем токен
      localStorage.setItem('auth_token', 'mock-jwt-token-' + Date.now());
      addToast('Добро пожаловать!', 'success', 'Вы успешно вошли в систему');
      onLogin();
    }, 1500);
  };

  const handleYandexLogin = () => {
    setIsLoading(true);
    // Simulate OAuth redirect/processing
    setTimeout(() => {
      setIsLoading(false);
      // Сохраняем токен
      localStorage.setItem('auth_token', 'mock-yandex-token-' + Date.now());
      addToast('Яндекс ID подключен', 'success', 'Авторизация прошла успешно');
      onLogin();
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
        {/* Local decorations to enhance the login page specifically */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md relative z-10 perspective-1000">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl rotate-12 blur-xl opacity-50 animate-pulse"></div>
        
        <Card className="p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-white/60 backdrop-blur-2xl bg-white/70">
          <div className="text-center mb-10">
            <div className="relative inline-block mb-4">
                 <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/40 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                    AI
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                 </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">С возвращением</h1>
            <p className="text-slate-500 text-sm">Введите данные для входа в ИИ-Ньюсмейкер</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={18} />
                </div>
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-indigo-500/50 transition-all text-base" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                </div>
                <Input 
                  type="password" 
                  placeholder="Пароль" 
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-indigo-500/50 transition-all text-base" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <div className="relative flex items-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-4 h-4 border-2 border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                    <svg className="absolute w-3 h-3 text-white hidden peer-checked:block left-0.5 top-0.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-slate-500 group-hover:text-slate-700 transition-colors">Запомнить</span>
              </label>
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Забыли пароль?</a>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base shadow-indigo-500/25 font-semibold tracking-wide" 
              isLoading={isLoading}
            >
              Войти в систему
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/80 px-3 text-slate-400 font-medium uppercase tracking-widest backdrop-blur-sm">или</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleYandexLogin}
            disabled={isLoading}
            className="w-full bg-[#FC3F1D] hover:bg-[#E63514] text-white h-12 rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3 text-[#FC3F1D] font-bold text-sm font-serif">
              Я
            </div>
            <span>Войти с Яндекс ID</span>
          </button>

          <p className="text-center text-[10px] text-slate-400 mt-8 leading-relaxed">
            Нажимая "Войти", вы принимаете <a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors underline decoration-slate-300">Условия использования</a> и <a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors underline decoration-slate-300">Политику конфиденциальности</a>.
          </p>
        </Card>
        
        <div className="text-center mt-6 text-slate-500 text-xs">
            Нет аккаунта? <a href="#" className="text-indigo-600 font-bold hover:underline">Зарегистрироваться</a>
        </div>
      </div>
    </div>
  );
};