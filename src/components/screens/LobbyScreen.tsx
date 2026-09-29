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
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function LobbyScreen() {
  const {
    room,
    currentPlayer,
    activityLogs,
    startGame,
    leaveRoom,
    togglePlayerReady,
    addMockBotPlayer,
    removePlayer,
  } = useGame();

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
  const playerCount = room.players.length;
  const maxCapacity = room.maxPlayers || 4;
  const canStart = isHost;
  const isFull = playerCount >= maxCapacity;
  const calculatedQuestionCount =
    playerCount <= 2 ? 10 : playerCount === 3 ? 12 : 15;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">

      {/* ── Room Header Banner ── */}
      <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#EBDAC3] dark:bg-[#1E1D1D]">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            {/* Status pill */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5E3DB] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
                <span className="w-2 h-2 rounded-full bg-[#B9843E] inline-block" />
                Matchmaking Lobby
              </span>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                {currentCategory?.name} · {currentTopic?.name}
              </span>
            </div>

            <h1 className="font-nunito font-black text-[30px] sm:text-[20px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
              Battle Room
            </h1>
            <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize">
              Waiting for combatants to assemble before starting the match.
            </p>
          </div>

          {/* Room Code */}
          <div className="flex items-center gap-3 bg-[#FFFDF4] dark:bg-[#100F0F] border border-[#CECCC5] dark:border-[#363535] px-5 py-3">
            <div>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize block">
                Room Code
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

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Players (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#000000] dark:text-[#FEFEFD]" />
              <h2 className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
                Combatants ({playerCount}/{maxCapacity})
              </h2>
            </div>
            {isFull ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                Room Full
              </span>
            ) : playerCount === 1 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                Add Rivals
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#4CA471] tracking-[0.38px] capitalize">
                {playerCount} Ready
              </span>
            )}
          </div>

          {/* Player rows — sharp bordered */}
          <div className="border border-[#CECCC5] dark:border-[#363535] divide-y divide-[#CECCC5] dark:divide-[#363535]">
            {room.players.map((player) => {
              const isCurrent = player.id === currentPlayer.id;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    isCurrent
                      ? 'bg-[#EBDAC3]/50 dark:bg-[#1E1D1D]'
                      : 'bg-[#FFFDF4] dark:bg-[#100F0F]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Avatar — sharp */}
                    <div className="relative w-11 h-11 bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={player.avatarUrl}
                        alt={player.displayName}
                        className="w-full h-full object-cover"
                      />
                      {/* Online indicator */}
                      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#4CA471] border-2 border-[#FFFDF4] dark:border-[#100F0F]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
                          {player.displayName}
                        </span>
                        {player.isHost && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBDAC3] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
                            <Crown className="w-3 h-3" />
                            Host
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4CA471]" />
                        <span className="font-nunito font-extrabold text-[12.8px] text-[#4CA471] tracking-[0.38px] capitalize">
                          Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {isHost && !player.isHost && (
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] hover:text-[#FF94AB] tracking-[0.38px] capitalize px-3 py-1 hover:bg-[#FF94AB]/10 transition-colors"
                    >
                      Kick
                    </button>
                  )}
                </div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, maxCapacity - playerCount) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex items-center gap-3 p-4 bg-[#FFFDF4] dark:bg-[#100F0F]"
              >
                <div className="w-11 h-11 bg-[#F7F5ED] dark:bg-[#1E1D1D] border border-dashed border-[#CECCC5] dark:border-[#363535] flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-[#CECCC5] dark:text-[#363535]" />
                </div>
                <span className="font-nunito font-extrabold text-[14px] text-[#CECCC5] dark:text-[#363535] tracking-[0.42px] capitalize">
                  Waiting for combatant #{playerCount + idx + 1}…
                </span>
              </div>
            ))}
          </div>

          {/* Bot testing tool */}
          <div className="flex items-center justify-between p-4 bg-[#F7F5ED] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535]">
            <div>
              <span className="font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize block">
                Multiplayer Testing
              </span>
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                Simulate rivals to test 2–4 player matches immediately.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isFull}
              onClick={addMockBotPlayer}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Bot
            </Button>
          </div>
        </div>

        {/* Right: Settings + Logs + Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Match Settings */}
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#CECCC5] dark:border-[#363535]">
              <h3 className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
                Match Settings
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EBDAC3] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
                Authoritative
              </span>
            </div>

            <div className="divide-y divide-[#CECCC5] dark:divide-[#363535]">
              {[
                { label: 'Category', value: currentCategory?.name },
                { label: 'Topic', value: currentTopic?.name },
                { label: 'Difficulty', value: `Level ${room.difficultyLevel.toString().padStart(2, '0')}` },
                { label: `Questions (${playerCount}p)`, value: `${calculatedQuestionCount} Questions` },
                { label: 'Time Per Question', value: `${room.timePerQuestion}s` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-5 py-3">
                  <span className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize">
                    {label}
                  </span>
                  <span className="font-nunito font-black text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
            <div className="px-5 py-4 border-b border-[#CECCC5] dark:border-[#363535]">
              <h3 className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
                Room Activity
              </h3>
            </div>
            <div className="p-5 space-y-2 max-h-36 overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between">
                  <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize truncate pr-2">
                    {log.text}
                  </span>
                  <span className="font-roboto font-extrabold text-[12px] text-[#CECCC5] dark:text-[#363535] tracking-[0.36px] shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isHost ? (
              <Button
                variant="arena"
                size="xl"
                disabled={!canStart}
                onClick={startGame}
                className="w-full"
              >
                <Play className="w-5 h-5 fill-current" />
                {playerCount === 1 ? 'Start Match (Solo)' : 'Start Match'}
              </Button>
            ) : (
              <div className="p-4 border border-[#CECCC5] dark:border-[#363535] bg-[#F7F5ED] dark:bg-[#1E1D1D] text-center">
                <span className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize">
                  Waiting for host to start the match…
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={leaveRoom}
              className="w-full text-[#FF94AB] border-[#FF94AB]/40 hover:bg-[#FF94AB]/10"
            >
              <LogOut className="w-4 h-4" />
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
