'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  Plus,
  LogIn,
  Trophy,
  Compass,
  Home,
  User,
  Settings,
} from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#0B0C10]/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="text-left font-display">
            <div className="text-lg font-black tracking-wider text-slate-900 dark:text-white flex items-center">
              QUIZ<span className="text-red-600 mx-0.5">//</span>ARENA
            </div>
            <span className="text-[10px] tracking-widest text-slate-500 dark:text-slate-400 font-bold uppercase block -mt-1">
              Live Multiplayer
            </span>
          </div>
        </button>

        {/* Navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={() => setCurrentView('landing')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'landing'
                ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>
          <button
            onClick={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
                return;
              }
              setCurrentView('categories');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'categories' || currentView === 'topics' || currentView === 'difficulty'
                ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Categories
          </button>
          <button
            onClick={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
                return;
              }
              setIsGlobalLeaderboardOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboards
          </button>
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Room quick controls - Option 3 Minimalist Style */}
          {room && currentPlayer && (currentView === 'lobby' || currentView === 'game') ? (
            <button
              onClick={() => setCurrentView(room.status === 'LOBBY' ? 'lobby' : 'game')}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-xs cursor-pointer group"
              title="Click to view Arena"
            >
              <span className="text-slate-500 dark:text-slate-400 font-medium">Room</span>
              <span className="font-mono font-black text-slate-900 dark:text-white tracking-wider text-xs sm:text-sm">
                {room.code}
              </span>
              <span className="text-slate-300 dark:text-slate-700 mx-0.5">•</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    room.status === 'LOBBY'
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                      : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse'
                  }`}
                />
                <span
                  className={`font-semibold text-xs ${
                    room.status === 'LOBBY'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {room.status === 'LOBBY' ? 'Lobby' : 'Live'}
                </span>
              </span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                    return;
                  }
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
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Create Room
              </Button>
            </div>
          )}

          {/* User profile avatar & settings trigger */}
          {currentUser ? (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800 hover:opacity-85 transition-opacity"
              title="Open Settings"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-red-500/40 text-slate-600 dark:text-slate-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
                {currentUser.username}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
