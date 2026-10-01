import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map((byte) => chars[byte % chars.length])
    .join('');
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateGameLength(playerCount: number): number {
  if (playerCount <= 2) return 10;
  if (playerCount === 3) return 12;
  return 15; // 4 players
}

// ─── Mathematical Scoring & XP Engine ────────────────────────────────────────

export interface XpCalculationParams {
  isCorrect: boolean;
  responseTimeMs: number;
  timePerQuestion: number;
  streak: number;
  difficultyLevel: number;
}

export interface XpCalculationResult {
  isCorrect: boolean;
  pointsAwarded: number;
  basePoints: number;
  timeBonus: number;
  streakBonus: number;
  difficultyMultiplier: number;
  newStreak: number;
}

/**
 * Calculates mathematically sound XP allocation:
 * XP = floor((Base + TimeBonus + StreakBonus) * DifficultyMultiplier)
 * - Base = 1,000 XP
 * - TimeBonus = floor(500 * max(0, (T - t) / T)) -> exact 500 at 0s, exact 0 at T
 * - StreakBonus = min(500, max(0, (newStreak - 1) * 100))
 * - DifficultyMultiplier = 1.0 + 0.10 * (L - 1) -> 1.0x at Lvl 1, 1.9x at Lvl 10
 */
export function calculateQuestionXp(params: XpCalculationParams): XpCalculationResult {
  const { isCorrect, responseTimeMs, timePerQuestion, streak, difficultyLevel } = params;

  if (!isCorrect) {
    return {
      isCorrect: false,
      pointsAwarded: 0,
      basePoints: 0,
      timeBonus: 0,
      streakBonus: 0,
      difficultyMultiplier: 1,
      newStreak: 0,
    };
  }

  const basePoints = 1000;
  const newStreak = (streak || 0) + 1;

  // Normalized linear time bonus: 500 at 0s, 0 at timePerQuestion
  const totalAllowedSec = Math.max(5, timePerQuestion || 15);
  const responseSec = Math.min(totalAllowedSec, Math.max(0.05, responseTimeMs / 1000));
  const timeFactor = Math.max(0, (totalAllowedSec - responseSec) / totalAllowedSec);
  const timeBonus = Math.floor(500 * timeFactor);

  // Streak combo bonus: +100 per consecutive question beyond the first, capped at +500
  const streakBonus = Math.min(500, Math.max(0, (newStreak - 1) * 100));

  // Difficulty scalar: 1.0x at Level 1 up to 1.9x at Level 10
  const clampedLevel = Math.max(1, Math.min(10, difficultyLevel || 1));
  const difficultyMultiplier = 1 + (clampedLevel - 1) * 0.10;

  const pointsAwarded = Math.floor((basePoints + timeBonus + streakBonus) * difficultyMultiplier);

  return {
    isCorrect: true,
    pointsAwarded,
    basePoints,
    timeBonus,
    streakBonus,
    difficultyMultiplier,
    newStreak,
  };
}

/**
 * Validates player answer against canonical question correctOption,
 * preventing false positives from undefined keys or case/whitespace drift.
 */
export function validateAnswerOption(
  selectedOption: string | null | undefined,
  correctOption: string | null | undefined
): { isCorrect: boolean; canonicalCorrect: 'A' | 'B' | 'C' | 'D' | null } {
  if (!selectedOption || !correctOption) {
    return { isCorrect: false, canonicalCorrect: null };
  }

  const normSelected = String(selectedOption).trim().toUpperCase();
  const normCorrect = String(correctOption).trim().toUpperCase();

  const validKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const canonicalCorrect = validKeys.includes(normCorrect as 'A' | 'B' | 'C' | 'D')
    ? (normCorrect as 'A' | 'B' | 'C' | 'D')
    : null;

  if (!canonicalCorrect) {
    return { isCorrect: false, canonicalCorrect: null };
  }

  return {
    isCorrect: normSelected === canonicalCorrect,
    canonicalCorrect,
  };
}

/**
 * Objectively fair lexicographical tie-breaker:
 * 1. Score (highest)
 * 2. Accuracy / Total Correct Answers (highest)
 * 3. Total Response Time (lowest / fastest)
 */
export function sortPlayersFairly<T extends { score: number; correctAnswers: number; totalResponseTimeMs?: number }>(
  players: T[]
): T[] {
  return [...players].sort((a, b) => {
    // 1. Primary: Score
    if (b.score !== a.score) return b.score - a.score;
    // 2. Secondary: Correct Answers
    if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
    // 3. Tertiary: Total response speed (lower is better)
    return (a.totalResponseTimeMs || 0) - (b.totalResponseTimeMs || 0);
  });
}

/**
 * Objective Academic Grading Curve based on composite Mastery Index:
 * M = 0.75 * AccuracyRatio + 0.25 * ScoreEfficiencyRatio
 */
export interface AcademicGrade {
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'F';
  title: string;
  colorClass: string;
  badgeBg: string;
  masteryIndex: number;
  accuracyPercent: number;
}

export function calculateAcademicGrade(
  correctAnswers: number,
  totalQuestions: number,
  score: number,
  difficultyLevel: number
): AcademicGrade {
  if (totalQuestions <= 0) {
    return {
      grade: 'F',
      title: 'Novice',
      colorClass: 'text-[#FF94AB]',
      badgeBg: 'bg-[#FF94AB]/10 border-[#FF94AB]',
      masteryIndex: 0,
      accuracyPercent: 0,
    };
  }

  const accuracyRatio = Math.max(0, Math.min(1, correctAnswers / totalQuestions));
  const accuracyPercent = Math.round(accuracyRatio * 100);

  const diffMultiplier = 1 + (Math.max(1, Math.min(10, difficultyLevel || 1)) - 1) * 0.10;
  // Maximum theoretical score: 2000 * diffMultiplier per question
  const maxPossibleScore = totalQuestions * 2000 * diffMultiplier;
  const scoreRatio = maxPossibleScore > 0 ? Math.max(0, Math.min(1, score / maxPossibleScore)) : 0;

  // Composite Mastery Index: 75% accuracy + 25% speed/score efficiency
  const masteryIndex = accuracyRatio * 0.75 + scoreRatio * 0.25;

  if (masteryIndex >= 0.90 && accuracyRatio >= 0.90) {
    return {
      grade: 'S+',
      title: 'Apex Master',
      colorClass: 'text-[#6FEEFF]',
      badgeBg: 'bg-[#6FEEFF]/10 border-[#6FEEFF]',
      masteryIndex,
      accuracyPercent,
    };
  }
  if (masteryIndex >= 0.80 && accuracyRatio >= 0.80) {
    return {
      grade: 'S',
      title: 'Grand Scholar',
      colorClass: 'text-[#B9843E]',
      badgeBg: 'bg-[#B9843E]/10 border-[#B9843E]',
      masteryIndex,
      accuracyPercent,
    };
  }
  if (masteryIndex >= 0.65 && accuracyRatio >= 0.60) {
    return {
      grade: 'A',
      title: 'Honor Tactician',
      colorClass: 'text-[#4CA471]',
      badgeBg: 'bg-[#4CA471]/10 border-[#4CA471]',
      masteryIndex,
      accuracyPercent,
    };
  }
  if (masteryIndex >= 0.50 && accuracyRatio >= 0.50) {
    return {
      grade: 'B',
      title: 'Apprentice',
      colorClass: 'text-[#23616A]',
      badgeBg: 'bg-[#23616A]/10 border-[#23616A]',
      masteryIndex,
      accuracyPercent,
    };
  }
  if (masteryIndex >= 0.35) {
    return {
      grade: 'C',
      title: 'Initiate',
      colorClass: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 border-amber-500',
      masteryIndex,
      accuracyPercent,
    };
  }
  return {
    grade: 'F',
    title: 'Novice',
    colorClass: 'text-[#FF94AB]',
    badgeBg: 'bg-[#FF94AB]/10 border-[#FF94AB]',
    masteryIndex,
    accuracyPercent,
  };
}
