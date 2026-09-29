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
            const userIdx = mapped.findIndex(
              (m) => m.username.trim().toLowerCase() === currentUser.username.trim().toLowerCase()
            );
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
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FFFDF4] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#595955] hover:text-black dark:text-[#A4A3A3] dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B9843E] dark:text-[#FFC679] uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            Hall of Champions
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-nunito text-black dark:text-[#FEFEFD]">
            Global Leaderboard
          </h2>
          <p className="text-xs text-[#595955] dark:text-[#A4A3A3]">
            Real-time standings of registered combatants ranked by total arena experience points and match victories.
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && leaderboardEntries.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#B9843E] mx-auto" />
            <p className="text-xs text-[#595955] dark:text-[#A4A3A3] font-medium">Fetching arena combatants from Supabase...</p>
          </div>
        ) : leaderboardEntries.length === 0 ? (
          /* Empty State */
          <div className="py-14 px-6 text-center rounded-2xl border border-dashed border-[#CECCC5] dark:border-[#363535] bg-[#E5E3DB]/30 dark:bg-[#100F0F] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B9843E]/10 border border-[#B9843E]/20 text-[#B9843E] flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-black dark:text-white">
              No Combatants Ranked Yet
            </h3>
            <p className="text-xs text-[#595955] dark:text-[#A4A3A3] max-w-sm mx-auto leading-relaxed">
              Create an account, play live matches, and win questions to climb to the top of the global arena leaderboard.
            </p>
          </div>
        ) : (
          /* Leaderboard Table */
          <div className="rounded-2xl border border-[#CECCC5] dark:border-[#363535] overflow-hidden bg-[#E5E3DB]/40 dark:bg-[#100F0F]">
            <div className="grid grid-cols-12 p-3 text-xs font-bold text-[#595955] dark:text-[#A4A3A3] uppercase tracking-wider border-b border-[#CECCC5] dark:border-[#363535]">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-5">Combatant</div>
              <div className="col-span-3 text-right">Score (XP)</div>
              <div className="col-span-2 text-center">Wins</div>
            </div>

            <div className="divide-y divide-[#CECCC5] dark:divide-[#363535]">
              {leaderboardEntries.map((player, index) => {
                const rank = index + 1;
                const isCurrent = currentUser && player.username.toLowerCase() === currentUser.username.toLowerCase();

                return (
                  <div
                    key={player.username}
                    className={`grid grid-cols-12 items-center p-3 text-xs transition-colors ${
                      isCurrent
                        ? 'bg-[#B9843E]/15 dark:bg-[#B9843E]/20 font-semibold'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="col-span-2 flex items-center justify-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-nunito font-black text-xs ${
                          rank === 1
                            ? 'bg-[#FFC679] text-black shadow'
                            : rank === 2
                            ? 'bg-[#CECCC5] dark:bg-[#363535] text-black dark:text-white'
                            : rank === 3
                            ? 'bg-[#B9843E] text-white'
                            : 'text-[#595955] dark:text-[#A4A3A3]'
                        }`}
                      >
                        {rank === 1 ? <Crown className="w-3.5 h-3.5 fill-current" /> : rank}
                      </div>
                    </div>

                    <div className="col-span-5 flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-[#E5E3DB] dark:bg-[#2A2929] overflow-hidden shrink-0 border border-[#CECCC5] dark:border-[#363535]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={player.avatarUrl}
                          alt={player.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-black dark:text-white truncate">
                        {player.username}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B9843E]/20 text-[#B9843E] dark:text-[#FFC679] font-bold">
                          You
                        </span>
                      )}
                    </div>

                    <div className="col-span-3 text-right font-mono font-bold text-black dark:text-white">
                      {(player.stats?.totalScore || 0).toLocaleString()}
                    </div>

                    <div className="col-span-2 text-center text-[#595955] dark:text-[#A4A3A3] font-bold">
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
