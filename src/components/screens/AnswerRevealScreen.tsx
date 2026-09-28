'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import {
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function AnswerRevealScreen() {
  const {
    room,
    currentPlayer,
    currentQuestion,
    lastRevealResult,
    advanceToNextState,
  } = useGame();

  if (!room || !lastRevealResult || !currentQuestion || !currentPlayer) return null;

  const {
    isCorrect,
    correctOption,
    pointsAwarded,
    timeBonus,
    basePoints,
    explanation,
    rank,
    previousRank,
    newScore,
  } = lastRevealResult;

  const correctText =
    correctOption === 'A'
      ? currentQuestion.optionA
      : correctOption === 'B'
      ? currentQuestion.optionB
      : correctOption === 'C'
      ? currentQuestion.optionC
      : currentQuestion.optionD;

  const rankDelta = previousRank - rank; // positive means improved

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Result Status Banner */}
      <div
        className={`p-8 sm:p-10 rounded-3xl text-center border shadow-2xl relative overflow-hidden transition-all ${
          isCorrect
            ? 'bg-gradient-to-b from-emerald-500/15 to-transparent border-emerald-500/30'
            : 'bg-gradient-to-b from-rose-500/15 to-transparent border-rose-500/30'
        }`}
      >
        {/* Glow circle */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[100px] pointer-events-none -z-10 ${
            isCorrect ? 'bg-emerald-500/20' : 'bg-rose-500/20'
          }`}
        />

        <div className="flex flex-col items-center space-y-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              isCorrect
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-rose-500 text-white shadow-rose-500/30'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-10 h-10" />
            ) : (
              <XCircle className="w-10 h-10" />
            )}
          </div>

          <h2
            className={`text-3xl sm:text-4xl font-black font-display tracking-wider uppercase ${
              isCorrect ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {isCorrect ? 'CORRECT!' : 'INCORRECT'}
          </h2>

          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            {isCorrect ? `+${pointsAwarded.toLocaleString()} XP` : '+0 XP'}
          </div>

          {isCorrect && timeBonus > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Bonus: +{timeBonus} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Correct Answer Display Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          The Correct Answer is:
        </span>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-display font-black text-sm shrink-0">
            {correctOption}
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {correctText}
          </span>
        </div>

        {/* Explanation */}
        <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-700 dark:text-slate-300">Explanation: </span>
          {explanation}
        </div>
      </div>

      {/* Stats Summary Row: Score, Rank, Rank movement */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Score
          </span>
          <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white mt-1 block">
            {newScore.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Your Rank
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white">
              #{rank}
            </span>
            {rankDelta > 0 && (
              <span className="text-xs font-bold text-emerald-500 flex items-center">
                <TrendingUp className="w-3.5 h-3.5" />
                +{rankDelta}
              </span>
            )}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Base XP
          </span>
          <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white mt-1 block">
            +{basePoints}
          </span>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <Button
          variant="arena"
          size="xl"
          onClick={advanceToNextState}
          className="w-full shadow-2xl"
        >
          <Trophy className="w-5 h-5" />
          View Live Leaderboard
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
