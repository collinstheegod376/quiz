'use client';

import React, { useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { TOPICS } from '@/data/topics';
import { DIFFICULTY_LEVELS } from '@/data/categories';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Back */}
      <button
        onClick={() => setCurrentView('topics')}
        className="inline-flex items-center gap-2 font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] hover:text-[#000000] dark:hover:text-[#FEFEFD] tracking-[0.42px] capitalize transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Topics
      </button>

      {/* Topic Hero — sharp image container */}
      <div className="relative border border-[#CECCC5] dark:border-[#363535] overflow-hidden">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-[#E5E3DB] dark:bg-[#1E1D1D]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentTopic.imageUrl}
            alt={currentTopic.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/70 to-transparent" />

          <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#EBDAC3] tracking-[0.38px] capitalize block mb-1">
                Selected Franchise
              </span>
              <h1 className="font-nunito font-black text-[30px] text-white leading-[1.4] tracking-[0.6px]">
                {currentTopic.name}
              </h1>
              <p className="font-nunito font-extrabold text-[12.8px] text-[#CECCC5] tracking-[0.38px] capitalize max-w-xl mt-1">
                {currentTopic.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E5E3DB] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
                10 Levels
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EBDAC3] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
                {currentTopic.questionCount} Questions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 sm:px-8 py-4 border-b border-[#CECCC5] dark:border-[#363535]">
          <div>
            <h2 className="font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.6px] leading-[1.4]">
              Select Difficulty Level
            </h2>
            <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize">
              Questions progressively increase in depth and challenge.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EBDAC3] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize whitespace-nowrap">
            Level {selectedDifficultyLevel.toString().padStart(2, '0')} — {activeLevelInfo.name}
          </span>
        </div>

        {/* Level Grid */}
        <div className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 border border-[#CECCC5] dark:border-[#363535]">
            {DIFFICULTY_LEVELS.map((level) => {
              const isSelected = selectedDifficultyLevel === level.levelNumber;
              return (
                <button
                  key={level.levelNumber}
                  onClick={() => setSelectedDifficultyLevel(level.levelNumber)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 border-b border-r border-[#CECCC5] dark:border-[#363535] text-center transition-colors ${
                    isSelected
                      ? 'bg-[#EBDAC3] border-[#CECCC5]'
                      : 'bg-[#FFFDF4] dark:bg-[#100F0F] hover:bg-[#E5E3DB] dark:hover:bg-[#1E1D1D]'
                  }`}
                >
                  <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                    Level
                  </span>
                  <span className="font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.6px] leading-[1.4]">
                    {level.levelNumber.toString().padStart(2, '0')}
                  </span>
                  <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                    {level.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Level Info */}
          <div className="p-4 bg-[#F7F5ED] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535]">
            <div className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px] mb-1">
              Level {selectedDifficultyLevel}: {activeLevelInfo.name} Challenge
            </div>
            <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize">
              {activeLevelInfo.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#CECCC5] dark:border-[#363535]">
            <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize text-center sm:text-left">
              Match length: 2p = 10q · 3p = 12q · 4p = 15q
            </span>
            <Button variant="arena" size="lg" onClick={handleContinue} className="w-full sm:w-auto">
              Proceed to Arena Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
