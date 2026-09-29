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
} from 'lucide-react';

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
  const progress = isReveal ? 100 : (timerSeconds / room.timePerQuestion) * 100;

  const options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }> = [
    { key: 'A', label: currentQuestion.optionA },
    { key: 'B', label: currentQuestion.optionB },
    { key: 'C', label: currentQuestion.optionC },
    { key: 'D', label: currentQuestion.optionD },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-4 animate-fadeIn">

      {/* ── Top HUD Bar ── */}
      <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Category + Topic */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize whitespace-nowrap">
              {currentCategory?.name}
            </span>
            <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize truncate hidden sm:inline">
              {currentTopic?.name} · Level {room.difficultyLevel.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Question counter + Timer */}
          <div className="flex items-center gap-4 shrink-0">
            <span className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
              {currentQNum.toString().padStart(2, '0')}{' '}
              <span className="text-[#CECCC5] dark:text-[#363535] font-extrabold">/</span>{' '}
              {totalQ.toString().padStart(2, '0')}
            </span>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 border font-mono font-black text-[16px] transition-all ${
                isReveal
                  ? 'border-[#4CA471]/50 bg-[#4CA471]/10 text-[#4CA471]'
                  : isTimeCritical
                  ? 'border-[#FF94AB]/50 bg-[#FF94AB]/10 text-[#FF94AB] animate-pulse'
                  : 'border-[#CECCC5] dark:border-[#363535] bg-[#F7F5ED] dark:bg-[#1E1D1D] text-[#000000] dark:text-[#FEFEFD]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isReveal ? '✓' : `${timerSeconds.toString().padStart(2, '0')}s`}</span>
            </div>
          </div>
        </div>

        {/* Timer progress bar */}
        <div className="w-full bg-[#E5E3DB] dark:bg-[#2A2929] h-1">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              isReveal ? 'bg-[#4CA471]' : isTimeCritical ? 'bg-[#FF94AB]' : 'bg-[#23616A]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Question Card ── */}
      <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] p-6 sm:p-10">
        <div className="flex items-start gap-3 mb-4">
          <HelpCircle className="w-5 h-5 text-[#23616A] shrink-0 mt-0.5" />
          <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
            {isReveal ? 'Round Result & Reveal' : 'Answer Submission'}
          </span>
        </div>

        <h2 className="font-nunito font-black text-[20px] sm:text-[30px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
          {currentQuestion.questionText}
        </h2>
      </div>

      {/* ── Options Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-[#CECCC5] dark:border-[#363535]">
        {options.map((opt, idx) => {
          const isUserPick = selectedOption === opt.key;
          const isCorrect = currentQuestion.correctOption === opt.key;

          let containerStyle = 'bg-[#FFFDF4] dark:bg-[#100F0F] border-[#CECCC5] dark:border-[#363535] hover:bg-[#E5E3DB] dark:hover:bg-[#1E1D1D] hover:border-[#00AFC6] cursor-pointer';
          let badgeStyle = 'bg-[#E5E3DB] dark:bg-[#2A2929] text-[#000000] dark:text-[#FEFEFD] border-[#CECCC5] dark:border-[#363535]';
          let textStyle = 'text-[#000000] dark:text-[#FEFEFD]';

          if (isReveal) {
            if (isUserPick && isCorrect) {
              containerStyle = 'bg-[#4CA471]/15 border-[#4CA471] cursor-default';
              badgeStyle = 'bg-[#4CA471] text-white border-[#4CA471]';
              textStyle = 'text-[#000000] dark:text-[#FEFEFD]';
            } else if (isUserPick && !isCorrect) {
              containerStyle = 'bg-[#FF94AB]/15 border-[#FF94AB] cursor-default';
              badgeStyle = 'bg-[#FF94AB] text-[#000000] border-[#FF94AB]';
              textStyle = 'text-[#000000] dark:text-[#FEFEFD]';
            } else if (!isUserPick && isCorrect) {
              containerStyle = 'bg-[#4CA471]/8 border-[#4CA471]/50 cursor-default';
              badgeStyle = 'bg-[#4CA471]/20 text-[#4CA471] border-[#4CA471]/40';
              textStyle = 'text-[#595955] dark:text-[#A4A3A3]';
            } else {
              containerStyle = 'bg-[#FFFDF4] dark:bg-[#100F0F] border-[#CECCC5] dark:border-[#363535] opacity-40 cursor-default';
              badgeStyle = 'bg-[#E5E3DB] dark:bg-[#2A2929] text-[#CECCC5] border-[#CECCC5]';
              textStyle = 'text-[#CECCC5]';
            }
          } else if (isUserPick) {
            containerStyle = 'bg-[#EBDAC3] border-[#000000] dark:border-[#FEFEFD] cursor-default';
            badgeStyle = 'bg-[#000000] dark:bg-[#FEFEFD] text-[#FEFEFD] dark:text-[#000000] border-[#000000] dark:border-[#FEFEFD]';
            textStyle = 'text-[#000000] dark:text-[#FEFEFD]';
          } else if (isAnswerSubmitted) {
            containerStyle = 'bg-[#FFFDF4] dark:bg-[#100F0F] border-[#CECCC5] dark:border-[#363535] opacity-50 cursor-not-allowed';
          }

          const borderClass = idx % 2 === 0 && idx < options.length - 1 ? 'sm:border-r' : '';
          const bottomBorderClass = idx < 2 ? 'border-b' : '';

          return (
            <button
              key={opt.key}
              disabled={isAnswerSubmitted || isReveal}
              onClick={() => submitAnswer(opt.key)}
              className={`group relative flex items-center gap-4 p-5 sm:p-6 border-b border-r border-[#CECCC5] dark:border-[#363535] last:border-b-0 text-left transition-all duration-150 ${containerStyle}`}
            >
              {/* Option Letter */}
              <div
                className={`w-10 h-10 flex items-center justify-center font-nunito font-black text-[16px] tracking-[0.48px] shrink-0 border transition-colors ${badgeStyle}`}
              >
                {opt.key}
              </div>

              {/* Text */}
              <span className={`font-nunito font-extrabold text-[16px] tracking-[0.48px] leading-[1.36] flex-1 ${textStyle}`}>
                {opt.label}
              </span>

              {/* Reveal indicator */}
              {isReveal && (
                isUserPick && isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-[#4CA471] shrink-0" />
                ) : isUserPick && !isCorrect ? (
                  <XCircle className="w-5 h-5 text-[#FF94AB] shrink-0" />
                ) : isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-[#4CA471] shrink-0" />
                ) : null
              )}
            </button>
          );
        })}
      </div>

      {/* ── Status Footer ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 bg-[#F7F5ED] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535]">
        <div className="flex items-center gap-4 text-[12.8px]">
          <span className="font-nunito font-black text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px]">
            {currentPlayer.score.toLocaleString()} XP
          </span>
          <span className="text-[#CECCC5] dark:text-[#363535]">•</span>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#595955] dark:text-[#A4A3A3]" />
            <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
              {room.players.length} in Arena
            </span>
          </div>
        </div>

        {isReveal ? (
          selectedOption ? (
            selectedOption === currentQuestion.correctOption ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4CA471]/10 border border-[#4CA471]/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4CA471]" />
                <span className="font-nunito font-extrabold text-[12.8px] text-[#4CA471] tracking-[0.38px] capitalize">
                  Correct! +XP Awarded
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF94AB]/10 border border-[#FF94AB]/30">
                <XCircle className="w-3.5 h-3.5 text-[#FF94AB]" />
                <span className="font-nunito font-extrabold text-[12.8px] text-[#FF94AB] tracking-[0.38px] capitalize">
                  Incorrect — Better luck next time
                </span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535]">
              <Clock className="w-3.5 h-3.5 text-[#595955] dark:text-[#A4A3A3]" />
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                Time Expired
              </span>
            </div>
          )
        ) : isAnswerSubmitted ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBDAC3] border border-[#CECCC5]">
            <Lock className="w-3.5 h-3.5 text-[#000000]" />
            <span className="font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
              Option {selectedOption} Locked — Awaiting rivals
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#CECCC5] dark:text-[#363535]" />
            <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
              Tap an option to submit
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
