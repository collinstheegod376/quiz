'use client';

import React from 'react';

export function QuizLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Pill background border logo wrapper */}
      <div className="flex items-center px-3 py-1 bg-white dark:bg-[#1E1D1D] rounded-full border-[2.5px] border-black dark:border-white shadow-[0_2px_0_0_#000] dark:shadow-[0_2px_0_0_#FFF]">
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#23616A] tracking-tight">Q</span>
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#FFA7A0] tracking-tight">u</span>
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#00AFC6] tracking-tight">i</span>
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#FFC679] tracking-tight">z</span>
        <span className="font-nunito font-black text-sm sm:text-base text-black dark:text-white ml-0.5 tracking-tight">.com</span>
      </div>
    </div>
  );
}
