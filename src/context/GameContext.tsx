'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  CategoryId,
  Room,
  Player,
  Question,
  AnswerSubmissionResult,
  RoomActivityLog,
} from '@/types/quiz';
import { getQuestionsForMatch } from '@/data/questions';
import { calculateGameLength, generateRoomCode } from '@/lib/utils';
import { sound } from '@/lib/sound';
import { useAuth } from './AuthContext';

export type AppView = 'landing' | 'categories' | 'topics' | 'difficulty' | 'lobby' | 'game';

interface GameContextType {
  // Navigation & Selection
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedCategoryId: CategoryId;
  setSelectedCategoryId: (id: CategoryId) => void;
  selectedTopicId: string;
  setSelectedTopicId: (id: string) => void;
  selectedDifficultyLevel: number;
  setSelectedDifficultyLevel: (lvl: number) => void;

  // Player & Room
  currentPlayer: Player | null;
  room: Room | null;
  activityLogs: RoomActivityLog[];
  createRoom: (displayName: string, topicId: string, levelNumber: number, timePerQ?: number, maxPlayers?: number) => void;
  joinRoom: (roomCode: string, displayName: string) => boolean;
  leaveRoom: () => void;
  togglePlayerReady: () => void;
  addMockBotPlayer: () => void;
  removePlayer: (playerId: string) => void;

  // Game Play
  startGame: () => void;
  currentQuestion: Question | null;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isAnswerSubmitted: boolean;
  submitAnswer: (option: 'A' | 'B' | 'C' | 'D') => void;
  timerSeconds: number;
  lastRevealResult: AnswerSubmissionResult | null;
  advanceToNextState: () => void;
  playAgain: () => void;

  // Sound & Modals
  isSoundMuted: boolean;
  toggleSound: () => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isJoinModalOpen: boolean;
  setIsJoinModalOpen: (open: boolean) => void;
  isGlobalLeaderboardOpen: boolean;
  setIsGlobalLeaderboardOpen: (open: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const ROOMS_STORE_KEY = 'quiz_arena_active_rooms';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, incrementStat } = useAuth();

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId>('anime');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('one-piece');
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState<number>(1);

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [activityLogs, setActivityLogs] = useState<RoomActivityLog[]>([]);

  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [lastRevealResult, setLastRevealResult] = useState<AnswerSubmissionResult | null>(null);
  const [answerTimeStart, setAnswerTimeStart] = useState<number>(0);

  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isGlobalLeaderboardOpen, setIsGlobalLeaderboardOpen] = useState<boolean>(false);

  // Sync rooms across browser tabs via storage listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ROOMS_STORE_KEY && e.newValue && room) {
        try {
          const rooms: Record<string, Room> = JSON.parse(e.newValue);
          if (rooms[room.code]) {
            setRoom(rooms[room.code]);
          }
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [room]);

  const saveRoomToStorage = (updatedRoom: Room) => {
    try {
      const stored = localStorage.getItem(ROOMS_STORE_KEY);
      const rooms: Record<string, Room> = stored ? JSON.parse(stored) : {};
      rooms[updatedRoom.code] = updatedRoom;
      localStorage.setItem(ROOMS_STORE_KEY, JSON.stringify(rooms));
    } catch {
      // Ignore
    }
  };

  // Sound toggle
  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsSoundMuted(muted);
  };

  // Activity logger
  const logActivity = (text: string, type: RoomActivityLog['type'] = 'system') => {
    const newLog: RoomActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // Create room
  const createRoom = (
    displayName: string,
    topicId: string,
    levelNumber: number,
    timePerQ: number = 15,
    maxPlayers: number = 2
  ) => {
    sound.playClick();
    const finalName = displayName.trim() || currentUser?.username || 'HostPlayer';
    const playerId = 'host_' + Math.random().toString(36).substring(2, 9);
    const hostPlayer: Player = {
      id: playerId,
      userId: playerId,
      displayName: finalName,
      avatarUrl: currentUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${finalName}`,
      isHost: true,
      score: 0,
      correctAnswers: 0,
      totalResponseTimeMs: 0,
      isReady: true,
      isOnline: true,
    };

    const roomCode = generateRoomCode();
    const newRoom: Room = {
      id: 'room_' + Math.random().toString(36).substring(2, 9),
      code: roomCode,
      hostId: playerId,
      categoryId: selectedCategoryId,
      topicId: topicId,
      difficultyLevel: levelNumber,
      status: 'LOBBY',
      maxPlayers: maxPlayers,
      playerCountAtStart: 0,
      calculatedQuestionCount: calculateGameLength(maxPlayers),
      timePerQuestion: timePerQ,
      currentQuestionIndex: 0,
      questionStartedAt: null,
      players: [hostPlayer],
    };

    saveRoomToStorage(newRoom);
    incrementStat('roomsCreated');

    setCurrentPlayer(hostPlayer);
    setRoom(newRoom);
    setCurrentView('lobby');
    setIsCreateModalOpen(false);
    logActivity(`${hostPlayer.displayName} created room ${newRoom.code}`, 'join');
  };

  // Join room
  const joinRoom = (roomCode: string, displayName: string): boolean => {
    sound.playClick();
    const cleanCode = roomCode.trim().toUpperCase();
    const finalName = displayName.trim() || currentUser?.username || 'Challenger';

    // Retrieve active rooms from localStorage
    let targetRoom: Room | null = null;
    try {
      const stored = localStorage.getItem(ROOMS_STORE_KEY);
      const rooms: Record<string, Room> = stored ? JSON.parse(stored) : {};
      if (rooms[cleanCode]) {
        targetRoom = rooms[cleanCode];
      }
    } catch {
      // Ignore
    }

    if (!targetRoom) {
      if (room && room.code === cleanCode) {
        targetRoom = room;
      } else {
        // Fallback create mock room for seamless experience
        targetRoom = {
          id: 'room_' + Math.random().toString(36).substring(2, 9),
          code: cleanCode,
          hostId: 'host_player_1',
          categoryId: selectedCategoryId,
          topicId: selectedTopicId,
          difficultyLevel: selectedDifficultyLevel,
          status: 'LOBBY',
          maxPlayers: 4,
          playerCountAtStart: 0,
          calculatedQuestionCount: 10,
          timePerQuestion: 15,
          currentQuestionIndex: 0,
          questionStartedAt: null,
          players: [
            {
              id: 'host_player_1',
              userId: 'host_player_1',
              displayName: 'Captain Roger',
              avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Roger',
              isHost: true,
              score: 0,
              correctAnswers: 0,
              totalResponseTimeMs: 0,
              isReady: true,
              isOnline: true,
            },
          ],
        };
      }
    }

    const maxAllowed = targetRoom.maxPlayers || 4;
    if (targetRoom.players.length >= maxAllowed) {
      alert(`Room is full (Maximum ${maxAllowed} players allowed).`);
      return false;
    }

    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    const joinedPlayer: Player = {
      id: playerId,
      userId: playerId,
      displayName: finalName,
      avatarUrl: currentUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${finalName}`,
      isHost: false,
      score: 0,
      correctAnswers: 0,
      totalResponseTimeMs: 0,
      isReady: true,
      isOnline: true,
    };

    const updatedPlayers = [...targetRoom.players, joinedPlayer];
    const updatedRoom: Room = {
      ...targetRoom,
      players: updatedPlayers,
    };

    saveRoomToStorage(updatedRoom);

    setCurrentPlayer(joinedPlayer);
    setRoom(updatedRoom);
    setCurrentView('lobby');
    setIsJoinModalOpen(false);
    logActivity(`${joinedPlayer.displayName} joined the room`, 'join');
    return true;
  };

  // Add mock player to room for instant multiplayer testing
  const addMockBotPlayer = () => {
    sound.playClick();
    if (!room) return;
    const maxCapacity = room.maxPlayers || 4;
    if (room.players.length >= maxCapacity) return;

    const botNames = ['ZoroFan', 'LuffyGoat', 'Nami_Chan', 'SanjiCook', 'ShadowNinja', 'Valkyrie'];
    const availableNames = botNames.filter((n) => !room.players.some((p) => p.displayName === n));
    const chosenName = availableNames[0] || `Challenger_${room.players.length + 1}`;

    const botId = 'bot_' + Math.random().toString(36).substring(2, 9);
    const botPlayer: Player = {
      id: botId,
      userId: botId,
      displayName: chosenName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${chosenName}`,
      isHost: false,
      score: 0,
      correctAnswers: 0,
      totalResponseTimeMs: 0,
      isReady: true,
      isOnline: true,
    };

    const updatedRoom: Room = {
      ...room,
      players: [...room.players, botPlayer],
    };

    saveRoomToStorage(updatedRoom);
    setRoom(updatedRoom);
    logActivity(`${botPlayer.displayName} joined the room`, 'join');
  };

  const removePlayer = (playerId: string) => {
    if (!room) return;
    const removed = room.players.find((p) => p.id === playerId);
    const updatedRoom: Room = {
      ...room,
      players: room.players.filter((p) => p.id !== playerId),
    };
    saveRoomToStorage(updatedRoom);
    setRoom(updatedRoom);
    if (removed) {
      logActivity(`${removed.displayName} left the room`, 'leave');
    }
  };

  const togglePlayerReady = () => {
    if (!room || !currentPlayer) return;
    sound.playClick();
    const updatedPlayers = room.players.map((p) =>
      p.id === currentPlayer.id ? { ...p, isReady: !p.isReady } : p
    );
    const updatedRoom: Room = { ...room, players: updatedPlayers };
    saveRoomToStorage(updatedRoom);
    setRoom(updatedRoom);
    const isNowReady = !currentPlayer.isReady;
    setCurrentPlayer({ ...currentPlayer, isReady: isNowReady });
    logActivity(`${currentPlayer.displayName} is ${isNowReady ? 'Ready' : 'Not Ready'}`, 'ready');
  };

  const leaveRoom = () => {
    sound.playClick();
    if (currentPlayer) {
      logActivity(`${currentPlayer.displayName} left the arena`, 'leave');
    }
    setRoom(null);
    setCurrentPlayer(null);
    setGameQuestions([]);
    setCurrentView('landing');
  };

  // Start game (Authoritative logic: calculates question count from confirmed players)
  const startGame = () => {
    if (!room) return;
    if (room.players.length < 2) {
      alert('Minimum 2 players required to start the match.');
      return;
    }
    sound.playClick();

    const confirmedPlayerCount = room.players.length;
    const calculatedCount = calculateGameLength(confirmedPlayerCount);

    // Retrieve unique questions for topic and difficulty
    const questions = getQuestionsForMatch(room.topicId, room.difficultyLevel, calculatedCount);
    setGameQuestions(questions);

    const updatedRoom: Room = {
      ...room,
      status: 'QUESTION',
      playerCountAtStart: confirmedPlayerCount,
      calculatedQuestionCount: calculatedCount,
      currentQuestionIndex: 0,
      questionStartedAt: Date.now(),
      players: room.players.map((p) => ({
        ...p,
        score: 0,
        correctAnswers: 0,
        totalResponseTimeMs: 0,
        hasAnswered: false,
        selectedOption: undefined,
      })),
    };

    saveRoomToStorage(updatedRoom);
    setRoom(updatedRoom);
    setCurrentView('game');
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTimerSeconds(room.timePerQuestion);
    setAnswerTimeStart(Date.now());
    logActivity('Match commenced! Question 1 underway.', 'system');
  };

  const currentQuestion =
    room && room.status !== 'LOBBY' && gameQuestions.length > room.currentQuestionIndex
      ? gameQuestions[room.currentQuestionIndex]
      : null;

  // Submit Answer
  const submitAnswer = useCallback(
    (option: 'A' | 'B' | 'C' | 'D') => {
      if (!room || !currentPlayer || isAnswerSubmitted || !currentQuestion) return;
      sound.playClick();

      setSelectedOption(option);
      setIsAnswerSubmitted(true);

      // Update current player answer status
      setRoom((prev) => {
        if (!prev) return null;
        const updated = prev.players.map((p) =>
          p.id === currentPlayer.id
            ? { ...p, hasAnswered: true, selectedOption: option }
            : p
        );
        const nextRoom = { ...prev, players: updated };
        saveRoomToStorage(nextRoom);
        return nextRoom;
      });
      logActivity(`${currentPlayer.displayName} submitted an answer`, 'answer');
    },
    [room, currentPlayer, isAnswerSubmitted, currentQuestion]
  );

  // Transition QUESTION -> REVEAL
  const handleQuestionEnd = useCallback(() => {
    if (!room || !currentQuestion || !currentPlayer) return;

    const chosenOption = selectedOption;
    const correctOpt = currentQuestion.correctOption || 'A';
    const isCorrect = chosenOption === correctOpt;

    const responseTimeMs = Date.now() - answerTimeStart;
    const responseSeconds = Math.min(room.timePerQuestion, Math.max(1, responseTimeMs / 1000));

    let pointsAwarded = 0;
    let timeBonus = 0;
    const basePoints = 1000;

    if (isCorrect) {
      sound.playCorrect();
      timeBonus = Math.max(0, Math.floor(500 - responseSeconds * 20));
      pointsAwarded = basePoints + timeBonus;
      incrementStat('correctAnswers');
    } else {
      sound.playIncorrect();
    }

    incrementStat('totalAnswers');
    incrementStat('totalScore', pointsAwarded);

    // Previous rank
    const sortedBefore = [...room.players].sort((a, b) => b.score - a.score);
    const prevRank = sortedBefore.findIndex((p) => p.id === currentPlayer.id) + 1;

    // Simulate bot answers for other players
    const updatedPlayers = room.players.map((p) => {
      if (p.id === currentPlayer.id) {
        return {
          ...p,
          score: p.score + pointsAwarded,
          correctAnswers: p.correctAnswers + (isCorrect ? 1 : 0),
          totalResponseTimeMs: p.totalResponseTimeMs + responseTimeMs,
          hasAnswered: true,
          selectedOption: chosenOption || undefined,
        };
      }
      // Bot simulation
      const botCorrect = Math.random() > 0.35;
      const botResponseSec = 3 + Math.floor(Math.random() * 8);
      const botBonus = botCorrect ? Math.max(0, Math.floor(500 - botResponseSec * 20)) : 0;
      const botPoints = botCorrect ? basePoints + botBonus : 0;
      const botOpt = botCorrect
        ? correctOpt
        : (['A', 'B', 'C', 'D'].filter((x) => x !== correctOpt)[0] as 'A' | 'B' | 'C' | 'D');

      return {
        ...p,
        score: p.score + botPoints,
        correctAnswers: p.correctAnswers + (botCorrect ? 1 : 0),
        totalResponseTimeMs: p.totalResponseTimeMs + botResponseSec * 1000,
        hasAnswered: true,
        selectedOption: botOpt,
      };
    });

    const sortedAfter = [...updatedPlayers].sort((a, b) => b.score - a.score);
    const newRank = sortedAfter.findIndex((p) => p.id === currentPlayer.id) + 1;

    const revealResult: AnswerSubmissionResult = {
      isCorrect,
      correctOption: correctOpt,
      pointsAwarded,
      basePoints: isCorrect ? basePoints : 0,
      timeBonus,
      responseTimeMs,
      explanation: currentQuestion.explanation || 'Accurate recall of official source canon.',
      newScore: (currentPlayer.score || 0) + pointsAwarded,
      rank: newRank,
      previousRank: prevRank,
    };

    setLastRevealResult(revealResult);
    const updatedRoom: Room = {
      ...room,
      status: 'REVEAL',
      players: updatedPlayers,
    };
    saveRoomToStorage(updatedRoom);
    setRoom(updatedRoom);
  }, [room, currentQuestion, currentPlayer, selectedOption, answerTimeStart, incrementStat]);

  // Countdown timer effect during QUESTION phase
  useEffect(() => {
    if (!room || room.status !== 'QUESTION') return;

    // Check if everyone answered
    const allAnswered = room.players.length > 0 && room.players.every((p) => p.hasAnswered);
    if (allAnswered) {
      handleQuestionEnd();
      return;
    }

    if (timerSeconds <= 0) {
      handleQuestionEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 4 && prev > 1) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room, timerSeconds, handleQuestionEnd]);

  // State machine progression: REVEAL -> QUESTION (or FINAL_RESULTS) — no intermediate leaderboard
  const advanceToNextState = useCallback(() => {
    if (!room) return;
    sound.playClick();

    const nextIndex = room.currentQuestionIndex + 1;
    if (nextIndex >= room.calculatedQuestionCount) {
      const finalRoom: Room = { ...room, status: 'FINAL_RESULTS' };
      saveRoomToStorage(finalRoom);
      setRoom(finalRoom);

      // Record completed match
      incrementStat('matchesPlayed');
      const sorted = [...room.players].sort((a, b) => b.score - a.score);
      if (sorted[0]?.id === currentPlayer?.id) {
        incrementStat('wins');
      }
    } else {
      // Reset for next question
      const nextQRoom: Room = {
        ...room,
        status: 'QUESTION',
        currentQuestionIndex: nextIndex,
        questionStartedAt: Date.now(),
        players: room.players.map((p) => ({
          ...p,
          hasAnswered: false,
          selectedOption: undefined,
        })),
      };
      saveRoomToStorage(nextQRoom);
      setRoom(nextQRoom);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimerSeconds(room.timePerQuestion || 15);
      setAnswerTimeStart(Date.now());
    }
  }, [room, currentPlayer, incrementStat]);

  const playAgain = () => {
    if (!room) return;
    sound.playClick();
    const resetRoom: Room = {
      ...room,
      status: 'LOBBY',
      currentQuestionIndex: 0,
      questionStartedAt: null,
      players: room.players.map((p) => ({
        ...p,
        score: 0,
        correctAnswers: 0,
        totalResponseTimeMs: 0,
        hasAnswered: false,
        selectedOption: undefined,
        isReady: p.isHost,
      })),
    };
    saveRoomToStorage(resetRoom);
    setRoom(resetRoom);
    setCurrentView('lobby');
    setLastRevealResult(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  return (
    <GameContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedTopicId,
        setSelectedTopicId,
        selectedDifficultyLevel,
        setSelectedDifficultyLevel,
        currentPlayer,
        room,
        activityLogs,
        createRoom,
        joinRoom,
        leaveRoom,
        togglePlayerReady,
        addMockBotPlayer,
        removePlayer,
        startGame,
        currentQuestion,
        selectedOption,
        isAnswerSubmitted,
        submitAnswer,
        timerSeconds,
        lastRevealResult,
        advanceToNextState,
        playAgain,
        isSoundMuted,
        toggleSound,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isJoinModalOpen,
        setIsJoinModalOpen,
        isGlobalLeaderboardOpen,
        setIsGlobalLeaderboardOpen,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
