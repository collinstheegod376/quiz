'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useGame } from '@/context/GameContext';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';
import {
  Clock,
  Users,
  CheckCircle2,
  Crown,
  LogOut,
  AlertTriangle,
  Sparkles,
  Zap,
  Mic,
  MicOff,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { VoiceControlsBar } from '../ui/VoiceControlsBar';
import { useVoice } from '@/context/VoiceContext';

export function WaitingScreen() {
  const { room, currentPlayer, forceEndGame, leaveRoom } = useGame();
  const { isPlayerSpeaking, isPlayerInVoice, isPlayerMuted } = useVoice();

  const currentTopic = useMemo(() => {
    if (!room) return null;
    return TOPICS.find((t) => t.id === room.topicId) || TOPICS[0];
  }, [room]);

  const currentCategory = useMemo(() => {
    if (!room) return null;
    return CATEGORIES.find((c) => c.id === room.categoryId) || CATEGORIES[0];
  }, [room]);

  if (!room || !currentPlayer) return null;

  const totalQuestions = room.calculatedQuestionCount || 10;
  const isHost = currentPlayer.isHost;

  const finishedCount = room.players.filter((p) => p.isFinished || p.status === 'finished').length;
  const totalPlayers = room.players.length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">
      {/* ── Top Header Banner ── */}
      <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#EBDAC3] dark:bg-[#1E1D1D]">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4CA471]/15 border border-[#4CA471]/40 font-nunito font-extrabold text-[12.8px] text-[#23616A] dark:text-[#6FEEFF] tracking-[0.38px] capitalize">
                <span className="w-2 h-2 rounded-full bg-[#4CA471] inline-block animate-ping" />
                Your Quiz Completed
              </span>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                {currentCategory?.name} · {currentTopic?.name}
              </span>
            </div>

            <h1 className="font-nunito font-black text-[28px] sm:text-[34px] text-[#000000] dark:text-[#FEFEFD] leading-[1.2] tracking-[0.6px]">
              Waiting for other players…
            </h1>
            <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px]">
              You have completed all {totalQuestions} questions. Results and podium will appear as soon as all combatants finish!
            </p>
          </div>

          {/* Room PIN */}
          <div className="flex items-center gap-3 bg-[#FFFDF4] dark:bg-[#100F0F] border border-[#CECCC5] dark:border-[#363535] px-5 py-3 shrink-0">
            <div>
              <span className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize block">
                Arena Room
              </span>
              <span className="font-mono font-black text-[24px] text-[#000000] dark:text-[#FEFEFD] tracking-[3px]">
                {room.code}
              </span>
            </div>
            <div className="border-l border-[#CECCC5] dark:border-[#363535] pl-3 text-right">
              <span className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] block">
                Finished
              </span>
              <span className="font-mono font-black text-[20px] text-[#4CA471]">
                {finishedCount}/{totalPlayers}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Controls Bar if joined */}
      <VoiceControlsBar />

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Your Summary + Progress Animation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Box */}
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#4CA471]/15 border-2 border-[#4CA471] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8 text-[#4CA471]" />
              </div>
              <div>
                <h2 className="font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD]">
                  Your Questions Are In!
                </h2>
                <p className="font-nunito font-extrabold text-[13px] text-[#595955] dark:text-[#A4A3A3] mt-0.5">
                  Great speed! Your answers are locked. Scores and rankings will be finalized once everyone crosses the finish line.
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-[#F7F5ED] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535]">
                <span className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3] block">
                  Correct Answers
                </span>
                <span className="font-nunito font-black text-[22px] text-[#4CA471]">
                  {currentPlayer.correctAnswers} / {totalQuestions}
                </span>
                <span className="font-roboto text-[11px] text-[#595955] dark:text-[#A4A3A3] block mt-0.5">
                  Primary winning metric
                </span>
              </div>

              <div className="p-4 bg-[#F7F5ED] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535]">
                <span className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3] block">
                  XP Earned
                </span>
                <span className="font-nunito font-black text-[22px] text-[#23616A] dark:text-[#6FEEFF]">
                  {currentPlayer.score.toLocaleString()} XP
                </span>
                <span className="font-roboto text-[11px] text-[#595955] dark:text-[#A4A3A3] block mt-0.5">
                  Speed &amp; streak bonuses
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 bg-[#F7F5ED] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535]">
                <span className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3] block">
                  Total Time
                </span>
                <span className="font-nunito font-black text-[22px] text-[#000000] dark:text-[#FEFEFD]">
                  {(currentPlayer.totalResponseTimeMs / 1000).toFixed(1)}s
                </span>
                <span className="font-roboto text-[11px] text-[#595955] dark:text-[#A4A3A3] block mt-0.5">
                  Decides ties
                </span>
              </div>
            </div>

            {/* Waiting Animation Bar */}
            <div className="p-4 bg-[#EBDAC3]/30 dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#B9843E] animate-spin shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-nunito font-black text-[13px] text-[#000000] dark:text-[#FEFEFD] block">
                  Awaiting {totalPlayers - finishedCount} player{totalPlayers - finishedCount === 1 ? '' : 's'}…
                </span>
                <span className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3] truncate block">
                  Standings will automatically open immediately upon the final answer.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Combatants Realtime Status List (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
            <div className="px-6 py-4 border-b border-[#CECCC5] dark:border-[#363535] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#23616A]" />
                <h3 className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD]">
                  Combatant Status ({finishedCount}/{totalPlayers})
                </h3>
              </div>
              <span className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3]">
                Live
              </span>
            </div>

            <div className="divide-y divide-[#CECCC5] dark:divide-[#363535]">
              {room.players.map((player) => {
                const isCurrent = player.id === currentPlayer.id;
                const isPlayerFinished = Boolean(player.isFinished || player.status === 'finished');
                const isDisconnected = player.isOnline === false || player.status === 'disconnected';
                const isSpeaking = isPlayerSpeaking(player.id);
                const inVoice = isPlayerInVoice(player.id);
                const isMuted = isPlayerMuted(player.id);

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 ${
                      isCurrent
                        ? 'bg-[#EBDAC3]/20 dark:bg-[#1E1D1D]'
                        : 'bg-[#FFFDF4] dark:bg-[#100F0F]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-[#E5E3DB] dark:bg-[#2A2929] overflow-hidden relative shrink-0 transition-all duration-150 ${
                          isSpeaking
                            ? 'border-2 border-[#4CA471] ring-2 ring-[#4CA471] ring-offset-2 ring-offset-[#FFFDF4] dark:ring-offset-[#100F0F] scale-105'
                            : 'border border-[#CECCC5] dark:border-[#363535]'
                        }`}
                      >
                        <Image
                          src={player.avatarUrl}
                          alt={player.displayName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-nunito font-black text-[14px] text-[#000000] dark:text-[#FEFEFD]">
                            {player.displayName}
                          </span>
                          {player.isHost && (
                            <Crown className="w-3.5 h-3.5 text-[#B9843E] fill-[#B9843E]" />
                          )}
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-[#23616A]/15 text-[#23616A] dark:text-[#6FEEFF] font-nunito font-black text-[10px]">
                              You
                            </span>
                          )}
                          {inVoice && (
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-nunito font-black transition-colors ${
                                isSpeaking
                                  ? 'bg-[#4CA471] text-white animate-pulse'
                                  : isMuted
                                  ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                                  : 'bg-[#4CA471]/15 text-[#4CA471]'
                              }`}
                              title={isSpeaking ? 'Speaking Now' : isMuted ? 'Muted' : 'Voice Connected'}
                            >
                              {isMuted ? <MicOff className="w-2.5 h-2.5 text-red-500" /> : <Mic className="w-2.5 h-2.5" />}
                              <span>{isSpeaking ? 'Speaking' : isMuted ? 'Muted' : 'Voice'}</span>
                            </span>
                          )}
                        </div>
                        <span className="font-roboto text-[11px] text-[#595955] dark:text-[#A4A3A3]">
                          {isPlayerFinished
                            ? 'Finished all questions'
                            : isDisconnected
                            ? 'Disconnected'
                            : 'Answering questions…'}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isPlayerFinished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4CA471]/15 border border-[#4CA471]/40 font-nunito font-black text-[11px] text-[#4CA471]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Finished
                        </span>
                      ) : isDisconnected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF94AB]/15 border border-[#FF94AB]/40 font-nunito font-black text-[11px] text-[#FF94AB]">
                          Disconnected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B9843E]/15 border border-[#B9843E]/40 font-nunito font-black text-[11px] text-[#B9843E] animate-pulse">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          Playing…
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Center */}
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] p-5 space-y-3">
            {isHost && (
              <div className="space-y-2">
                <Button
                  variant="arena"
                  size="md"
                  onClick={forceEndGame}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-[#FF94AB]" />
                  <span>Force End Match (Rivals AFK)</span>
                </Button>
                <p className="font-nunito font-extrabold text-[11px] text-[#595955] dark:text-[#A4A3A3] text-center">
                  Host control: conclude the match immediately with current standings.
                </p>
              </div>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={leaveRoom}
              className="w-full flex items-center justify-center gap-2 text-[#FF94AB] border-[#FF94AB]/40 hover:bg-[#FF94AB]/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Arena</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
