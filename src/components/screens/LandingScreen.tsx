'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Flame,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Compass,
  Play,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { SafeImage } from '../ui/SafeImage';

export function LandingScreen() {
  const { setCurrentView, setIsCreateModalOpen, setIsJoinModalOpen, createRoom } = useGame();
  const { globalStats, currentUser, setIsAuthModalOpen } = useAuth();

  const handleCreateRoom = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleJoinRoom = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsJoinModalOpen(true);
  };

  const handleExploreTopics = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView('categories');
  };

  const handleQuickStartOnePiece = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    createRoom(currentUser.username, 'one-piece', 5, 15, 2);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#0B0C10] text-slate-900 dark:text-[#F8FAFC] transition-colors">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 dark:bg-red-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50" />
              <span>Real-Time Multiplayer Arena</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Think fast.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-500">
                Answer faster.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              The ultimate real-time quiz game for anime, series, movies, chemistry, and physics. Compete with friends in private 2–4 player arenas, test your mastery across 10 progressive difficulty tiers, and claim the champion throne.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="arena"
                size="xl"
                onClick={handleCreateRoom}
                className="w-full sm:w-auto shadow-2xl"
              >
                <Zap className="w-5 h-5 fill-current" />
                Create Room
              </Button>

              <Button
                variant="outline"
                size="xl"
                onClick={handleJoinRoom}
                className="w-full sm:w-auto text-slate-800 dark:text-white bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Join with Code
                <ArrowRight className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="xl"
                onClick={handleExploreTopics}
                className="w-full sm:w-auto text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Compass className="w-5 h-5" />
                Explore Topics
              </Button>
            </div>

            {/* Live Progress Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-xl sm:text-2xl font-display">
                  <Users className="w-5 h-5" />
                  {globalStats.totalPlayersCount}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Combatants</div>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-bold text-xl sm:text-2xl font-display">
                  <Flame className="w-5 h-5" />
                  {globalStats.totalRoomsCreated}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Arenas Created</div>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-bold text-xl sm:text-2xl font-display">
                  <Award className="w-5 h-5" />
                  {globalStats.overallAccuracy}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Arena Accuracy</div>
              </div>
            </div>
          </div>

          {/* Right Hero Cinematic Card: Official One Piece Poster & Quick Start */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141C] group transition-all">
              {/* Poster image */}
              <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-slate-900">
                <SafeImage
                  src="https://image.tmdb.org/t/p/w500/cMD9Ygz11yjEzAeiUR954aPczfl.jpg"
                  fallbackSrc="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80"
                  alt="One Piece Official Anime Poster"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#12141C] via-white/20 dark:via-[#12141C]/40 to-transparent" />

                {/* Overlaid preview badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-semibold shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Featured Quick Match
                </div>
              </div>

              {/* Direct One Piece Quiz Launch Card */}
              <div className="p-6 bg-white dark:bg-[#12141C] border-t border-slate-200 dark:border-slate-800/80 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Instant Challenge
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/20">
                    One Piece • Level 05
                  </span>
                </div>

                <div className="text-xl font-black font-display text-slate-900 dark:text-white">
                  One Piece Grand Line Arena
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Jump straight into a 2–4 player battle testing Devil Fruits, Yonko powers, Haki, and the Void Century.
                </p>

                {/* Shortcut Action Button */}
                <Button
                  variant="arena"
                  size="lg"
                  onClick={handleQuickStartOnePiece}
                  className="w-full shadow-xl"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start One Piece Quiz Now
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Real-Time PvP Match</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-red-500" />
                    <span>2–4 Combatants</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
