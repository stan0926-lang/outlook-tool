
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-sm';
  
  // Pastel Theme Colors
  const variants = {
    primary: 'bg-indigo-400 text-white hover:bg-indigo-500 hover:shadow-md focus:ring-indigo-300 border border-transparent',
    secondary: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300',
    danger: 'bg-rose-400 text-white hover:bg-rose-500 hover:shadow-md focus:ring-rose-300 border border-transparent',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};