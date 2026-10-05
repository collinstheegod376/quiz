'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Achievement, UserAchievementState } from '@/types/achievement';
import { ACHIEVEMENTS } from '@/data/achievements';
import { sound } from '@/lib/sound';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import confetti from 'canvas-confetti';

interface MatchContext {
  topicId: string;
  difficultyLevel: number;
  totalQuestions: number;
  correctAnswers: number;
  maxStreak: number;
  fastestAnswerSec: number;
  avgResponseSec: number;
  playerRank: number; // 1 = 1st place, 2 = 2nd, etc.
  totalScore: number;
  careerCorrect: number;
  careerMatches: number;
  careerTotalScore: number;
  uniqueTopicsPlayed?: string[];
}

interface AchievementContextType {
  achievements: (Achievement & UserAchievementState)[];
  unlockedCount: number;
  totalCount: number;
  completionPercentage: number;
  totalXpEarned: number;
  unlockAchievement: (id: string) => void;
  updateProgress: (id: string, value: number, isDelta?: boolean) => void;
  checkMatchAchievements: (ctx: MatchContext) => void;
  checkLeaderboardRank: (rank: number) => void;
  activeToast: Achievement | null;
  dismissToast: () => void;
}

const BASE_STORAGE_KEY = 'anizuki_achievements_v1';

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [userStates, setUserStates] = useState<Record<string, UserAchievementState>>({});
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);

  const userStatesRef = useRef<Record<string, UserAchievementState>>({});
  userStatesRef.current = userStates;
  const isInitialMount = useRef(true);

  // Compute session-isolated key strictly for authenticated users
  const storageKey = currentUser
    ? `${BASE_STORAGE_KEY}_${currentUser.username.toLowerCase()}`
    : null;

  // Purge any legacy guest achievement storage on mount
  useEffect(() => {
    try {
      localStorage.removeItem(`${BASE_STORAGE_KEY}_guest`);
    } catch {
      // Ignore
    }
  }, []);

  // Load from localStorage and sync with Supabase user_achievements table (Bugs 14 & 15)
  useEffect(() => {
    if (!storageKey || !currentUser) {
      setUserStates({});
      return;
    }

    let localData: Record<string, UserAchievementState> = {};
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        localData = JSON.parse(stored);
        setUserStates(localData);
      } else {
        setUserStates({});
      }
    } catch (e) {
      console.error('[Achievements] Failed to load from storage:', e);
    }

    // Remote sync with Supabase user_achievements table
    if (isSupabaseConfigured) {
      const syncRemote = async () => {
        try {
          const { data, error } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked, unlocked_at, progress')
            .eq('username', currentUser.username.toLowerCase());

          if (!error && data && data.length > 0) {
            setUserStates((prev) => {
              const merged = { ...prev };
              data.forEach((row) => {
                const existing = merged[row.achievement_id];
                const isUnlocked = row.unlocked || existing?.unlocked || false;
                const progress = Math.max(row.progress || 0, existing?.progress || 0);
                merged[row.achievement_id] = {
                  unlocked: isUnlocked,
                  unlockedAt: row.unlocked_at || existing?.unlockedAt,
                  progress,
                };
              });
              try {
                localStorage.setItem(storageKey, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          } else if (!error && data && data.length === 0 && Object.keys(localData).length > 0) {
            // Seed Supabase with existing local state if remote is fresh
            const rowsToInsert = Object.entries(localData).map(([achId, state]) => ({
              user_id: currentUser.id || null,
              username: currentUser.username.toLowerCase(),
              achievement_id: achId,
              unlocked: state.unlocked,
              unlocked_at: state.unlocked ? new Date().toISOString() : null,
              progress: state.progress || 0,
            }));
            await supabase.from('user_achievements').upsert(rowsToInsert, {
              onConflict: 'username,achievement_id',
            });
          }
        } catch (err) {
          console.error('[Achievements] Remote sync error:', err);
        }
      };
      syncRemote();
    }
  }, [storageKey, currentUser]);

  // Persist to scoped storage key whenever userStates change
  useEffect(() => {
    if (!storageKey) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(userStates));
    } catch (e) {
      console.error('[Achievements] Failed to save to storage:', e);
    }
  }, [userStates, storageKey]);

  const triggerCelebration = useCallback((achievement: Achievement) => {
    sound.playAchievement();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.9, y: 0.2 },
        colors: ['#FFC679', '#4CA471', '#6FEEFF', '#FFA7A0'],
      });
    } catch {
      // Ignore
    }

    setToastQueue((prev) => {
      if (prev.some((a) => a.id === achievement.id)) return prev;
      return [...prev, achievement];
    });
  }, []);

  // Dequeue next toast when previous one dismisses
  useEffect(() => {
    if (!activeToast && toastQueue.length > 0) {
      const nextToast = toastQueue[0];
      setActiveToast(nextToast);
      setToastQueue((prev) => prev.slice(1));
    }
  }, [activeToast, toastQueue]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Auto-dismiss toast after 4.5 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const unlockAchievement = useCallback(
    (id: string) => {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (!def) return;
      if (userStatesRef.current[id]?.unlocked) return; // already unlocked

      triggerCelebration(def);
      const unlockedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setUserStates((prev) => {
        if (prev[id]?.unlocked) return prev;
        const next = {
          ...prev,
          [id]: {
            unlocked: true,
            unlockedAt: unlockedDate,
            progress: def.target,
          },
        };
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {}
        }
        return next;
      });

      // Persist to Supabase user_achievements table (Bugs 14 & 15)
      if (currentUser && isSupabaseConfigured) {
        (async () => {
          try {
            const { error } = await supabase
              .from('user_achievements')
              .upsert(
                {
                  user_id: currentUser.id || null,
                  username: currentUser.username.toLowerCase(),
                  achievement_id: id,
                  unlocked: true,
                  unlocked_at: new Date().toISOString(),
                  progress: def.target,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'username,achievement_id' }
              );
            if (error) console.error('[Achievements] Supabase unlock upsert failed:', error.message);
          } catch (err) {
            console.error('[Achievements] Supabase unlock error:', err);
          }
        })();
      }
    },
    [triggerCelebration, currentUser, storageKey]
  );

  const updateProgress = useCallback(
    (id: string, value: number, isDelta = false) => {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (!def) return;

      const current = userStatesRef.current[id] || { unlocked: false, progress: 0 };
      if (current.unlocked) return;

      const newProg = isDelta ? current.progress + value : Math.max(current.progress, value);
      const didUnlock = newProg >= def.target;

      if (didUnlock) {
        triggerCelebration(def);
      }

      const unlockedDate = didUnlock
        ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : undefined;

      setUserStates((prev) => {
        const cur = prev[id] || { unlocked: false, progress: 0 };
        if (cur.unlocked) return prev;

        const calculatedProg = isDelta ? cur.progress + value : Math.max(cur.progress, value);
        const unlocked = calculatedProg >= def.target;

        const next = {
          ...prev,
          [id]: {
            unlocked,
            unlockedAt: unlocked ? (cur.unlockedAt || unlockedDate) : undefined,
            progress: Math.min(calculatedProg, def.target),
          },
        };
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {}
        }
        return next;
      });

      // Persist progress to Supabase user_achievements table (Bugs 14 & 15)
      if (currentUser && isSupabaseConfigured) {
        const currentProg = userStatesRef.current[id]?.progress || 0;
        const calculatedProg = isDelta ? currentProg + value : Math.max(currentProg, value);
        const unlocked = calculatedProg >= def.target;
        (async () => {
          try {
            const { error } = await supabase
              .from('user_achievements')
              .upsert(
                {
                  user_id: currentUser.id || null,
                  username: currentUser.username.toLowerCase(),
                  achievement_id: id,
                  unlocked,
                  unlocked_at: unlocked ? new Date().toISOString() : null,
                  progress: Math.min(calculatedProg, def.target),
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'username,achievement_id' }
              );
            if (error) console.error('[Achievements] Supabase progress upsert failed:', error.message);
          } catch (err) {
            console.error('[Achievements] Supabase progress error:', err);
          }
        })();
      }
    },
    [triggerCelebration, currentUser, storageKey]
  );

  // Auto-unlock room_host if user has created rooms (Bug 18)
  useEffect(() => {
    if (currentUser?.stats?.roomsCreated && currentUser.stats.roomsCreated >= 1) {
      unlockAchievement('room_host');
    }
  }, [currentUser?.stats?.roomsCreated, unlockAchievement]);

  // Evaluates achievements after each match
  const checkMatchAchievements = useCallback(
    (ctx: MatchContext) => {
      // 1. Beginner achievements
      unlockAchievement('first_steps');
      if (ctx.correctAnswers > 0) unlockAchievement('first_blood');
      updateProgress('getting_started', ctx.careerCorrect);
      updateProgress('match_trio', ctx.careerMatches);
      if (ctx.difficultyLevel <= 2) unlockAchievement('easy_scholar');

      // 2. Skill achievements
      if (ctx.fastestAnswerSec > 0 && ctx.fastestAnswerSec <= 2.0) unlockAchievement('speed_demon');
      // Bug 18: Lightning reflexes (5 answers with fast response)
      if (ctx.avgResponseSec > 0 && ctx.avgResponseSec <= 2.5 && ctx.correctAnswers >= 5) {
        unlockAchievement('lightning_reflexes');
      }
      if (ctx.totalQuestions >= 5 && ctx.correctAnswers === ctx.totalQuestions) unlockAchievement('flawless_victory');
      if (ctx.totalQuestions >= 5 && (ctx.correctAnswers / ctx.totalQuestions) >= 0.9) unlockAchievement('sharp_shooter');
      if (ctx.difficultyLevel >= 4 && ctx.difficultyLevel <= 6) unlockAchievement('tactician_medium');
      if (ctx.difficultyLevel >= 7 && ctx.difficultyLevel <= 8) unlockAchievement('high_sorcerer');
      if (ctx.difficultyLevel === 10 && (ctx.correctAnswers / Math.max(1, ctx.totalQuestions)) >= 0.7) unlockAchievement('nightmare_slayer');

      // 3. Streaks
      if (ctx.maxStreak >= 3) unlockAchievement('hot_streak_3');
      if (ctx.maxStreak >= 5) unlockAchievement('hot_streak_5');
      if (ctx.maxStreak >= 10) unlockAchievement('hot_streak_10');

      // 4. Podiums & Wins (Synced to career multiplayer wins)
      if (ctx.playerRank <= 3) unlockAchievement('podium_finish');
      if (ctx.playerRank === 1) {
        unlockAchievement('win_1');
      }
      const careerWins = currentUser?.stats?.wins ?? (ctx.playerRank === 1 ? 1 : 0);
      if (careerWins >= 3) unlockAchievement('win_3');
      else updateProgress('win_3', careerWins);
      if (careerWins >= 10) unlockAchievement('win_10');
      else updateProgress('win_10', careerWins);

      // 5. Topic Mastery (at least 70% accuracy) — Bug 17: Support both canonical IDs and common aliases
      const topicRatio = ctx.totalQuestions > 0 ? ctx.correctAnswers / ctx.totalQuestions : 0;
      if (topicRatio >= 0.7) {
        const topicMap: Record<string, string> = {
          'one-piece': 'topic_one_piece',
          'naruto': 'topic_naruto',
          'bleach': 'topic_bleach',
          'demon-slayer': 'topic_demon_slayer',
          'attack-on-titan': 'topic_aot',
          'jujutsu-kaisen': 'topic_jjk',
          'gojo-vs-sukuna': 'topic_jjk',
          'dragon-ball': 'topic_dbz',
          'hunter-x-hunter': 'topic_hxh',
          'fullmetal-alchemist': 'topic_fma',
          'cyberpunk-edgerunners': 'topic_cyberpunk',
          'reincarnated-slime': 'topic_slime',
          'reincarnated-as-a-slime': 'topic_slime',
          'jobless-reincarnation': 'topic_mushoku',
          'mushoku-tensei': 'topic_mushoku',
          'spy-x-family': 'topic_spyxfamily',
          'darwins-game': 'topic_darwins_game',
          'darwin-game': 'topic_darwins_game',
          'the-boys': 'topic_the_boys',
          'breaking-bad': 'topic_breaking_bad',
          'stranger-things': 'topic_stranger_things',
          'game-of-thrones': 'topic_got',
          'modern-family': 'topic_modern_family',
          'black-lightning': 'topic_black_lightning',
          'gta-v': 'topic_gta',
          'gtav': 'topic_gta',
        };
        if (topicMap[ctx.topicId]) {
          unlockAchievement(topicMap[ctx.topicId]);
        }
      }

      // 6. Career totals
      updateProgress('century_club', ctx.careerCorrect);
      updateProgress('grand_scholar', ctx.careerCorrect);
      updateProgress('half_millennium', ctx.careerCorrect);
      updateProgress('omniscient_god', ctx.careerCorrect);
      updateProgress('quiz_veteran', ctx.careerMatches);
      updateProgress('score_millionaire', ctx.careerTotalScore);

      // 7. Social Butterfly (Bug 18: tracked across played unique topics)
      if (ctx.uniqueTopicsPlayed && ctx.uniqueTopicsPlayed.length > 0) {
        updateProgress('social_butterfly', ctx.uniqueTopicsPlayed.length);
        if (ctx.uniqueTopicsPlayed.length >= 5) {
          unlockAchievement('social_butterfly');
        }
      }
    },
    [unlockAchievement, updateProgress, currentUser]
  );

  // Leaderboard rank evaluation
  const checkLeaderboardRank = useCallback(
    (rank: number) => {
      if (rank <= 10) unlockAchievement('leaderboard_top_10');
      if (rank <= 3) unlockAchievement('leaderboard_top_3');
      if (rank === 1) unlockAchievement('leaderboard_apex_1');
    },
    [unlockAchievement]
  );

  // Memoized merged achievements with state
  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map((def) => {
      const state = userStates[def.id] || { unlocked: false, progress: 0 };
      return {
        ...def,
        unlocked: state.unlocked,
        unlockedAt: state.unlockedAt,
        progress: state.unlocked ? def.target : (state.progress || 0),
      };
    });
  }, [userStates]);

  const unlockedCount = useMemo(() => achievements.filter((a) => a.unlocked).length, [achievements]);
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);
  const totalXpEarned = useMemo(
    () => achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0),
    [achievements]
  );

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        unlockedCount,
        totalCount,
        completionPercentage,
        totalXpEarned,
        unlockAchievement,
        updateProgress,
        checkMatchAchievements,
        checkLeaderboardRank,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}
