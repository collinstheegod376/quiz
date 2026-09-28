'use client';

import React, { useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { TOPICS } from '@/data/topics';
import { DIFFICULTY_LEVELS } from '@/data/categories';
import {
  ArrowLeft,
  Flame,
  ShieldAlert,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function DifficultyScreen() {
  const {
    selectedTopicId,
    selectedDifficultyLevel,
    setSelectedDifficultyLevel,
    setCurrentView,
    setIsCreateModalOpen,
  } = useGame();

  const currentTopic = useMemo(() => {
    return TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];
  }, [selectedTopicId]);

  const activeLevelInfo = useMemo(() => {
    return (
      DIFFICULTY_LEVELS.find((l) => l.levelNumber === selectedDifficultyLevel) ||
      DIFFICULTY_LEVELS[0]
    );
  }, [selectedDifficultyLevel]);

  const handleContinue = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={() => setCurrentView('topics')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Topics
      </button>

      {/* Topic Hero Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentTopic.imageUrl}
            alt={currentTopic.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                Selected Franchise
              </span>
              <h1 className="text-3xl sm:text-5xl font-black font-display text-white">
                {currentTopic.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {currentTopic.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
                10 Levels Available
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold tracking-wide">
                {currentTopic.questionCount} Questions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Selection Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600" />
              Select Difficulty Level
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Questions progressively increase in depth, precision, and challenge.
            </p>
          </div>

          <div className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            Level {selectedDifficultyLevel.toString().padStart(2, '0')} — {activeLevelInfo.name}
          </div>
        </div>

        {/* 10 Level Grid Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {DIFFICULTY_LEVELS.map((level) => {
            const isSelected = selectedDifficultyLevel === level.levelNumber;
            return (
              <button
                key={level.levelNumber}
                onClick={() => setSelectedDifficultyLevel(level.levelNumber)}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all text-center ${
                  isSelected
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 shadow-md ring-2 ring-red-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  LEVEL
                </span>
                <span className="text-xl sm:text-2xl font-black font-display tracking-tight">
                  {level.levelNumber.toString().padStart(2, '0')}
                </span>
                <span className="text-[11px] font-bold mt-1 tracking-wide">
                  {level.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Level Description Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Level {selectedDifficultyLevel}: {activeLevelInfo.name} Challenge
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeLevelInfo.description}
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-red-500" />
            <span>Server calculates match length dynamically (2p: 10q, 3p: 12q, 4p: 15q)</span>
          </div>

          <Button
            variant="arena"
            size="lg"
            onClick={handleContinue}
            className="w-full sm:w-auto shadow-xl"
          >
            <Zap className="w-4 h-4 fill-current" />
            Proceed to Arena Setup
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
