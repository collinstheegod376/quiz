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
      'bg-[#E5E3DB] dark:bg-[#2A2929] text-[#000000] dark:text-[#FEFEFD] border-[#CECCC5] dark:border-[#363535] font-extrabold',
    arena:
      'bg-[#EBDAC3] text-[#000000] border-[#000000]/20 font-black tracking-wider shadow-sm',
    success:
      'bg-[#4CA471]/15 text-[#23616A] dark:text-[#4CA471] border-[#4CA471]/30 font-extrabold',
    warning:
      'bg-[#B9843E]/15 text-[#B9843E] border-[#B9843E]/30 font-extrabold',
    danger:
      'bg-[#FF94AB]/25 text-[#000000] dark:text-[#FF94AB] border-[#FF94AB]/40 font-extrabold',
    info:
      'bg-[#23616A]/15 text-[#23616A] dark:text-[#00AFC6] border-[#23616A]/30 font-extrabold',
    outline:
      'bg-transparent text-[#000000] dark:text-[#FEFEFD] border-[#CECCC5] dark:border-[#363535] font-extrabold',
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
