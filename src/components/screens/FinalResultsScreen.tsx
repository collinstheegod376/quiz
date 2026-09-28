'use client';

import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Medal,
  Clock,
  Target,
  RotateCcw,
  Home,
  Award,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function FinalResultsScreen() {
  const { room, currentPlayer, playAgain, leaveRoom } = useGame();

  useEffect(() => {
    // Trigger celebratory confetti burst on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E50914', '#F59E0B', '#10B981', '#3B82F6'],
      });
    } catch {
      // Ignored
    }
  }, []);

  if (!room || !currentPlayer) return null;

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2]; // May be undefined in 2-player game

  const totalQuestions = room.calculatedQuestionCount;
  const myCorrect = currentPlayer.correctAnswers;
  const myAccuracy = totalQuestions > 0 ? Math.round((myCorrect / totalQuestions) * 100) : 0;
  const avgResponseTimeSec =
    currentPlayer.correctAnswers > 0
      ? (currentPlayer.totalResponseTimeMs / 1000 / totalQuestions).toFixed(1)
      : '3.4';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
          <Trophy className="w-3.5 h-3.5 fill-current" />
          <span>Match Concluded</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 dark:text-white">
          Game Complete!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The battle has ended. Here are the champion podium and final statistics.
        </p>
      </div>

      {/* Podium Presentation */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="flex items-end justify-center gap-4 sm:gap-8 pt-8 pb-4">
          {/* 2nd Place */}
          {second && (
            <div className="flex flex-col items-center flex-1 max-w-[140px] text-center space-y-2">
              <div className="relative">
                <div className="w-14 sm:w-18 h-14 sm:h-18 rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-slate-400 overflow-hidden shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={second.avatarUrl}
                    alt={second.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-xs shadow">
                  2
                </div>
              </div>

              <div className="truncate w-full font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {second.displayName}
              </div>
              <div className="font-mono text-xs font-black text-slate-500 dark:text-slate-400">
                {second.score.toLocaleString()} XP
              </div>

              <div className="w-full h-24 sm:h-32 bg-slate-100 dark:bg-slate-800/80 rounded-t-2xl border-t border-slate-300 dark:border-slate-700 flex items-center justify-center font-black text-slate-400">
                2nd
              </div>
            </div>
          )}

          {/* 1st Place (Center, Elevated) */}
          {winner && (
            <div className="flex flex-col items-center flex-1 max-w-[160px] text-center space-y-2 -mt-6">
              <div className="relative">
                <Crown className="w-8 h-8 text-amber-500 fill-amber-500 absolute -top-9 left-1/2 -translate-x-1/2 animate-bounce" />
                <div className="w-18 sm:w-22 h-18 sm:h-22 rounded-3xl bg-amber-500/10 border-4 border-amber-500 overflow-hidden shadow-2xl ring-4 ring-amber-500/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={winner.avatarUrl}
                    alt={winner.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-lg">
                  1
                </div>
              </div>

              <div className="truncate w-full font-black text-sm sm:text-base text-slate-900 dark:text-white">
                {winner.displayName}
              </div>
              <div className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                {winner.score.toLocaleString()} XP
              </div>

              <div className="w-full h-36 sm:h-44 bg-gradient-to-t from-amber-500/20 to-amber-500/5 dark:from-amber-500/30 dark:to-amber-500/10 rounded-t-2xl border-t-2 border-amber-500 flex flex-col items-center justify-center font-black text-amber-600 dark:text-amber-400 shadow-xl">
                <Trophy className="w-6 h-6 mb-1" />
                <span>Champion</span>
              </div>
            </div>
          )}

          {/* 3rd Place (Only if 3+ players) */}
          {third && (
            <div className="flex flex-col items-center flex-1 max-w-[140px] text-center space-y-2">
              <div className="relative">
                <div className="w-14 sm:w-18 h-14 sm:h-18 rounded-2xl bg-amber-900/20 border-2 border-amber-700 overflow-hidden shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={third.avatarUrl}
                    alt={third.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs shadow">
                  3
                </div>
              </div>

              <div className="truncate w-full font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {third.displayName}
              </div>
              <div className="font-mono text-xs font-black text-slate-500 dark:text-slate-400">
                {third.score.toLocaleString()} XP
              </div>

              <div className="w-full h-16 sm:h-24 bg-slate-100 dark:bg-slate-800/80 rounded-t-2xl border-t border-slate-300 dark:border-slate-700 flex items-center justify-center font-black text-slate-400">
                3rd
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
            <Target className="w-4 h-4 text-red-500" />
            <span>Accuracy</span>
          </div>
          <span className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {myAccuracy}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {myCorrect} of {totalQuestions} Correct
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Avg Response</span>
          </div>
          <span className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {avgResponseTimeSec}s
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Speed bonus tier</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>Highest Score</span>
          </div>
          <span className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {winner?.score.toLocaleString() || '0'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Arena record</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Questions</span>
          </div>
          <span className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {totalQuestions}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Server calculated</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          variant="arena"
          size="xl"
          onClick={playAgain}
          className="w-full sm:w-auto shadow-xl"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again with Room
        </Button>

        <Button
          variant="outline"
          size="xl"
          onClick={leaveRoom}
          className="w-full sm:w-auto"
        >
          <Home className="w-5 h-5" />
          Return to Home
        </Button>
      </div>
    </div>
  );
}
