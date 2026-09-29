'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserAccount } from '@/context/AuthContext';
import { useAchievements } from '@/context/AchievementContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  X,
  Trophy,
  Crown,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface GlobalLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalLeaderboardModal({ isOpen, onClose }: GlobalLeaderboardModalProps) {
  const { currentUser } = useAuth();
  const { checkLeaderboardRank } = useAchievements();
  const [leaderboardEntries, setLeaderboardEntries] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (isSupabaseConfigured) {
      setIsLoading(true);
      try {
        // 1. Fetch from Supabase
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('total_score', { ascending: false })
          .limit(50);

        if (error) {
          console.error('[Leaderboard] Supabase query failed:', error.message);
          setLeaderboardEntries([]);
          setIsLoading(false);
          return;
        }

        if (data) {
          const mapped: UserAccount[] = data.map((row) => ({
            username: row.username,
            passwordHash: row.password_hash,
            avatarUrl: row.avatar_url,
            createdAt: row.created_at,
            stats: {
              roomsCreated: row.rooms_created || 0,
              matchesPlayed: row.matches_played || 0,
              wins: row.wins || 0,
              totalScore: row.total_score || 0,
              correctAnswers: row.correct_answers || 0,
              totalAnswers: row.total_answers || 0,
            },
          }));
          setLeaderboardEntries(mapped);

          // Check if current user is in top 10, top 3, or #1
          if (currentUser) {
            const userIdx = mapped.findIndex((m) => m.username === currentUser.username);
            if (userIdx !== -1) {
              checkLeaderboardRank(userIdx + 1);
            }
          }
        }
      } catch (e) {
        console.error('[Leaderboard] Supabase error:', e);
        setLeaderboardEntries([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setLeaderboardEntries([]);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    fetchLeaderboard();

    if (!isSupabaseConfigured) return;

    // Subscribe to live leaderboard changes on Supabase
    const channel = supabase
      .channel('public:user_profiles_leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, fetchLeaderboard]);

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
            Real-time standings of registered combatants ranked by total arena experience points and match victories.
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && leaderboardEntries.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Fetching arena combatants from Supabase...</p>
          </div>
        ) : leaderboardEntries.length === 0 ? (
          /* Empty State */
          <div className="py-14 px-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Combatants Ranked Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Create an account, play live matches, and win questions to climb to the top of the global arena leaderboard.
            </p>
          </div>
        ) : (
          /* Leaderboard Table */
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
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold">
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
        )}
      </div>
    </div>
  );
}
