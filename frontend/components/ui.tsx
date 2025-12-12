import React, { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg active:scale-95";
  
  const variants = {
    // Electric Violet Gradient
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 border border-indigo-400/20 shadow-md shadow-indigo-500/20",
    
    // Rich Gradient
    gradient: "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 border-none",

    // Glassy White
    secondary: "bg-white/40 text-slate-800 hover:bg-white/60 border border-white/60 backdrop-blur-md shadow-sm hover:shadow-md",
    
    // Subtle Outline
    outline: "border border-slate-400/30 bg-transparent hover:bg-white/20 text-slate-700 hover:text-slate-900",
    
    // Ghost
    ghost: "bg-transparent hover:bg-white/30 text-slate-600 hover:text-slate-900",
    
    // Danger Gradient
    danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-400 hover:to-pink-500 shadow-red-500/30 shadow-md",
    
    // Pure Glass
    glass: "bg-white/10 hover:bg-white/20 text-slate-700 border border-white/30 backdrop-blur-md shadow-sm"
  };

  // Compact sizes
  const sizes = {
    sm: "h-7 px-2.5 text-xs",
    md: "h-9 px-4 py-1.5 text-sm",
    lg: "h-11 px-6 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
      {children}
    </button>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  // Reduced rounded corners to xl
  <div className={`bg-white/60 backdrop-blur-2xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden ${className}`}>
    {/* Optional internal shine */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-50"></div>
    <div className="relative z-10 h-full">
      {children}
    </div>
  </div>
);

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'neutral' | 'blue' | 'purple'; className?: string }> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    success: "bg-emerald-100/60 text-emerald-700 border border-emerald-200/50",
    warning: "bg-amber-100/60 text-amber-700 border border-amber-200/50",
    neutral: "bg-slate-100/60 text-slate-700 border border-slate-200/50",
    blue: "bg-cyan-100/60 text-cyan-700 border border-cyan-200/50",
    purple: "bg-fuchsia-100/60 text-fuchsia-700 border border-fuchsia-200/50",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold backdrop-blur-sm shadow-sm ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="w-full group">
    {label && <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-wide opacity-80">{label}</label>}
    <div className="relative">
      <input 
        className={`block w-full rounded-lg border-white/50 bg-white/40 backdrop-blur-xl shadow-inner focus:shadow-lg focus:shadow-indigo-500/10 focus:bg-white/70 text-sm border px-3 py-2 transition-all duration-300 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 ${className}`}
        {...props}
      />
      {/* Bottom gradient line on focus */}
      <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-gradient-to-r from-violet-500 to-fuchsia-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
    </div>
  </div>
);

// --- ProgressBar ---
export const ProgressBar: React.FC<{ progress: number; colorClass?: string }> = ({ progress, colorClass = "bg-gradient-to-r from-violet-500 to-fuchsia-500" }) => (
  <div className="w-full bg-slate-200/50 rounded-full h-1.5 backdrop-blur-sm overflow-hidden shadow-inner">
    <div className={`${colorClass} h-1.5 rounded-full transition-all duration-1000 ease-out shadow-lg`} style={{ width: `${progress}%` }}></div>
  </div>
);

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl overflow-hidden animate-fade-in scale-100 transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 text-slate-600">
          {children}
        </div>
        
        {footer && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-200/50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};