import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'arena';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    arena:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-semibold tracking-wider',
    success:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium',
    warning:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium',
    danger:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium',
    info:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
