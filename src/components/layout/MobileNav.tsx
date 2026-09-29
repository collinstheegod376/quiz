'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Home, Compass, Trophy, Plus, Film } from 'lucide-react';

export function MobileNav() {
  const {
    currentView,
    setCurrentView,
    setIsCreateModalOpen,
    setIsGlobalLeaderboardOpen,
    isGlobalLeaderboardOpen,
  } = useGame();
  const { currentUser, setIsAuthModalOpen } = useAuth();

  // If in active quiz gameplay, hide bottom bar for full focus
  if (currentView === 'game') return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF4]/95 dark:bg-[#100F0F]/95 backdrop-blur-md border-t border-[#CECCC5] dark:border-[#363535] px-2 py-1 flex items-center justify-around safe-bottom select-none">
      {/* Start / Home */}
      <button
        onClick={() => setCurrentView('landing')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 font-nunito font-extrabold text-[11px] transition-colors cursor-pointer ${
          currentView === 'landing'
            ? 'text-black dark:text-[#FEFEFD]'
            : 'text-[#595955] dark:text-[#A4A3A3] opacity-70 hover:opacity-100'
        }`}
      >
        <Home className="w-4 h-4" />
        <span>Start</span>
      </button>

      {/* Entertainment */}
      <button
        onClick={() => setCurrentView('entertainment')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 font-nunito font-extrabold text-[11px] transition-colors cursor-pointer ${
          currentView === 'entertainment'
            ? 'text-black dark:text-[#FEFEFD]'
            : 'text-[#595955] dark:text-[#A4A3A3] opacity-70 hover:opacity-100'
        }`}
      >
        <Film className="w-4 h-4" />
        <span>Entertainment</span>
      </button>

      {/* Center 3D Create Button */}
      <button
        onClick={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
          }
          setIsCreateModalOpen(true);
        }}
        className="w-11 h-11 -mt-4 rounded-full bg-black dark:bg-[#1E1D1D] p-[2px] shadow-md active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
      >
        <div className="w-full h-full rounded-full bg-[#00A76D] flex items-center justify-center text-white border border-white/20">
          <Plus className="w-5 h-5" strokeWidth={3} />
        </div>
      </button>

      {/* Categories / Play */}
      <button
        onClick={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
          }
          setCurrentView('categories');
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 font-nunito font-extrabold text-[11px] transition-colors cursor-pointer ${
          currentView === 'categories' || currentView === 'topics' || currentView === 'difficulty'
            ? 'text-black dark:text-[#FEFEFD]'
            : 'text-[#595955] dark:text-[#A4A3A3] opacity-70 hover:opacity-100'
        }`}
      >
        <Compass className="w-4 h-4" />
        <span>Categories</span>
      </button>

      {/* Leaderboard */}
      <button
        onClick={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
          }
          setIsGlobalLeaderboardOpen(true);
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 font-nunito font-extrabold text-[11px] transition-colors cursor-pointer ${
          isGlobalLeaderboardOpen
            ? 'text-black dark:text-[#FEFEFD]'
            : 'text-[#595955] dark:text-[#A4A3A3] opacity-70 hover:opacity-100'
        }`}
      >
        <Trophy className="w-4 h-4" />
        <span>Rankings</span>
      </button>
    </nav>
  );
}
