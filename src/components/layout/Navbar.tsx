'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Search, Menu, User, Settings, LogIn, Trophy } from 'lucide-react';
import { QuizLogo } from '../ui/QuizLogo';

export function Navbar() {
  const {
    setCurrentView,
    room,
    currentPlayer,
    joinRoom,
    setIsJoinModalOpen,
    setIsGlobalLeaderboardOpen,
  } = useGame();
  const { currentUser, setIsSettingsModalOpen, setIsAuthModalOpen } = useAuth();

  const [desktopPin, setDesktopPin] = useState('');

  const handleDesktopJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desktopPin.trim()) return;
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const cleanPin = desktopPin.replace(/\s+/g, '').toUpperCase();
    joinRoom(cleanPin, currentUser.username);
  };

  const handleDesktopPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (raw.length > 6) raw = raw.slice(0, 6);
    if (raw.length > 3) {
      setDesktopPin(`${raw.slice(0, 3)} ${raw.slice(3)}`);
    } else {
      setDesktopPin(raw);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF4] dark:bg-[#100F0F] border-b border-[#CECCC5] dark:border-[#363535] transition-colors">
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">

        {/* Brand Logo - Bubbly Quiz.com */}
        <button
          onClick={() => setCurrentView('landing')}
          className="focus:outline-none shrink-0 cursor-pointer"
        >
          <QuizLogo />
        </button>

        {/* Center: Desktop Salmon PIN Join Band (Visible on Desktop / PC as in Image 3) */}
        <div className="hidden lg:flex items-center">
          <form
            onSubmit={handleDesktopJoin}
            className="flex items-center gap-3 bg-[#FFA7A0] px-4 py-1.5 rounded-xl border border-black/10 shadow-sm"
          >
            <div className="flex flex-col font-nunito text-xs font-black text-black leading-none whitespace-nowrap">
              <span>Join Game?</span>
              <span className="opacity-80">Enter PIN:</span>
            </div>
            <input
              type="text"
              placeholder="123 456"
              maxLength={7}
              value={desktopPin}
              onChange={handleDesktopPinChange}
              onClick={() => {
                if (!currentUser) setIsAuthModalOpen(true);
                else setIsJoinModalOpen(true);
              }}
              className="w-28 text-center font-nunito font-extrabold text-sm rounded-full py-1 px-2 bg-white text-black border-2 border-black focus:outline-none shadow-inner tracking-wider"
            />
          </form>
        </div>

        {/* Right Actions: Search icon, Menu icon, Avatar Circle (as in Image 1 & 3) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active room live badge if participating */}
          {room && currentPlayer && (
            <button
              onClick={() => setCurrentView(room.status === 'LOBBY' ? 'lobby' : 'game')}
              className="flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-nunito font-bold rounded-full cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#4CA471] animate-pulse" />
              <span>{room.code}</span>
            </button>
          )}

          {/* Search Button */}
          <button
            type="button"
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setCurrentView('categories');
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-black dark:text-white transition-colors cursor-pointer border border-[#CECCC5] dark:border-[#363535]"
            title="Search quizzes"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Leaderboard / Menu Button */}
          <button
            type="button"
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setIsGlobalLeaderboardOpen(true);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-black dark:text-white transition-colors cursor-pointer border border-[#CECCC5] dark:border-[#363535]"
            title="Leaderboard / Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* User Profile Avatar Circle */}
          {currentUser ? (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-black dark:border-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
              title={`${currentUser.username} (Settings)`}
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
              title="Sign In"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
