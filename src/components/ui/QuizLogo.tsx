'use client';

import React from 'react';

export function QuizLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <div className="flex items-center px-3 py-1 bg-white rounded-full border-[2.5px] border-black shadow-[0_2px_0_0_#000]">
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#7C3AED] tracking-tight">A</span>
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#FF6B8A] tracking-tight">n</span>
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#00AFC6] tracking-tight">i</span>
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#F59E0B] tracking-tight">Z</span>
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#4CA471] tracking-tight">u</span>
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#7C3AED] tracking-tight">k</span>
        <span className="font-nunito font-black text-xl sm:text-2xl text-[#FF6B8A] tracking-tight">i</span>
        <span className="font-nunito font-black text-xs sm:text-sm text-black/50 ml-0.5 tracking-tight">.sbs</span>
      </div>
    </div>
  );
}
