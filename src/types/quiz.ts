export type CategoryId = 'anime' | 'series' | 'movies' | 'chemistry' | 'physics' | 'games';

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
  topicCount: number;
  bannerImage: string;
  accentColor: string;
}

export interface Topic {
  id: string;
  categoryId: CategoryId;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  questionCount: number;
  popularityRank: number;
  isActive: boolean;
}

export interface DifficultyLevel {
  levelNumber: number; // 1 - 10
  name: string; // e.g. "Casual", "Easy", "Master", "Nightmare"
  description: string;
  badgeColor: string;
}

export interface Question {
  id: string;
  topicId: string;
  levelNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: 'A' | 'B' | 'C' | 'D'; // Server authoritative only! Stripped on client during QUESTION phase
  explanation?: string;
}

export type GameStatus =
  | 'LOBBY'
  | 'QUESTION'
  | 'REVEAL'
  | 'LEADERBOARD'
  | 'FINAL_RESULTS'
  | 'FINISHED'
  | 'NEXT_ROUND';

export interface Player {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  isHost: boolean;
  score: number;
  correctAnswers: number;
  totalResponseTimeMs: number;
  isReady: boolean;
  isOnline: boolean;
  selectedOption?: 'A' | 'B' | 'C' | 'D';
  hasAnswered?: boolean;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  categoryId: CategoryId;
  topicId: string;
  difficultyLevel: number;
  status: GameStatus;
  maxPlayers?: number;
  playerCountAtStart: number;
  calculatedQuestionCount: number;
  timePerQuestion: number; // in seconds, default 15
  currentQuestionIndex: number; // 0-indexed
  questionStartedAt: number | null; // timestamp ms
  players: Player[];
  questions?: Question[];
  seenQuestionIds?: string[];
}

export interface AnswerSubmissionResult {
  isCorrect: boolean;
  correctOption: 'A' | 'B' | 'C' | 'D';
  pointsAwarded: number;
  basePoints: number;
  timeBonus: number;
  responseTimeMs: number;
  explanation: string;
  newScore: number;
  rank: number;
  previousRank: number;
}

export interface RoomActivityLog {
  id: string;
  timestamp: string;
  text: string;
  type: 'join' | 'leave' | 'ready' | 'answer' | 'system';
}
