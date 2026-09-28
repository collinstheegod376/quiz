'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'arena';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      sound.playClick();
      if (onClick) onClick(e);
    };

    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25 focus:ring-red-500 rounded-xl',
      arena:
        'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-xl shadow-red-600/30 border border-red-500/30 focus:ring-red-500 rounded-xl font-semibold tracking-wide',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus:ring-slate-400 rounded-xl border border-slate-200 dark:border-slate-700',
      outline:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 focus:ring-slate-400 rounded-xl',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-slate-400 rounded-xl',
      danger:
        'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 focus:ring-rose-500 rounded-xl',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5 font-medium',
      xl: 'text-lg px-8 py-4 gap-3 font-semibold rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
