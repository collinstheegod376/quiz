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
      'inline-flex items-center justify-center font-black transition-all duration-200 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed select-none active:scale-[0.98] tracking-wide cursor-pointer';

    const variants = {
      primary:
        'bg-[#EBDAC3] hover:bg-[#E5E3DB] text-[#000000] border border-[#000000]/20 dark:border-[#EBDAC3]/30 shadow-sm rounded-full font-black',
      arena:
        'bg-[#EBDAC3] hover:bg-[#dfcdb5] text-[#000000] border border-[#000000]/30 shadow-md rounded-full font-black',
      secondary:
        'bg-[#E5E3DB] hover:bg-[#d8d6cd] text-[#000000] dark:bg-[#2A2929] dark:hover:bg-[#363535] dark:text-[#FEFEFD] rounded-full border border-[#CECCC5] dark:border-[#363535]',
      outline:
        'bg-transparent hover:bg-[#E5E3DB]/50 dark:hover:bg-[#1E1D1D] text-[#000000] dark:text-[#FEFEFD] border border-[#CECCC5] dark:border-[#363535] rounded-full',
      ghost:
        'bg-transparent hover:bg-[#E5E3DB]/40 dark:hover:bg-[#2A2929]/50 text-[#595955] dark:text-[#A4A3A3] hover:text-[#000000] dark:hover:text-[#FEFEFD] rounded-full',
      danger:
        'bg-[#FF94AB] hover:bg-[#ff7a97] text-[#000000] shadow-sm rounded-full font-black border border-[#000000]/20',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-full',
      md: 'text-sm px-5 py-2.5 gap-2 rounded-full',
      lg: 'text-base px-7 py-3 gap-2.5 font-black rounded-full',
      xl: 'text-lg px-8 py-3.5 gap-3 font-black rounded-full',
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
