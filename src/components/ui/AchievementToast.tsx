'use client';

import React from 'react';
import { useAchievements } from '@/context/AchievementContext';
import { Trophy, X, Sparkles } from 'lucide-react';

export function AchievementToast() {
  const { activeToast, dismissToast } = useAchievements();

  if (!activeToast) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label={`Achievement Unlocked: ${activeToast.title}`}
      className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full pointer-events-auto animate-slideInRight"
    >
      <div className="bg-[#19444A] text-white rounded-2xl p-4 shadow-2xl border-2 border-[#FFC679] relative overflow-hidden backdrop-blur-md">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#FFC679]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3 relative z-10">
          {/* Trophy Icon Badge */}
          <div className="w-12 h-12 rounded-xl bg-[#FFC679] flex items-center justify-center shrink-0 shadow-md">
            <Trophy className="w-6 h-6 text-[#19444A]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC679] animate-pulse" />
              <span className="font-nunito font-black text-[11px] uppercase tracking-wider text-[#FFC679]">
                Achievement Unlocked!
              </span>
            </div>

            <h4 className="font-nunito font-black text-base text-white truncate leading-tight">
              {activeToast.title}
            </h4>

            <p className="font-roboto text-xs text-white/80 line-clamp-2 mt-0.5 leading-snug">
              {activeToast.description}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 font-nunito font-black text-xs text-[#FFC679]">
                +{activeToast.xpReward} XP
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={dismissToast}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss achievement notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Animated duration progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div className="h-full bg-[#FFC679] animate-progressShrink" />
        </div>
      </div>
    </aside>
  );
}
