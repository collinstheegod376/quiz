'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Home, Compass, Trophy, Plus, LogIn, User, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  const {
    currentView,
    setCurrentView,
    room,
    currentPlayer,
    setIsCreateModalOpen,
    setIsJoinModalOpen,
    setIsGlobalLeaderboardOpen,
  } = useGame();
  const { currentUser, setIsSettingsModalOpen, setIsAuthModalOpen } = useAuth();

  const navLinks = [
    { label: 'Home', view: 'landing' as const, icon: Home },
    { label: 'Categories', view: 'categories' as const, icon: Compass },
    { label: 'Leaderboard', view: null, icon: Trophy },
  ];

  const handleNavClick = (view: 'landing' | 'categories' | null) => {
    if (view === null) {
      // Leaderboard
      if (!currentUser) { setIsAuthModalOpen(true); return; }
      setIsGlobalLeaderboardOpen(true);
      return;
    }
    if (view === 'categories' && !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  const isActiveView = (view: 'landing' | 'categories' | null) => {
    if (view === 'landing') return currentView === 'landing';
    if (view === 'categories') return ['categories', 'topics', 'difficulty'].includes(currentView);
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF4] dark:bg-[#100F0F] border-b border-[#CECCC5] dark:border-[#363535] transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 group focus:outline-none shrink-0"
        >
          <div className="w-9 h-9 flex items-center justify-center bg-[#EBDAC3] border border-[#000000]/20 dark:border-[#EBDAC3]/30">
            {/* Q logo mark */}
            <span className="font-nunito font-black text-[#000000] text-base leading-none tracking-tight">Q</span>
          </div>
          <span className="font-nunito font-black text-[18px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.6px] leading-none">
            Quiz<span className="text-[#23616A]">Arena</span>
          </span>
        </button>

        {/* Desktop Category Navigation */}
        <nav className="hidden md:flex items-end gap-0 h-full pt-1">
          {navLinks.map(({ label, view, icon: Icon }) => {
            const active = isActiveView(view);
            return (
              <button
                key={label}
                onClick={() => handleNavClick(view)}
                className={`relative flex items-center gap-1.5 px-4 h-full pb-0 font-nunito font-extrabold text-[16px] tracking-[0.48px] leading-[1.36] transition-colors focus:outline-none ${
                  active
                    ? 'text-[#000000] dark:text-[#FEFEFD]'
                    : 'text-[#595955] dark:text-[#A4A3A3] hover:text-[#000000] dark:hover:text-[#FEFEFD]'
                }`}
              >
                {label}
                {/* Active underline indicator */}
                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#000000] dark:bg-[#FEFEFD]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Room status indicator */}
          {room && currentPlayer && (currentView === 'lobby' || currentView === 'game') ? (
            <button
              onClick={() => setCurrentView(room.status === 'LOBBY' ? 'lobby' : 'game')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#CECCC5] dark:border-[#363535] hover:border-[#000000] dark:hover:border-[#FEFEFD] transition-all text-xs cursor-pointer"
            >
              <span className="font-nunito font-extrabold text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px]">
                {room.code}
              </span>
              <span className="text-[#CECCC5] dark:text-[#363535]">•</span>
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  room.status === 'LOBBY'
                    ? 'bg-[#B9843E]'
                    : 'bg-[#4CA471] animate-pulse'
                }`}
              />
              <span className="font-nunito font-extrabold text-[#000000] dark:text-[#FEFEFD]">
                {room.status === 'LOBBY' ? 'Lobby' : 'Live'}
              </span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!currentUser) { setIsAuthModalOpen(true); return; }
                  setIsJoinModalOpen(true);
                }}
              >
                <LogIn className="w-3.5 h-3.5" />
                Join
              </Button>
              <Button
                variant="arena"
                size="sm"
                onClick={() => {
                  if (!currentUser) { setIsAuthModalOpen(true); return; }
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Create Room
              </Button>
            </div>
          )}

          {/* User avatar / sign in */}
          {currentUser ? (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-2 pl-2 border-l border-[#CECCC5] dark:border-[#363535] hover:opacity-80 transition-opacity"
              title="Settings"
            >
              <div className="w-8 h-8 bg-[#E5E3DB] dark:bg-[#2A2929] flex items-center justify-center overflow-hidden border border-[#CECCC5] dark:border-[#363535]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden lg:inline font-nunito font-extrabold text-sm text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px]">
                {currentUser.username}
              </span>
              <Settings className="w-3.5 h-3.5 text-[#595955] dark:text-[#A4A3A3]" />
            </button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile bottom nav strip */}
      <div className="md:hidden flex items-center border-t border-[#CECCC5] dark:border-[#363535] overflow-x-auto">
        {navLinks.map(({ label, view, icon: Icon }) => {
          const active = isActiveView(view);
          return (
            <button
              key={label}
              onClick={() => handleNavClick(view)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 font-nunito font-extrabold text-[14px] tracking-[0.42px] whitespace-nowrap transition-colors ${
                active
                  ? 'text-[#000000] dark:text-[#FEFEFD]'
                  : 'text-[#595955] dark:text-[#A4A3A3]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#000000] dark:bg-[#FEFEFD]" />
              )}
            </button>
          );
        })}

        {/* Mobile Create/Join */}
        {!(room && currentPlayer) && (
          <div className="ml-auto flex items-center gap-1 px-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!currentUser) { setIsAuthModalOpen(true); return; }
                setIsJoinModalOpen(true);
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="arena"
              size="sm"
              onClick={() => {
                if (!currentUser) { setIsAuthModalOpen(true); return; }
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
