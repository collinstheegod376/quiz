'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Achievement, UserAchievementState } from '@/types/achievement';
import { ACHIEVEMENTS } from '@/data/achievements';
import { sound } from '@/lib/sound';
import { useAuth } from '@/context/AuthContext';
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

  // Compute session-isolated key so guests and logged-in accounts never share milestone states
  const storageKey = currentUser
    ? `${BASE_STORAGE_KEY}_${currentUser.username.toLowerCase()}`
    : `${BASE_STORAGE_KEY}_guest`;

  // Load from localStorage on mount and whenever the active user changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setUserStates(JSON.parse(stored));
      } else {
        setUserStates({});
      }
    } catch (e) {
      console.error('[Achievements] Failed to load from storage:', e);
      setUserStates({});
    }
  }, [storageKey]);

  // Persist to scoped storage key whenever userStates change
  useEffect(() => {
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
      setUserStates((prev) => {
        if (prev[id]?.unlocked) return prev;
        return {
          ...prev,
          [id]: {
            unlocked: true,
            unlockedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            progress: def.target,
          },
        };
      });
    },
    [triggerCelebration]
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

      setUserStates((prev) => {
        const cur = prev[id] || { unlocked: false, progress: 0 };
        if (cur.unlocked) return prev;

        const calculatedProg = isDelta ? cur.progress + value : Math.max(cur.progress, value);
        const unlocked = calculatedProg >= def.target;

        return {
          ...prev,
          [id]: {
            unlocked,
            unlockedAt: unlocked ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
            progress: Math.min(calculatedProg, def.target),
          },
        };
      });
    },
    [triggerCelebration]
  );

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
      if (ctx.totalQuestions >= 5 && ctx.correctAnswers === ctx.totalQuestions) unlockAchievement('flawless_victory');
      if (ctx.totalQuestions >= 5 && (ctx.correctAnswers / ctx.totalQuestions) >= 0.9) unlockAchievement('sharp_shooter');
      if (ctx.difficultyLevel >= 4 && ctx.difficultyLevel <= 6) unlockAchievement('tactician_medium');
      if (ctx.difficultyLevel >= 7 && ctx.difficultyLevel <= 8) unlockAchievement('high_sorcerer');
      if (ctx.difficultyLevel === 10 && (ctx.correctAnswers / Math.max(1, ctx.totalQuestions)) >= 0.7) unlockAchievement('nightmare_slayer');

      // 3. Streaks
      if (ctx.maxStreak >= 3) unlockAchievement('hot_streak_3');
      if (ctx.maxStreak >= 5) unlockAchievement('hot_streak_5');
      if (ctx.maxStreak >= 10) unlockAchievement('hot_streak_10');

      // 4. Podiums & Wins
      if (ctx.playerRank <= 3) unlockAchievement('podium_finish');
      if (ctx.playerRank === 1) {
        unlockAchievement('win_1');
        updateProgress('win_3', 1, true);
        updateProgress('win_10', 1, true);
      }

      // 5. Topic Mastery (at least 70% accuracy)
      const topicRatio = ctx.totalQuestions > 0 ? ctx.correctAnswers / ctx.totalQuestions : 0;
      if (topicRatio >= 0.7) {
        const topicMap: Record<string, string> = {
          'one-piece': 'topic_one_piece',
          'naruto': 'topic_naruto',
          'bleach': 'topic_bleach',
          'demon-slayer': 'topic_demon_slayer',
          'attack-on-titan': 'topic_aot',
          'gojo-vs-sukuna': 'topic_jjk',
          'dragon-ball': 'topic_dbz',
          'hunter-x-hunter': 'topic_hxh',
          'fullmetal-alchemist': 'topic_fma',
          'cyberpunk-edgerunners': 'topic_cyberpunk',
          'reincarnated-as-a-slime': 'topic_slime',
          'mushoku-tensei': 'topic_mushoku',
          'spy-x-family': 'topic_spyxfamily',
          'darwin-game': 'topic_darwins_game',
          'the-boys': 'topic_the_boys',
          'breaking-bad': 'topic_breaking_bad',
          'stranger-things': 'topic_stranger_things',
          'game-of-thrones': 'topic_got',
          'modern-family': 'topic_modern_family',
          'black-lightning': 'topic_black_lightning',
          'gta-v': 'topic_gta',
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

      if (ctx.uniqueTopicsPlayed && ctx.uniqueTopicsPlayed.length >= 5) {
        unlockAchievement('social_butterfly');
      }
    },
    [unlockAchievement, updateProgress]
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
