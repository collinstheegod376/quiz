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
  Shield,
  Layers,
  Sparkles,
  Flame,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

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
  const canStart = isHost && playerCount >= 2;
  const isFull = playerCount >= 4;

  const calculatedQuestionCount =
    playerCount === 2 ? 10 : playerCount === 3 ? 12 : 15;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Banner / Room Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="arena">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
              Live Matchmaking Lobby
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentCategory?.name} • {currentTopic?.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            Battle Room
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Waiting for combatants to assemble before beginning the match.
          </p>
        </div>

        {/* Room Code Card */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Room Code
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-slate-900 dark:text-white">
              {room.code}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="h-10 px-3 bg-white dark:bg-slate-900"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Players + Right Settings & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Players List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Combatants ({playerCount} / 4)
              </h2>
            </div>

            {isFull ? (
              <Badge variant="warning">Room Full (4/4)</Badge>
            ) : (
              <Badge variant="success">Waiting for {2 - Math.min(2, playerCount)} more to start</Badge>
            )}
          </div>

          {/* Player Cards */}
          <div className="space-y-3">
            {room.players.map((player) => {
              const isCurrent = player.id === currentPlayer.id;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-red-500/50 bg-red-50/40 dark:bg-red-950/20 ring-1 ring-red-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Avatar */}
                    <div className="relative w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={player.avatarUrl}
                        alt={player.displayName}
                        className="w-full h-full object-cover"
                      />
                      {/* Online dot */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {player.displayName}
                        </span>
                        {player.isHost && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Crown className="w-3 h-3 fill-current" />
                            Host
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            You
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Status:
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Remove (for host) */}
                  {isHost && !player.isHost && (
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-xs font-medium text-slate-400 hover:text-rose-500 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      Kick
                    </button>
                  )}
                </div>
              );
            })}

            {/* Empty slots placeholders */}
            {Array.from({ length: 4 - playerCount }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex items-center justify-center p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 text-xs text-slate-400 dark:text-slate-500"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 opacity-60" />
                  <span>Waiting for combatant #{playerCount + idx + 1}...</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Simulation testing tools */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white block">Multiplayer Testing</span>
              Simulate opponent rivals to test 2–4 player matches immediately.
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isFull}
              onClick={addMockBotPlayer}
              className="shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Rival Bot
            </Button>
          </div>
        </div>

        {/* Right: Match Settings & Activity Log (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Game Settings Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">
                Game Settings
              </h3>
              <Badge variant="arena">Authoritative</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Category</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentCategory?.name}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Topic</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentTopic?.name}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Difficulty</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  Level {room.difficultyLevel.toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Questions (Dynamic)</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {calculatedQuestionCount} Questions ({playerCount}p match)
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Time per Question</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {room.timePerQuestion} Seconds
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">
              Room Activity
            </h3>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="truncate pr-2">{log.text}</span>
                  <span className="text-[10px] font-mono shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Host Controls / Action Buttons */}
          <div className="space-y-3 pt-2">
            {isHost ? (
              <Button
                variant="arena"
                size="xl"
                disabled={!canStart}
                onClick={startGame}
                className="w-full shadow-2xl"
              >
                <Play className="w-5 h-5 fill-current" />
                {playerCount < 2 ? 'Need 2+ Players to Start' : 'Start Match'}
              </Button>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-xs font-semibold text-amber-700 dark:text-amber-400">
                Waiting for host to commence the match...
              </div>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={leaveRoom}
              className="w-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-900/30"
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
