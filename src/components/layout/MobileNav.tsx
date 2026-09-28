'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Home, Compass, Trophy, Plus, LogIn } from 'lucide-react';

export function MobileNav() {
  const {
    currentView,
    setCurrentView,
    setIsCreateModalOpen,
    setIsJoinModalOpen,
    setIsGlobalLeaderboardOpen,
    isGlobalLeaderboardOpen,
  } = useGame();

  // If in active quiz gameplay, hide bottom bar for full focus
  if (currentView === 'game') return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0C10]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around safe-bottom">
      <button
        onClick={() => setCurrentView('landing')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
          currentView === 'landing'
            ? 'text-red-600 dark:text-red-400'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => setCurrentView('categories')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
          currentView === 'categories' || currentView === 'topics' || currentView === 'difficulty'
            ? 'text-red-600 dark:text-red-400'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span>Play</span>
      </button>

      {/* Main Action FAB */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 border-2 border-white dark:border-slate-900 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <button
        onClick={() => setIsJoinModalOpen(true)}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold text-slate-500 dark:text-slate-400"
      >
        <LogIn className="w-5 h-5" />
        <span>Join</span>
      </button>

      <button
        onClick={() => setIsGlobalLeaderboardOpen(true)}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
          isGlobalLeaderboardOpen ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span>Leaderboard</span>
      </button>
    </nav>
  );
}
