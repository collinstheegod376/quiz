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
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export function QuestionScreen() {
  const {
    room,
    currentPlayer,
    currentQuestion,
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

  const currentQNum = room.currentQuestionIndex + 1;
  const totalQ = room.calculatedQuestionCount;
  const answeredCount = room.players.filter((p) => p.hasAnswered).length;
  const totalPlayers = room.players.length;

  const options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }> = [
    { key: 'A', label: currentQuestion.optionA },
    { key: 'B', label: currentQuestion.optionB },
    { key: 'C', label: currentQuestion.optionC },
    { key: 'D', label: currentQuestion.optionD },
  ];

  const isTimeCritical = timerSeconds <= 5;

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
              isTimeCritical
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-red-600' : 'text-slate-400'}`} />
            <span>00:{timerSeconds.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Timer Progress Track */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isTimeCritical ? 'bg-red-600 animate-pulse' : 'bg-red-500'
          }`}
          style={{ width: `${(timerSeconds / room.timePerQuestion) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <HelpCircle className="w-4 h-4 text-red-500" />
            Answer Submission
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display text-slate-900 dark:text-white leading-relaxed tracking-tight">
            {currentQuestion.questionText}
          </h2>
        </div>
      </div>

      {/* Answer Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.key;
          return (
            <button
              key={opt.key}
              disabled={isAnswerSubmitted}
              onClick={() => submitAnswer(opt.key)}
              className={`group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-red-600 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100 ring-2 ring-red-500/40 shadow-lg'
                  : isAnswerSubmitted
                  ? 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md active:scale-[0.99] cursor-pointer'
              }`}
            >
              {/* Option Letter Badge */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                }`}
              >
                {opt.key}
              </div>

              {/* Option Text */}
              <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex-1 leading-snug">
                {opt.label}
              </span>

              {/* Selected indicator checkmark */}
              {isSelected && (
                <div className="shrink-0 text-red-600 dark:text-red-400">
                  <CheckCircle2 className="w-5 h-5 fill-current/20" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Participation & Status Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Users className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-slate-900 dark:text-white">
            {answeredCount} / {totalPlayers}
          </span>
          <span>players answered</span>
        </div>

        {isAnswerSubmitted ? (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5" />
            <span>Answer locked • Waiting for rivals</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Choose an option to submit your answer</span>
          </div>
        )}
      </div>
    </div>
  );
}
