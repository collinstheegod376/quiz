'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useAuth, UserAccount } from '@/context/AuthContext';
import { useAchievements } from '@/context/AchievementContext';
import { useGame } from '@/context/GameContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface LeaderboardDbRow {
  username: string;
  avatar_url?: string;
  created_at?: string;
  rooms_created?: number;
  matches_played?: number;
  wins?: number;
  total_score?: number;
  correct_answers?: number;
  total_answers?: number;
}
import {
  Trophy,
  Crown,
  Medal,
  ArrowLeft,
  Search,
  Sparkles,
  Flame,
  Zap,
  TrendingUp,
  Award,
  Users,
  Swords,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export function LeaderboardScreen() {
  const { currentUser, openAuthModal } = useAuth();
  const { checkLeaderboardRank } = useAchievements();
  const { setCurrentView } = useGame();

  const [leaderboardEntries, setLeaderboardEntries] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username, avatar_url, created_at, rooms_created, matches_played, wins, total_score, correct_answers, total_answers')
          .order('total_score', { ascending: false })
          .limit(100);

        if (error) {
          console.error('[Leaderboard] Supabase query failed:', error.message);
          setLeaderboardEntries([]);
        } else if (data) {
          const mapped: UserAccount[] = (data as unknown as LeaderboardDbRow[]).map((row) => ({
            username: row.username,
            avatarUrl: row.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${row.username}`,
            createdAt: row.created_at || new Date().toISOString(),
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

          // Evaluate user achievements (Top 10, Top 3, #1)
          if (currentUser) {
            const userIdx = mapped.findIndex(
              (m) => m.username.trim().toLowerCase() === currentUser.username.trim().toLowerCase()
            );
            if (userIdx !== -1) {
              checkLeaderboardRank(userIdx + 1);
            }
          }
        }
      } catch (err) {
        console.error('[Leaderboard] Error fetching profiles:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setLeaderboardEntries([]);
    }
  }, [currentUser, checkLeaderboardRank]);

  useEffect(() => {
    fetchLeaderboard();

    if (!isSupabaseConfigured) return;

    // Realtime subscription for live rank updates
    const channel = supabase
      .channel('public:user_profiles_leaderboard_screen')
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
  }, [fetchLeaderboard]);

  // Current user's index in the global leaderboard
  const currentUserIndex = useMemo(() => {
    if (!currentUser) return -1;
    return leaderboardEntries.findIndex(
      (entry) => entry.username.trim().toLowerCase() === currentUser.username.trim().toLowerCase()
    );
  }, [currentUser, leaderboardEntries]);

  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;

  // Filtered entries based on search
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return leaderboardEntries;
    const query = searchQuery.toLowerCase().trim();
    return leaderboardEntries.filter((entry) =>
      entry.username.toLowerCase().includes(query)
    );
  }, [leaderboardEntries, searchQuery]);

  // Top 3 Podium players
  const top1 = leaderboardEntries[0];
  const top2 = leaderboardEntries[1];
  const top3 = leaderboardEntries[2];

  return (
    <div className="min-h-screen bg-[#FFFDF4] dark:bg-[#100F0F] text-black dark:text-[#FEFEFD] transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn">
        {/* Navigation / Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] hover:bg-black/10 dark:hover:bg-white/10 text-xs sm:text-sm font-nunito font-extrabold transition-colors cursor-pointer w-fit border border-[#CECCC5] dark:border-[#363535]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Arena
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] hover:bg-black/10 dark:hover:bg-white/10 text-xs font-nunito font-bold transition-colors cursor-pointer border border-[#CECCC5] dark:border-[#363535]"
              title="Refresh standings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4CA471]/15 text-[#2E7D4E] dark:text-[#6FD198] text-xs font-nunito font-extrabold border border-[#4CA471]/30">
              <span className="w-2 h-2 rounded-full bg-[#4CA471] animate-pulse" />
              Live Arena Ranks
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-nunito font-black uppercase tracking-widest text-[#B9843E] dark:text-[#FFC679]">
            <Trophy className="w-4 h-4" />
            Hall of Champions
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-nunito tracking-tight text-black dark:text-[#FEFEFD]">
            Global Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-[#595955] dark:text-[#A4A3A3] max-w-2xl">
            Real-time worldwide rankings of registered quiz combatants scored by total match victories, lightning speed, and battle arena points.
          </p>
        </div>

        {/* Current User Quick-Status Card */}
        {currentUser ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFC679]/20 via-[#4CA471]/10 to-transparent dark:from-[#FFC679]/10 dark:via-[#4CA471]/5 border border-[#CECCC5] dark:border-[#363535] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black dark:border-white shadow-sm shrink-0 relative">
                <Image
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-nunito font-black text-base text-black dark:text-[#FEFEFD]">
                    {currentUser.username}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black">
                    You
                  </span>
                </div>
                <p className="text-xs text-[#595955] dark:text-[#A4A3A3] mt-0.5">
                  {currentUserRank
                    ? `Currently ranked #${currentUserRank} worldwide`
                    : 'Play matches to enter the worldwide ranks'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 border-t sm:border-t-0 border-[#CECCC5]/60 dark:border-[#363535] pt-3 sm:pt-0">
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#595955] dark:text-[#A4A3A3]">
                  Arena Score
                </p>
                <p className="text-lg font-nunito font-black text-[#B9843E] dark:text-[#FFC679]">
                  {(currentUser.stats?.totalScore || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#595955] dark:text-[#A4A3A3]">
                  Victories
                </p>
                <p className="text-lg font-nunito font-black text-[#4CA471] dark:text-[#6FD198]">
                  {(currentUser.stats?.wins || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#595955] dark:text-[#A4A3A3]">
                  Matches
                </p>
                <p className="text-lg font-nunito font-black text-black dark:text-[#FEFEFD]">
                  {(currentUser.stats?.matchesPlayed || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Guest Mode Status Banner */
          <div className="p-4 sm:p-5 rounded-2xl bg-[#E5E3DB]/40 dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-nunito font-black text-sm text-black dark:text-white">
                  Viewing in Guest Mode
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/10 dark:bg-white/10 text-black dark:text-white">
                  Guest
                </span>
              </div>
              <p className="text-xs text-[#595955] dark:text-[#A4A3A3] max-w-xl">
                Guest combatants are welcome in all arenas, but leaderboard rankings and permanent XP require a registered combatant profile.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="shrink-0 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-nunito font-black text-xs hover:bg-black/80 dark:hover:bg-white/90 transition-all cursor-pointer shadow-sm text-center"
            >
              Sign Up to Claim Rank
            </button>
          </div>
        )}

        {/* Podium Display (Top 3) */}
        {!isLoading && leaderboardEntries.length >= 3 && !searchQuery && (
          <div className="pt-6 sm:pt-8">
            <h2 className="text-xs font-black font-nunito uppercase tracking-widest text-center text-[#595955] dark:text-[#A4A3A3] mb-8">
              Arena Grand Podium
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-2xl mx-auto items-end">
              {/* Rank 2 (Silver) */}
              {top2 && (
                <div className="flex flex-col items-center p-3 sm:p-5 rounded-2xl bg-[#E5E3DB]/80 dark:bg-[#1E1D1D] border-2 border-slate-300 dark:border-slate-700 shadow-md transform hover:-translate-y-1 transition-all">
                  <div className="relative mb-2 sm:mb-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-slate-400 dark:border-slate-500 shadow-inner relative">
                      <Image src={top2.avatarUrl} alt={top2.username} width={64} height={64} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-[10px] sm:text-xs font-black rounded-full border border-slate-400">
                      #2
                    </div>
                  </div>
                  <h3 className="font-nunito font-black text-xs sm:text-sm text-center truncate max-w-full text-black dark:text-[#FEFEFD]">
                    {top2.username}
                  </h3>
                  <p className="text-xs sm:text-sm font-black font-nunito text-[#B9843E] dark:text-[#FFC679] mt-1">
                    {(top2.stats?.totalScore || 0).toLocaleString()} XP
                  </p>
                  <p className="text-[10px] text-[#595955] dark:text-[#A4A3A3]">
                    {top2.stats?.wins || 0} Wins
                  </p>
                </div>
              )}

              {/* Rank 1 (Gold - Elevated) */}
              {top1 && (
                <div className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[#FFC679]/30 to-[#E5E3DB]/90 dark:from-[#FFC679]/20 dark:to-[#1E1D1D] border-2 border-[#FFC679] shadow-xl relative -mt-4 transform hover:-translate-y-1 transition-all">
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-[#B9843E] dark:text-[#FFC679] absolute -top-4 sm:-top-5 animate-bounce" />
                  <div className="relative mb-2 sm:mb-3 mt-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-[#FFC679] shadow-lg relative">
                      <Image src={top1.avatarUrl} alt={top1.username} width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#FFC679] text-black text-[10px] sm:text-xs font-black rounded-full shadow-md">
                      #1
                    </div>
                  </div>
                  <h3 className="font-nunito font-black text-sm sm:text-base text-center truncate max-w-full text-black dark:text-[#FEFEFD]">
                    {top1.username}
                  </h3>
                  <p className="text-sm sm:text-base font-black font-nunito text-[#B9843E] dark:text-[#FFC679] mt-1">
                    {(top1.stats?.totalScore || 0).toLocaleString()} XP
                  </p>
                  <p className="text-[11px] font-bold text-[#4CA471] dark:text-[#6FD198]">
                    {top1.stats?.wins || 0} Wins
                  </p>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {top3 && (
                <div className="flex flex-col items-center p-3 sm:p-5 rounded-2xl bg-[#E5E3DB]/80 dark:bg-[#1E1D1D] border-2 border-amber-800/40 dark:border-amber-700/50 shadow-md transform hover:-translate-y-1 transition-all">
                  <div className="relative mb-2 sm:mb-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-700 dark:border-amber-600 shadow-inner relative">
                      <Image src={top3.avatarUrl} alt={top3.username} width={64} height={64} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-700 text-white text-[10px] sm:text-xs font-black rounded-full border border-amber-800">
                      #3
                    </div>
                  </div>
                  <h3 className="font-nunito font-black text-xs sm:text-sm text-center truncate max-w-full text-black dark:text-[#FEFEFD]">
                    {top3.username}
                  </h3>
                  <p className="text-xs sm:text-sm font-black font-nunito text-[#B9843E] dark:text-[#FFC679] mt-1">
                    {(top3.stats?.totalScore || 0).toLocaleString()} XP
                  </p>
                  <p className="text-[10px] text-[#595955] dark:text-[#A4A3A3]">
                    {top3.stats?.wins || 0} Wins
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#595955] dark:text-[#A4A3A3]" />
          <input
            type="text"
            placeholder="Search combatant by username..."
            aria-label="Search combatant by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#E5E3DB] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] text-sm text-black dark:text-white placeholder-[#595955] dark:placeholder-[#A4A3A3] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-nunito"
          />
        </div>

        {/* Standings Table Card */}
        <div className="rounded-3xl bg-[#FFFDF4] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3.5 bg-[#E5E3DB] dark:bg-[#2A2929] border-b border-[#CECCC5] dark:border-[#363535] text-[11px] font-black uppercase tracking-wider text-[#595955] dark:text-[#A4A3A3]">
            <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
            <div className="col-span-6 sm:col-span-5">Combatant</div>
            <div className="hidden sm:block sm:col-span-2 text-center">Win Rate</div>
            <div className="hidden sm:block sm:col-span-2 text-center">Victories</div>
            <div className="col-span-4 sm:col-span-2 text-right">Total Score</div>
          </div>

          {/* Table Body */}
          {isLoading && leaderboardEntries.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#B9843E] dark:text-[#FFC679] mx-auto" />
              <p className="text-xs text-[#595955] dark:text-[#A4A3A3] font-nunito font-semibold">
                Syncing live global standings from Supabase...
              </p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <Trophy className="w-10 h-10 text-[#CECCC5] dark:text-[#363535] mx-auto" />
              <p className="font-nunito font-extrabold text-base text-black dark:text-[#FEFEFD]">
                {searchQuery ? 'No combatants matched your search.' : 'No registered records found.'}
              </p>
              <p className="text-xs text-[#595955] dark:text-[#A4A3A3] max-w-sm mx-auto">
                Play tournament matches to record your battle history on the global arena leaderboard!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#CECCC5]/60 dark:divide-[#363535]">
              {filteredEntries.map((entry, idx) => {
                const rank = idx + 1;
                const isCurrent =
                  currentUser &&
                  entry.username.trim().toLowerCase() === currentUser.username.trim().toLowerCase();

                const totalMatches = entry.stats?.matchesPlayed || 0;
                const wins = entry.stats?.wins || 0;
                const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

                return (
                  <div
                    key={`${entry.username}-${idx}`}
                    className={`grid grid-cols-12 gap-2 items-center px-4 sm:px-6 py-3.5 transition-colors ${
                      isCurrent
                        ? 'bg-[#FFC679]/20 dark:bg-[#FFC679]/10 font-bold border-l-4 border-l-[#B9843E] dark:border-l-[#FFC679]'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-nunito font-black text-xs sm:text-sm ${
                          rank === 1
                            ? 'bg-[#FFC679] text-black shadow-sm'
                            : rank === 2
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'text-[#595955] dark:text-[#A4A3A3]'
                        }`}
                      >
                        {rank === 1 ? <Crown className="w-4 h-4" /> : rank}
                      </div>
                    </div>

                    {/* Combatant Info */}
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-black/20 dark:border-white/20 shrink-0 relative">
                        <Image
                          src={entry.avatarUrl}
                          alt={entry.username}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-nunito font-extrabold text-xs sm:text-sm truncate text-black dark:text-[#FEFEFD]">
                            {entry.username}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#595955] dark:text-[#A4A3A3] truncate">
                          {totalMatches} matches played
                        </p>
                      </div>
                    </div>

                    {/* Win Rate */}
                    <div className="hidden sm:flex sm:col-span-2 items-center justify-center gap-1 text-xs font-nunito font-bold text-[#595955] dark:text-[#A4A3A3]">
                      <span>{winRate}%</span>
                    </div>

                    {/* Victories */}
                    <div className="hidden sm:flex sm:col-span-2 items-center justify-center gap-1 text-xs font-nunito font-extrabold text-[#4CA471] dark:text-[#6FD198]">
                      <span>{wins}</span>
                    </div>

                    {/* Score */}
                    <div className="col-span-4 sm:col-span-2 text-right">
                      <span className="font-nunito font-black text-xs sm:text-sm text-[#B9843E] dark:text-[#FFC679]">
                        {(entry.stats?.totalScore || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
