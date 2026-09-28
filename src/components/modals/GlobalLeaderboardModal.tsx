'use client';

import React, { useMemo } from 'react';
import { useAuth, UserAccount } from '@/context/AuthContext';
import {
  X,
  Trophy,
  Crown,
  Medal,
  Award,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface GlobalLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalLeaderboardModal({ isOpen, onClose }: GlobalLeaderboardModalProps) {
  const { currentUser } = useAuth();

  const leaderboardEntries = useMemo(() => {
    try {
      const savedAccountsStr = localStorage.getItem('quiz_arena_accounts');
      const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];

      // Include starter hall of fame if few accounts
      const defaultLegends = [
        {
          username: 'ZoroFan',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zoro',
          stats: { totalScore: 18450, matchesPlayed: 14, wins: 11, correctAnswers: 89, totalAnswers: 100 },
        },
        {
          username: 'LuffyGoat',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Luffy',
          stats: { totalScore: 16200, matchesPlayed: 12, wins: 9, correctAnswers: 78, totalAnswers: 92 },
        },
        {
          username: 'Nami_Chan',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Nami',
          stats: { totalScore: 14100, matchesPlayed: 11, wins: 7, correctAnswers: 64, totalAnswers: 80 },
        },
      ];

      // Merge real registered accounts with legends
      const merged = [...accounts];
      defaultLegends.forEach((leg) => {
        if (!merged.some((a) => a.username.toLowerCase() === leg.username.toLowerCase())) {
          merged.push({
            username: leg.username,
            passwordHash: '',
            avatarUrl: leg.avatarUrl,
            createdAt: new Date().toISOString(),
            stats: {
              roomsCreated: 3,
              matchesPlayed: leg.stats.matchesPlayed,
              wins: leg.stats.wins,
              totalScore: leg.stats.totalScore,
              correctAnswers: leg.stats.correctAnswers,
              totalAnswers: leg.stats.totalAnswers,
            },
          });
        }
      });

      return merged.sort((a, b) => (b.stats?.totalScore || 0) - (a.stats?.totalScore || 0));
    } catch {
      return [];
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            Hall of Champions
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            Global Leaderboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time standings of top combatants ranked by total arena experience points and match victories.
          </p>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
          <div className="grid grid-cols-12 p-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5">Combatant</div>
            <div className="col-span-3 text-right">Score (XP)</div>
            <div className="col-span-2 text-center">Wins</div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {leaderboardEntries.map((player, index) => {
              const rank = index + 1;
              const isCurrent = currentUser && player.username.toLowerCase() === currentUser.username.toLowerCase();

              return (
                <div
                  key={player.username}
                  className={`grid grid-cols-12 items-center p-3 text-xs transition-colors ${
                    isCurrent
                      ? 'bg-red-500/10 dark:bg-red-950/30 font-semibold'
                      : 'hover:bg-white dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="col-span-2 flex items-center justify-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-black text-xs ${
                        rank === 1
                          ? 'bg-amber-500 text-white shadow'
                          : rank === 2
                          ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                          : rank === 3
                          ? 'bg-amber-800 text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {rank === 1 ? <Crown className="w-3.5 h-3.5 fill-current" /> : rank}
                    </div>
                  </div>

                  <div className="col-span-5 flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={player.avatarUrl}
                        alt={player.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {player.username}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-500 font-bold">
                        You
                      </span>
                    )}
                  </div>

                  <div className="col-span-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {(player.stats?.totalScore || 0).toLocaleString()}
                  </div>

                  <div className="col-span-2 text-center text-slate-600 dark:text-slate-400 font-bold">
                    {player.stats?.wins || 0}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
