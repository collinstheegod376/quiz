'use client';

import React from 'react';
import { sound } from '@/lib/sound';

export interface QuizButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'green' | 'cyan' | 'cream' | 'coral' | 'yellow' | 'white';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function QuizButton({
  children,
  color = 'green',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  disabled,
  ...props
}: QuizButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.playClick();
    if (onClick) onClick(e);
  };

  const bgColors = {
    green: '#00A76D',
    cyan: '#6FEEFF',
    cream: '#EBDAC3',
    coral: '#FFA7A0',
    yellow: '#FFC679',
    white: '#FFFAE6',
  };

  const textColors = {
    green: 'text-white',
    cyan: 'text-black',
    cream: 'text-black',
    coral: 'text-black',
    yellow: 'text-black',
    white: 'text-black',
  };

  const sizeClasses = {
    sm: 'h-9 px-4 text-sm min-w-[5.5rem]',
    md: 'h-11 md:h-12 px-6 text-base min-w-[7rem] md:min-w-[10rem]',
    lg: 'h-12 md:h-14 px-8 text-lg min-w-[9rem] md:min-w-[12rem]',
  };

  const selectedBg = bgColors[color] || bgColors.green;
  const selectedText = textColors[color] || 'text-white';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex group touch-manipulation cursor-pointer pointer-events-auto whitespace-nowrap font-bold select-none transition-transform duration-75 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${selectedText} ${sizeClasses[size]} ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
      style={{ borderRadius: 0 }}
      {...props}
    >
      {/* Outer 3D Black Border container */}
      <div
        className="absolute inset-x-0 top-0 bottom-0 transform group-active:translate-y-0.5 group-active:bottom-0.5 z-0 bg-black dark:bg-[#1E1D1D] rounded-full p-[3px] transition-all"
      >
        <div className="relative w-full h-full rounded-full overflow-hidden">
          {/* Bottom shadow undercut layer */}
          <div
            className="top-1 absolute inset-x-0 bottom-0 rounded-full overflow-hidden"
            style={{ backgroundColor: selectedBg }}
          >
            <div className="bg-black bg-opacity-30 absolute inset-0" />
          </div>

          {/* Top highlight button face */}
          <div
            className="bottom-1 absolute inset-x-0 top-0 rounded-full overflow-hidden group-active:bottom-0.5 transition-all"
            style={{ backgroundColor: selectedBg }}
          >
            <div className="bg-white bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Button Content Label */}
      <div className="relative flex flex-row items-center justify-center w-full min-h-full pointer-events-none z-1 transform -translate-y-0.5 group-active:translate-y-0 px-2">
        <span className="font-nunito font-black leading-none tracking-[0.02em]">{children}</span>
      </div>
    </button>
  );
}
