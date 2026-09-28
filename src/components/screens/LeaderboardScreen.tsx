'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import {
  Trophy,
  ArrowRight,
  TrendingUp,
  Crown,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function LeaderboardScreen() {
  const { room, currentPlayer, advanceToNextState } = useGame();

  if (!room || !currentPlayer) return null;

  // Sort players by score descending
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const nextQNum = room.currentQuestionIndex + 2;
  const isLastQuestion = nextQNum > room.calculatedQuestionCount;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            Live Match Standings
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            Leaderboard
          </h1>
        </div>

        <Badge variant="arena">
          Round {room.currentQuestionIndex + 1} of {room.calculatedQuestionCount} Complete
        </Badge>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Combatant</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-center">Correct</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedPlayers.map((player, index) => {
            const rank = index + 1;
            const isCurrent = player.id === currentPlayer.id;

            return (
              <div
                key={player.id}
                className={`grid grid-cols-12 items-center p-4 transition-colors ${
                  isCurrent
                    ? 'bg-red-500/10 dark:bg-red-950/30 font-semibold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Rank */}
                <div className="col-span-2 flex items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-sm ${
                      rank === 1
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                        : rank === 2
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        : rank === 3
                        ? 'bg-amber-700/80 text-white'
                        : 'text-slate-400 font-mono text-xs'
                    }`}
                  >
                    {rank === 1 ? <Crown className="w-4 h-4 fill-current" /> : rank}
                  </div>
                </div>

                {/* Player details */}
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={player.avatarUrl}
                      alt={player.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {player.displayName}
                      </span>
                      {player.isHost && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded">
                          Host
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-2 text-right">
                  <span className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    {player.score.toLocaleString()}
                  </span>
                </div>

                {/* Correct Count */}
                <div className="col-span-2 text-center">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {player.correctAnswers} / {room.currentQuestionIndex + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advance Button */}
      <div className="pt-4">
        <Button
          variant="arena"
          size="xl"
          onClick={advanceToNextState}
          className="w-full shadow-2xl"
        >
          {isLastQuestion ? (
            <>
              <Trophy className="w-5 h-5 fill-current" />
              Finalize & View Podium
            </>
          ) : (
            <>
              Next Question ({nextQNum} / {room.calculatedQuestionCount})
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
