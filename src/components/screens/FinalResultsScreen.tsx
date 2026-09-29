'use client';

import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Clock,
  Target,
  RotateCcw,
  Home,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAchievements } from '@/context/AchievementContext';
import { useAuth } from '@/context/AuthContext';

export function FinalResultsScreen() {
  const { room, currentPlayer, playAgain, goToNextRound, leaveRoom } = useGame();
  const { checkMatchAchievements } = useAchievements();
  const { currentUser } = useAuth();

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EBDAC3', '#4CA471', '#23616A', '#B9843E'],
      });
    } catch {
      // Ignored
    }

    if (room && currentPlayer) {
      const sorted = [...room.players].sort((a, b) => b.score - a.score);
      const myRank = sorted.findIndex((p) => p.id === currentPlayer.id) + 1;
      const avgSec =
        currentPlayer.correctAnswers > 0
          ? currentPlayer.totalResponseTimeMs / 1000 / (room.calculatedQuestionCount || 10)
          : 5;

      checkMatchAchievements({
        topicId: room.topicId,
        difficultyLevel: room.difficultyLevel,
        totalQuestions: room.calculatedQuestionCount,
        correctAnswers: currentPlayer.correctAnswers,
        maxStreak: currentPlayer.correctAnswers,
        fastestAnswerSec: Math.max(0.8, avgSec * 0.6),
        avgResponseSec: avgSec,
        playerRank: myRank > 0 ? myRank : 1,
        totalScore: currentPlayer.score,
        careerCorrect: (currentUser?.stats.correctAnswers || 0) + currentPlayer.correctAnswers,
        careerMatches: (currentUser?.stats.matchesPlayed || 0) + 1,
        careerTotalScore: (currentUser?.stats.totalScore || 0) + currentPlayer.score,
      });
    }
  }, [room, currentPlayer, checkMatchAchievements, currentUser]);

  if (!room || !currentPlayer) return null;

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  const totalQuestions = room.calculatedQuestionCount;
  const myCorrect = currentPlayer.correctAnswers;
  const myAccuracy = totalQuestions > 0 ? Math.round((myCorrect / totalQuestions) * 100) : 0;
  const avgResponseTimeSec =
    currentPlayer.correctAnswers > 0
      ? (currentPlayer.totalResponseTimeMs / 1000 / totalQuestions).toFixed(1)
      : '3.4';

  const stats = [
    { label: 'Accuracy', value: `${myAccuracy}%`, sub: `${myCorrect} of ${totalQuestions} Correct`, icon: Target },
    { label: 'Avg Response', value: `${avgResponseTimeSec}s`, sub: 'Speed bonus tier', icon: Clock },
    { label: 'Top Score', value: winner?.score.toLocaleString() || '0', sub: 'Arena record', icon: Trophy },
    { label: 'Questions', value: String(totalQuestions), sub: 'Server calculated', icon: Award },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="text-center space-y-2 pb-6 border-b border-[#CECCC5] dark:border-[#363535]">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBDAC3] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
          <Trophy className="w-3.5 h-3.5" />
          Match Concluded
        </span>
        <h1 className="font-nunito font-black text-[30px] sm:text-[20px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
          Game Complete!
        </h1>
        <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize">
          The battle has ended. Champion podium and final statistics below.
        </p>
      </div>

      {/* ── Podium ── */}
      <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] p-6 sm:p-10">
        <div className="flex items-end justify-center gap-4 sm:gap-8">
          {/* 2nd Place */}
          {second && (
            <div className="flex flex-col items-center flex-1 max-w-[140px] text-center space-y-2">
              <div className="relative">
                <div className="w-14 h-14 bg-[#E5E3DB] dark:bg-[#2A2929] border-2 border-[#CECCC5] dark:border-[#363535] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={second.avatarUrl} alt={second.displayName} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#CECCC5] text-[#000000] flex items-center justify-center font-nunito font-black text-[12px]">
                  2
                </span>
              </div>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize truncate w-full">
                {second.displayName}
              </span>
              <span className="font-nunito font-black text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px]">
                {second.score.toLocaleString()} XP
              </span>
              <div className="w-full h-24 bg-[#E5E3DB] dark:bg-[#2A2929] border-t-2 border-[#CECCC5] dark:border-[#363535] flex items-center justify-center font-nunito font-black text-[#595955] dark:text-[#A4A3A3] text-[14px] tracking-[0.42px]">
                2nd
              </div>
            </div>
          )}

          {/* 1st Place */}
          {winner && (
            <div className="flex flex-col items-center flex-1 max-w-[160px] text-center space-y-2 -mt-6">
              <Crown className="w-8 h-8 text-[#B9843E] fill-[#B9843E] animate-bounce" />
              <div className="relative">
                <div className="w-16 h-16 bg-[#EBDAC3] border-4 border-[#B9843E] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={winner.avatarUrl} alt={winner.displayName} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#B9843E] text-white flex items-center justify-center font-nunito font-black text-[12px]">
                  1
                </span>
              </div>
              <span className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px] truncate w-full">
                {winner.displayName}
              </span>
              <span className="font-nunito font-black text-[14px] text-[#B9843E] tracking-[0.42px]">
                {winner.score.toLocaleString()} XP
              </span>
              <div className="w-full h-36 bg-[#EBDAC3] dark:bg-[#1E1D1D] border-t-4 border-[#B9843E] flex flex-col items-center justify-center">
                <Trophy className="w-6 h-6 text-[#B9843E] mb-1" />
                <span className="font-nunito font-black text-[14px] text-[#B9843E] tracking-[0.42px] capitalize">Champion</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="flex flex-col items-center flex-1 max-w-[140px] text-center space-y-2">
              <div className="relative">
                <div className="w-14 h-14 bg-[#E5E3DB] dark:bg-[#2A2929] border-2 border-[#B9843E]/50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={third.avatarUrl} alt={third.displayName} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#B9843E]/60 text-white flex items-center justify-center font-nunito font-black text-[12px]">
                  3
                </span>
              </div>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize truncate w-full">
                {third.displayName}
              </span>
              <span className="font-nunito font-black text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px]">
                {third.score.toLocaleString()} XP
              </span>
              <div className="w-full h-16 bg-[#E5E3DB] dark:bg-[#2A2929] border-t border-[#CECCC5] dark:border-[#363535] flex items-center justify-center font-nunito font-black text-[#595955] dark:text-[#A4A3A3] text-[14px] tracking-[0.42px]">
                3rd
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#CECCC5] dark:border-[#363535] divide-x divide-y divide-[#CECCC5] dark:divide-[#363535]">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="p-5 text-center bg-[#FFFDF4] dark:bg-[#100F0F]">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Icon className="w-4 h-4 text-[#23616A]" />
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                {label}
              </span>
            </div>
            <div className="font-nunito font-black text-[30px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
              {value}
            </div>
            <div className="font-roboto font-extrabold text-[12px] text-[#CECCC5] dark:text-[#363535] tracking-[0.36px] mt-1">
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Button
          variant="arena"
          size="xl"
          onClick={() => goToNextRound()}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-5 h-5 text-[#6FEEFF]" />
          <span>
            {(room.difficultyLevel || 1) >= 9
              ? 'Next Round (Loop to Level 1)'
              : `Next Round (Level ${(room.difficultyLevel || 1) + 1})`}
          </span>
        </Button>
        <Button
          variant="outline"
          size="xl"
          onClick={() => goToNextRound(room.difficultyLevel || 1)}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="w-5 h-5" />
          Replay Current Level
        </Button>
        <Button variant="outline" size="xl" onClick={leaveRoom} className="w-full sm:w-auto">
          <Home className="w-5 h-5" />
          Return to Home
        </Button>
      </div>
    </div>
  );
}
