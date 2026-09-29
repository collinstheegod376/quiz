export type AchievementCategory =
  | 'beginner'
  | 'skill'
  | 'streaks'
  | 'leaderboard'
  | 'topics'
  | 'grind';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  target: number;
  xpReward: number;
  secret?: boolean;
}

export interface UserAchievementState {
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}
