'use client';

import React, { useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';
import {
  Clock,
  Lock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export function QuestionScreen() {
  const {
    room,
    currentPlayer,
    currentQuestion,
    localQuestionIndex,
    isLocalReveal,
    selectedOption,
    isAnswerSubmitted,
    submitAnswer,
    timerSeconds,
  } = useGame();

  const currentTopic = useMemo(() => {
    if (!room) return null;
    return TOPICS.find((t) => t.id === room.topicId) || TOPICS[0];
  }, [room]);

  const currentCategory = useMemo(() => {
    if (!room) return null;
    return CATEGORIES.find((c) => c.id === room.categoryId) || CATEGORIES[0];
  }, [room]);

  if (!room || !currentQuestion || !currentPlayer) return null;

  const currentQNum = localQuestionIndex + 1;
  const totalQ = room.calculatedQuestionCount;
  const isReveal = isLocalReveal;
  const isTimeCritical = timerSeconds <= 4;

  const options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }> = [
    { key: 'A', label: currentQuestion.optionA },
    { key: 'B', label: currentQuestion.optionB },
    { key: 'C', label: currentQuestion.optionC },
    { key: 'D', label: currentQuestion.optionD },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Top Match Progress & Timer Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="arena">
            {currentCategory?.name} • {currentTopic?.name}
          </Badge>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Level {room.difficultyLevel.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Question Counter & Timer */}
        <div className="flex items-center justify-between sm:justify-end gap-6">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Question{' '}
            <span className="text-red-600 dark:text-red-400 text-sm font-black font-display">
              {currentQNum.toString().padStart(2, '0')}
            </span>{' '}
            / {totalQ.toString().padStart(2, '0')}
          </div>

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-base font-black transition-all ${
              isReveal
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : isTimeCritical
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeCritical && !isReveal ? 'text-red-600' : 'text-slate-400'}`} />
            <span>{isReveal ? 'REVEAL' : `00:${timerSeconds.toString().padStart(2, '0')}`}</span>
          </div>
        </div>
      </div>

      {/* Timer Progress Track */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isReveal ? 'bg-emerald-500' : isTimeCritical ? 'bg-red-600 animate-pulse' : 'bg-red-500'
          }`}
          style={{ width: `${isReveal ? 100 : (timerSeconds / room.timePerQuestion) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <HelpCircle className="w-4 h-4 text-red-500" />
            {isReveal ? 'Round Result & Reveal' : 'Answer Submission'}
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display text-slate-900 dark:text-white leading-relaxed tracking-tight">
            {currentQuestion.questionText}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => {
          const isUserPick = selectedOption === opt.key;
          const isCorrect = currentQuestion.correctOption === opt.key;

          let buttonStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md active:scale-[0.99] cursor-pointer';
          let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700';

          if (isReveal) {
            if (isUserPick && isCorrect) {
              // User chose this and was CORRECT
              buttonStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/50 shadow-lg scale-[1.01]';
              badgeStyle = 'bg-emerald-500 text-white font-bold';
            } else if (isUserPick && !isCorrect) {
              // User chose this and was WRONG
              buttonStyle = 'border-red-500 bg-red-500/15 text-red-900 dark:text-red-100 ring-2 ring-red-500/50 opacity-90';
              badgeStyle = 'bg-red-500 text-white font-bold';
            } else if (!isUserPick && isCorrect) {
              // Correct option, but user did NOT pick this
              buttonStyle = 'border-emerald-500/60 bg-emerald-500/5 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30';
              badgeStyle = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold';
            } else {
              // Other options
              buttonStyle = 'border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 opacity-30 cursor-not-allowed';
              badgeStyle = 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400';
            }
          } else {
            if (isUserPick) {
              buttonStyle = 'border-red-600 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100 ring-2 ring-red-500/40 shadow-lg';
              badgeStyle = 'bg-red-600 text-white';
            } else if (isAnswerSubmitted) {
              buttonStyle = 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 opacity-50 cursor-not-allowed';
            }
          }

          return (
            <button
              key={opt.key}
              disabled={isAnswerSubmitted || isReveal}
              onClick={() => submitAnswer(opt.key)}
              className={`group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 ${buttonStyle}`}
            >
              {/* Option Letter Badge */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 transition-colors ${badgeStyle}`}
              >
                {opt.key}
              </div>

              {/* Option Text */}
              <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex-1 leading-snug">
                {opt.label}
              </span>

              {/* Reveal badges & indicators */}
              {isReveal ? (
                isUserPick && isCorrect ? (
                  <div className="shrink-0 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Your Pick (Correct)</span>
                  </div>
                ) : isUserPick && !isCorrect ? (
                  <div className="shrink-0 flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-lg">
                    <XCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Your Pick</span>
                  </div>
                ) : isCorrect ? (
                  <div className="shrink-0 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct Answer</span>
                  </div>
                ) : null
              ) : isUserPick ? (
                <div className="shrink-0 text-red-600 dark:text-red-400">
                  <CheckCircle2 className="w-5 h-5 fill-current/20" />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Participation & Status Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
            <Zap className="w-4 h-4 fill-current" />
            <span>{currentPlayer.score.toLocaleString()} XP</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{room.players.length} in Arena</span>
          </div>
        </div>

        {isReveal ? (
          selectedOption ? (
            selectedOption === currentQuestion.correctOption ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Option {selectedOption} Locked • +XP Awarded!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                <XCircle className="w-3.5 h-3.5" />
                <span>Option {selectedOption} Selected • Incorrect</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Expired • No Option Selected</span>
            </div>
          )
        ) : isAnswerSubmitted ? (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5" />
            <span>Option {selectedOption} Locked • Waiting for rivals</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Tap an option to submit your answer</span>
          </div>
        )}
      </div>
    </div>
  );
}
