import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
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
  const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 focus:ring-primary-500",
    secondary: "bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 focus:ring-teal-500",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 focus:ring-red-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', icon, ...props }) => {
  return (
    <div className="w-full space-y-1.5 group">
      <label className="text-sm font-medium text-slate-700 ml-1 group-focus-within:text-primary-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <input
          className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
            icon ? 'pl-10' : ''
          } ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
              : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-primary-100'
          } ${className}`}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium ml-1 animate-slide-up">{error}</p>}
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }> = ({ 
  children, 
  className = '',
  title,
  action
}) => (
  <div className={`rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {(title || action) && (
      <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'neutral' | 'risk' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200 ring-green-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    danger: 'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20',
    risk: 'bg-red-50 text-red-700 border-red-200 ring-red-500/20'
  };
  
  // Auto-detect risk for convenience, but allow override
  let finalVariant = styles[variant as keyof typeof styles] || styles.neutral;
  if (children === 'At Risk') finalVariant = styles.danger;
  if (children === 'Not At Risk' || children === 'Safe') finalVariant = styles.success;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${finalVariant}`}>
      {children}
    </span>
  );
};