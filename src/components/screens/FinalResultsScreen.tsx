'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
  GraduationCap,
  Share2,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAchievements } from '@/context/AchievementContext';
import { useAuth } from '@/context/AuthContext';
import { sortPlayersFairly, calculateAcademicGrade } from '@/lib/utils';
import { VoiceControlsBar } from '../ui/VoiceControlsBar';

export function FinalResultsScreen() {
  const { room, currentPlayer, playAgain, goToNextRound, leaveRoom } = useGame();
  const { checkMatchAchievements } = useAchievements();
  const { currentUser, openAuthModal, incrementStat } = useAuth();
  const hasEvaluatedRef = useRef<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

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
      // Bug 8: Include round timestamp so replays of the same level evaluate properly
      const roundTimestamp = room.questionStartedAt || Date.now();
      const matchKey = `${room.id || room.code}-${room.difficultyLevel}-${currentPlayer.id}-${roundTimestamp}`;
      if (hasEvaluatedRef.current === matchKey) return;
      hasEvaluatedRef.current = matchKey;

      const sorted = sortPlayersFairly(room.players);
      const myRank = sorted.findIndex((p) => p.id === currentPlayer.id) + 1;

      // Bug 9: Guard win stat increment so solo games do not inflate multiplayer win rates
      const isMultiplayer = room.players.length >= 2;
      if (myRank === 1 && isMultiplayer) {
        incrementStat('wins');
      }

      const avgSec =
        currentPlayer.correctAnswers > 0
          ? currentPlayer.totalResponseTimeMs / 1000 / (room.calculatedQuestionCount || 10)
          : 5;

      // Bug 18: Track unique topics played to unlock social_butterfly achievement
      let uniqueTopics: string[] = [room.topicId];
      try {
        const storageKey = currentUser
          ? `quiz_topics_played_${currentUser.username.toLowerCase()}`
          : 'quiz_topics_played_guest';
        const raw = localStorage.getItem(storageKey);
        const set = new Set<string>(raw ? JSON.parse(raw) : []);
        set.add(room.topicId);
        uniqueTopics = Array.from(set);
        localStorage.setItem(storageKey, JSON.stringify(uniqueTopics));
      } catch {
        // Ignored
      }

      checkMatchAchievements({
        topicId: room.topicId,
        difficultyLevel: room.difficultyLevel,
        totalQuestions: room.calculatedQuestionCount,
        correctAnswers: currentPlayer.correctAnswers,
        maxStreak: currentPlayer.maxStreak ?? (currentPlayer.correctAnswers === room.calculatedQuestionCount ? currentPlayer.correctAnswers : 0),
        fastestAnswerSec: Math.max(0.8, avgSec * 0.6),
        avgResponseSec: avgSec,
        playerRank: myRank > 0 ? myRank : 1,
        totalScore: currentPlayer.score,
        careerCorrect: currentUser ? currentUser.stats.correctAnswers : currentPlayer.correctAnswers,
        careerMatches: currentUser ? currentUser.stats.matchesPlayed : 1,
        careerTotalScore: currentUser ? currentUser.stats.totalScore : currentPlayer.score,
        uniqueTopicsPlayed: uniqueTopics,
      });
    }
  }, [room, currentPlayer, checkMatchAchievements, currentUser, incrementStat]);

  if (!room || !currentPlayer) return null;

  const sortedPlayers = sortPlayersFairly(room.players);
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

  const academicGrade = calculateAcademicGrade(
    myCorrect,
    totalQuestions,
    currentPlayer.score,
    room.difficultyLevel || 1
  );

  const stats = [
    { label: 'Accuracy', value: `${myAccuracy}%`, sub: `${myCorrect} of ${totalQuestions} Correct`, icon: Target },
    { label: 'Avg Response', value: `${avgResponseTimeSec}s`, sub: 'Speed reflex tier', icon: Clock },
    { label: 'Academic Grade', value: academicGrade.grade, sub: `${academicGrade.title} (${Math.round(academicGrade.masteryIndex * 100)}%)`, icon: GraduationCap },
    { label: 'Champion Score', value: `${winner?.correctAnswers ?? 0} / ${totalQuestions}`, sub: `${winner?.score.toLocaleString() || '0'} XP · ${(winner ? (winner.totalResponseTimeMs / 1000).toFixed(1) : 0)}s`, icon: Trophy },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="text-center space-y-3 pb-6 border-b border-[#CECCC5] dark:border-[#363535]">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBDAC3] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
            <Trophy className="w-3.5 h-3.5" />
            Match Concluded
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-nunito font-black text-[12.8px] tracking-[0.38px] ${academicGrade.badgeBg} ${academicGrade.colorClass}`}>
            <GraduationCap className="w-3.5 h-3.5" />
            Evaluation: Grade {academicGrade.grade} ({academicGrade.title})
          </span>
        </div>
        <h1 className="font-nunito font-black text-[30px] sm:text-[20px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
          Game Complete!
        </h1>
        <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px]">
          The battle has ended. Ranked by highest correct answers (tie-breaker: fastest completion time). Champion podium below.
        </p>
      </div>

      {/* ── Voice Chat Comms ── */}
      <VoiceControlsBar />

      {/* ── Podium ── */}
      <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] p-6 sm:p-10">
        <div className="flex items-end justify-center gap-4 sm:gap-8">
          {/* 2nd Place */}
          {second && (
            <div className="flex flex-col items-center flex-1 max-w-[140px] text-center space-y-2">
              <div className="relative">
                <div className="w-14 h-14 bg-[#E5E3DB] dark:bg-[#2A2929] border-2 border-[#CECCC5] dark:border-[#363535] overflow-hidden relative">
                  <Image src={second.avatarUrl} alt={second.displayName} width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#CECCC5] text-[#000000] flex items-center justify-center font-nunito font-black text-[12px]">
                  2
                </span>
              </div>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize truncate w-full">
                {second.displayName}
              </span>
              <span className="font-nunito font-black text-[13px] text-[#4CA471] tracking-[0.38px]">
                {second.correctAnswers} / {totalQuestions} Correct
              </span>
              <span className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px]">
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
                <div className="w-16 h-16 bg-[#EBDAC3] border-4 border-[#B9843E] overflow-hidden relative">
                  <Image src={winner.avatarUrl} alt={winner.displayName} width={64} height={64} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#B9843E] text-white flex items-center justify-center font-nunito font-black text-[12px]">
                  1
                </span>
              </div>
              <span className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px] truncate w-full">
                {winner.displayName}
              </span>
              <span className="font-nunito font-black text-[15px] text-[#4CA471] tracking-[0.42px]">
                {winner.correctAnswers} / {totalQuestions} Correct
              </span>
              <span className="font-nunito font-extrabold text-[13px] text-[#B9843E] tracking-[0.42px]">
                {winner.score.toLocaleString()} XP Awarded
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
                <div className="w-14 h-14 bg-[#E5E3DB] dark:bg-[#2A2929] border-2 border-[#B9843E]/50 overflow-hidden relative">
                  <Image src={third.avatarUrl} alt={third.displayName} width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#B9843E]/60 text-white flex items-center justify-center font-nunito font-black text-[12px]">
                  3
                </span>
              </div>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize truncate w-full">
                {third.displayName}
              </span>
              <span className="font-nunito font-black text-[13px] text-[#4CA471] tracking-[0.38px]">
                {third.correctAnswers} / {totalQuestions} Correct
              </span>
              <span className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px]">
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
            <div className="font-roboto font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.36px] mt-1">
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
        <button
          type="button"
          onClick={async () => {
            const sorted = sortPlayersFairly(room.players);
            const myRank = sorted.findIndex((p) => p.id === currentPlayer.id) + 1;
            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://anizuki.sbs';
            const shareUrl = `${origin}/share/result?player=${encodeURIComponent(currentPlayer.displayName)}&score=${currentPlayer.score}&topic=${encodeURIComponent(room.topicId)}&grade=${encodeURIComponent(academicGrade.grade)}&accuracy=${myAccuracy}&rank=${myRank > 0 ? myRank : 1}`;

            if (navigator.share) {
              try {
                await navigator.share({
                  title: `${currentPlayer.displayName}'s AniZuki Score: ${currentPlayer.score.toLocaleString()} XP`,
                  text: `I scored ${currentPlayer.score.toLocaleString()} XP (Grade ${academicGrade.grade}) with ${myAccuracy}% accuracy on AniZuki! Can you beat me?`,
                  url: shareUrl,
                });
                return;
              } catch {
                // Ignore cancel
              }
            }
            try {
              await navigator.clipboard.writeText(shareUrl);
              setCopiedShare(true);
              setTimeout(() => setCopiedShare(false), 2500);
            } catch {
              // Ignore clipboard failure
            }
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-nunito font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {copiedShare ? (
            <>
              <Check className="w-5 h-5 text-emerald-700" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              <span>Share Result &amp; Card</span>
            </>
          )}
        </button>
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
