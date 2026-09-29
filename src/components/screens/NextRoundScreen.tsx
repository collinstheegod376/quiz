'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';
import {
  Copy,
  Check,
  Crown,
  Users,
  Play,
  LogOut,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight,
  Zap,
  Sparkles,
  Mic,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { VoiceControlsBar } from '../ui/VoiceControlsBar';
import { useVoice } from '@/context/VoiceContext';

export function NextRoundScreen() {
  const {
    room,
    currentPlayer,
    activityLogs,
    togglePlayerReady,
    startNextRound,
    leaveRoom,
  } = useGame();

  const { isPlayerSpeaking, isPlayerInVoice } = useVoice();

  const [copied, setCopied] = useState(false);

  const currentTopic = useMemo(() => {
    if (!room) return null;
    return TOPICS.find((t) => t.id === room.topicId) || TOPICS[0];
  }, [room]);

  const currentCategory = useMemo(() => {
    if (!room) return null;
    return CATEGORIES.find((c) => c.id === room.categoryId) || CATEGORIES[0];
  }, [room]);

  if (!room || !currentPlayer) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = currentPlayer.isHost;
  const nonHostPlayers = room.players.filter((p) => !p.isHost);
  const allChallengersReady =
    nonHostPlayers.length === 0 ||
    nonHostPlayers.every((p) => p.isReady || p.id.startsWith('bot_'));
  const readyCount = room.players.filter((p) => p.isReady).length;
  const totalPlayers = room.players.length;

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const hostPlayer = room.players.find((p) => p.isHost);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">
      {/* ── Room Header Banner ── */}
      <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#EBDAC3] dark:bg-[#1E1D1D]">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4CA471]/15 border border-[#4CA471]/40 font-nunito font-extrabold text-[12.8px] text-[#23616A] dark:text-[#6FEEFF] tracking-[0.38px] capitalize">
                <span className="w-2 h-2 rounded-full bg-[#4CA471] inline-block animate-pulse" />
                Next Round Intermission
              </span>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                {currentCategory?.name} · {currentTopic?.name}
              </span>
            </div>

            <h1 className="font-nunito font-black text-[28px] sm:text-[34px] text-[#000000] dark:text-[#FEFEFD] leading-[1.2] tracking-[0.6px]">
              Preparing Round {room.difficultyLevel}
            </h1>
            <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px]">
              {isHost
                ? 'Waiting for challengers to confirm readiness before launching the next round.'
                : 'Click Ready when you are prepared for the host to launch the round!'}
            </p>
          </div>

          {/* Room Code */}
          <div className="flex items-center gap-3 bg-[#FFFDF4] dark:bg-[#100F0F] border border-[#CECCC5] dark:border-[#363535] px-5 py-3">
            <div>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize block">
                Arena Code
              </span>
              <span className="font-mono font-black text-[28px] sm:text-[36px] text-[#000000] dark:text-[#FEFEFD] tracking-[4px]">
                {room.code}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#CECCC5] dark:border-[#363535] hover:border-[#000000] dark:hover:border-[#FEFEFD] font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#4CA471]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Combatants Readiness & Standings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Voice Chat Pod */}
          <VoiceControlsBar />

          {/* Readiness Section */}
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#CECCC5] dark:border-[#363535]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#23616A]" />
                <h2 className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
                  Combatant Readiness ({readyCount}/{totalPlayers} Ready)
                </h2>
              </div>
              {allChallengersReady ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4CA471]/15 border border-[#4CA471]/40 font-nunito font-extrabold text-[12.8px] text-[#4CA471] tracking-[0.38px] capitalize">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Ready to Launch
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B9843E]/15 border border-[#B9843E]/40 font-nunito font-extrabold text-[12.8px] text-[#B9843E] tracking-[0.38px] capitalize">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Awaiting Challengers
                </span>
              )}
            </div>

            {/* Combatant Cards List */}
            <div className="divide-y divide-[#CECCC5] dark:divide-[#363535]">
              {room.players.map((player) => {
                const isCurrent = player.id === currentPlayer.id;
                const isReady = player.isReady || player.isHost || player.id.startsWith('bot_');
                const isSpeaking = isPlayerSpeaking(player.id);
                const inVoice = isPlayerInVoice(player.id);

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 sm:p-5 transition-colors ${
                      isCurrent
                        ? 'bg-[#EBDAC3]/30 dark:bg-[#1E1D1D]'
                        : 'bg-[#FFFDF4] dark:bg-[#100F0F]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar with speaking pulse ring */}
                      <div
                        className={`relative w-12 h-12 bg-[#E5E3DB] dark:bg-[#2A2929] overflow-hidden transition-all duration-150 ${
                          isSpeaking
                            ? 'border-2 border-[#4CA471] ring-2 ring-[#4CA471] ring-offset-2 ring-offset-[#FFFDF4] dark:ring-offset-[#100F0F] scale-105'
                            : 'border border-[#CECCC5] dark:border-[#363535]'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={player.avatarUrl}
                          alt={player.displayName}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#4CA471] border-2 border-[#FFFDF4] dark:border-[#100F0F]" />
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
                            {player.displayName}
                          </span>
                          {player.isHost && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBDAC3] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                              <Crown className="w-3 h-3 text-[#B9843E]" />
                              Host
                            </span>
                          )}
                          {isCurrent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#23616A]/10 border border-[#23616A]/30 font-nunito font-extrabold text-[12px] text-[#23616A] dark:text-[#6FEEFF] tracking-[0.38px] capitalize">
                              You
                            </span>
                          )}
                          {inVoice && (
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-nunito font-black transition-colors ${
                                isSpeaking
                                  ? 'bg-[#4CA471] text-white animate-pulse'
                                  : 'bg-[#4CA471]/15 text-[#4CA471]'
                              }`}
                              title={isSpeaking ? 'Speaking Now' : 'Voice Connected'}
                            >
                              <Mic className="w-2.5 h-2.5" />
                              <span>{isSpeaking ? 'Speaking' : 'Voice'}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-nunito font-extrabold text-[13px] text-[#595955] dark:text-[#A4A3A3]">
                            Match Score: <strong className="text-[#000000] dark:text-[#FEFEFD]">{player.score.toLocaleString()} XP</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Readiness Status Badge */}
                    <div>
                      {player.isHost ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#CECCC5] dark:border-[#363535] bg-[#E5E3DB] dark:bg-[#2A2929] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD]">
                          <Crown className="w-3.5 h-3.5 text-[#B9843E]" />
                          Host (Launch Control)
                        </span>
                      ) : isReady ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#4CA471] bg-[#4CA471]/15 font-nunito font-black text-[13px] text-[#4CA471] tracking-[0.4px]">
                          <CheckCircle2 className="w-4 h-4 text-[#4CA471]" />
                          READY FOR ROUND {room.difficultyLevel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#B9843E] bg-[#B9843E]/10 font-nunito font-black text-[13px] text-[#B9843E] tracking-[0.4px] animate-pulse">
                          <Clock className="w-4 h-4" />
                          NOT READY
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cumulative Match Standings */}
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#CECCC5] dark:border-[#363535]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#B9843E]" />
                <h3 className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
                  Tournament Standings
                </h3>
              </div>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3]">
                Cumulative XP
              </span>
            </div>

            <div className="divide-y divide-[#CECCC5] dark:divide-[#363535]">
              {sortedPlayers.map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-nunito font-black text-[14px] text-[#595955] dark:text-[#A4A3A3]">
                      #{idx + 1}
                    </span>
                    <span className="font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD]">
                      {player.displayName}
                    </span>
                    {idx === 0 && <Crown className="w-4 h-4 text-[#B9843E] fill-[#B9843E]" />}
                  </div>
                  <span className="font-nunito font-black text-[14px] text-[#23616A] dark:text-[#6FEEFF]">
                    {player.score.toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Stage Details & Interactive Action Center (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Round Info Card */}
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
            <div className="px-6 py-4 border-b border-[#CECCC5] dark:border-[#363535] flex items-center justify-between">
              <h3 className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
                Upcoming Round Details
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBDAC3] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12px] text-[#000000] dark:text-[#FEFEFD]">
                <Sparkles className="w-3 h-3 text-[#B9843E]" />
                Level {room.difficultyLevel}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm py-1.5 border-b border-[#CECCC5]/40 dark:border-[#363535]/40">
                  <span className="font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3]">Topic</span>
                  <span className="font-nunito font-black text-[#000000] dark:text-[#FEFEFD]">{currentTopic?.name}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b border-[#CECCC5]/40 dark:border-[#363535]/40">
                  <span className="font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3]">Target Difficulty</span>
                  <span className="font-nunito font-black text-[#000000] dark:text-[#FEFEFD]">Level {room.difficultyLevel}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b border-[#CECCC5]/40 dark:border-[#363535]/40">
                  <span className="font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3]">Questions Pool</span>
                  <span className="font-nunito font-black text-[#000000] dark:text-[#FEFEFD]">{room.calculatedQuestionCount} Questions</span>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span className="font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3]">Time Per Question</span>
                  <span className="font-nunito font-black text-[#000000] dark:text-[#FEFEFD]">{room.timePerQuestion}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Interactive Action Hub ── */}
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] p-6 space-y-4">
            <h3 className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px] border-b border-[#CECCC5] dark:border-[#363535] pb-3">
              Action Center
            </h3>

            {/* IF CURRENT USER IS CHALLENGER (NON-HOST) */}
            {!isHost && (
              <div className="space-y-4">
                {currentPlayer.isReady ? (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="xl"
                      onClick={togglePlayerReady}
                      className="w-full flex items-center justify-center gap-2 border-[#4CA471] bg-[#4CA471]/10 text-[#4CA471] hover:bg-[#4CA471]/20 font-black"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#4CA471]" />
                      <span>YOU ARE READY! (Click to Unready)</span>
                    </Button>
                    <div className="p-4 bg-[#EBDAC3]/30 border border-[#CECCC5] dark:border-[#363535] text-center space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 text-[#23616A] animate-spin" />
                        <span className="font-nunito font-black text-[14px] text-[#000000] dark:text-[#FEFEFD]">
                          Locked in! Waiting for {hostPlayer?.displayName || 'Host'} to start…
                        </span>
                      </div>
                      <p className="font-nunito font-extrabold text-[12px] text-[#595955] dark:text-[#A4A3A3]">
                        The match will automatically launch on both screens simultaneously.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="arena"
                      size="xl"
                      onClick={togglePlayerReady}
                      className="w-full flex items-center justify-center gap-2 py-4 shadow-lg shadow-[#23616A]/20"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#6FEEFF]" />
                      <span>READY UP FOR ROUND {room.difficultyLevel}</span>
                    </Button>
                    <p className="text-center font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3]">
                      Click above to confirm you are ready. The host will be notified immediately.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* IF CURRENT USER IS HOST */}
            {isHost && (
              <div className="space-y-4">
                {allChallengersReady ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#4CA471]/15 border border-[#4CA471]/40 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4CA471] shrink-0" />
                      <span className="font-nunito font-black text-[13px] text-[#4CA471]">
                        All combatants are ready! You can now start the round.
                      </span>
                    </div>

                    <Button
                      variant="arena"
                      size="xl"
                      onClick={startNextRound}
                      className="w-full flex items-center justify-center gap-2 py-4 shadow-xl shadow-[#4CA471]/20 ring-2 ring-[#4CA471]"
                    >
                      <Play className="w-5 h-5 fill-current text-[#6FEEFF]" />
                      <span>START ROUND {room.difficultyLevel} NOW</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#B9843E]/15 border border-[#B9843E]/40 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#B9843E] animate-spin shrink-0" />
                      <span className="font-nunito font-black text-[13px] text-[#B9843E]">
                        Waiting for challengers to click Ready…
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="xl"
                      disabled
                      className="w-full flex items-center justify-center gap-2 opacity-50 cursor-not-allowed bg-[#E5E3DB]/30 border-dashed"
                    >
                      <Clock className="w-5 h-5" />
                      <span>Waiting for Challenger Ready…</span>
                    </Button>

                    <div className="text-center pt-1">
                      <button
                        onClick={startNextRound}
                        className="font-nunito font-extrabold text-[12px] text-[#595955] hover:text-[#000000] dark:text-[#A4A3A3] dark:hover:text-[#FEFEFD] underline transition-colors"
                      >
                        Force Start Match (if challenger is AFK)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Leave Room Button */}
            <div className="pt-2 border-t border-[#CECCC5] dark:border-[#363535]">
              <Button
                variant="outline"
                size="md"
                onClick={leaveRoom}
                className="w-full text-[#FF94AB] border-[#FF94AB]/40 hover:bg-[#FF94AB]/10"
              >
                <LogOut className="w-4 h-4" />
                Leave Arena / Return Home
              </Button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
            <div className="px-5 py-3 border-b border-[#CECCC5] dark:border-[#363535]">
              <h4 className="font-nunito font-black text-[14px] text-[#000000] dark:text-[#FEFEFD]">
                Arena Activity
              </h4>
            </div>
            <div className="p-4 space-y-1.5 max-h-28 overflow-y-auto">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-xs">
                  <span className="font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3] truncate pr-2">
                    {log.text}
                  </span>
                  <span className="font-roboto font-extrabold text-[#CECCC5] dark:text-[#363535] shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
