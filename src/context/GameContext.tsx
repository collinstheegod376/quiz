'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
  joinRoom: (roomCode: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
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

  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const currentPlayerRef = useRef<Player | null>(null);
  const roomRef = useRef<Room | null>(null);
  const currentQuestionRef = useRef<Question | null>(null);
  const selectedOptionRef = useRef<'A' | 'B' | 'C' | 'D' | null>(null);
  const answerTimeStartRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);

  // Keep refs in sync so callbacks always have fresh state without re-creating functions
  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  useEffect(() => {
    answerTimeStartRef.current = answerTimeStart;
  }, [answerTimeStart]);

  // ─── Supabase Realtime subscription ───────────────────────────────────────
  const subscribeToRoom = useCallback((roomCode: string) => {
    if (!isSupabaseConfigured) return;

    // Unsubscribe any existing channel first
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'realtime_rooms',
          filter: `code=eq.${roomCode}`,
        },
        (payload) => {
          const incomingRoom = (payload.new as any)?.state as Room | undefined;
          if (!incomingRoom) return;

          // Sync questions if present
          if (incomingRoom.questions && incomingRoom.questions.length > 0) {
            setGameQuestions(incomingRoom.questions);
          }

          // Auto-switch view when game starts
          if (
            incomingRoom.status === 'QUESTION' ||
            incomingRoom.status === 'REVEAL' ||
            incomingRoom.status === 'FINAL_RESULTS' ||
            incomingRoom.status === 'FINISHED'
          ) {
            setCurrentView('game');
          }

          setRoom(incomingRoom);

          // Restore current player from incoming room by matching our player id
          const myPlayer = currentPlayerRef.current;
          if (myPlayer) {
            const updated = incomingRoom.players.find((p) => p.id === myPlayer.id);
            if (updated) setCurrentPlayer(updated);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Channel room:${roomCode} status:`, status);
      });

    realtimeChannelRef.current = channel;
  }, []);

  // Unsubscribe on unmount
  useEffect(() => {
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, []);

  // ─── Periodic Room Polling (guarantees cross-device sync) ────────────────
  useEffect(() => {
    if (!room?.code || !isSupabaseConfigured) return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('realtime_rooms')
          .select('state')
          .eq('code', room.code)
          .maybeSingle();

        if (!error && data?.state) {
          const remoteRoom = data.state as Room;
          setRoom((prev) => {
            if (!prev) return remoteRoom;
            // Only update state if player count, status, or question index changed
            if (
              remoteRoom.players.length !== prev.players.length ||
              remoteRoom.status !== prev.status ||
              remoteRoom.currentQuestionIndex !== prev.currentQuestionIndex
            ) {
              if (remoteRoom.questions && remoteRoom.questions.length > 0) {
                setGameQuestions(remoteRoom.questions);
              }
              if (
                remoteRoom.status === 'QUESTION' ||
                remoteRoom.status === 'REVEAL' ||
                remoteRoom.status === 'FINAL_RESULTS' ||
                remoteRoom.status === 'FINISHED'
              ) {
                setCurrentView('game');
              }
              const myPlayer = currentPlayerRef.current;
              if (myPlayer) {
                const updated = remoteRoom.players.find((p) => p.id === myPlayer.id);
                if (updated) setCurrentPlayer(updated);
              }
              return remoteRoom;
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('[Room poll error]:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [room?.code]);

  // ─── Save room (Strict Supabase) ──────────────────────────────────────────
  const saveRoomToSupabase = async (updatedRoom: Room) => {
    if (!isSupabaseConfigured) {
      console.error('[Supabase saveRoom] Supabase is NOT configured!');
      return;
    }

    try {
      const { error } = await supabase
        .from('realtime_rooms')
        .upsert(
          { code: updatedRoom.code, state: updatedRoom, updated_at: new Date().toISOString() },
          { onConflict: 'code' }
        );

      if (error) {
        console.error('[Supabase] Failed to save room:', error.message);
      } else {
        console.log(`[Supabase] Room ${updatedRoom.code} saved.`);
      }
    } catch (err) {
      console.error('[Supabase saveRoom] error:', err);
    }
  };

  // ─── Sound toggle ──────────────────────────────────────────────────────────
  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsSoundMuted(muted);
  };

  // ─── Activity logger ───────────────────────────────────────────────────────
  const logActivity = (text: string, type: RoomActivityLog['type'] = 'system') => {
    const newLog: RoomActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // ─── Create Room ───────────────────────────────────────────────────────────
  const createRoom = async (
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

    await saveRoomToSupabase(newRoom);
    subscribeToRoom(roomCode);
    incrementStat('roomsCreated');

    setCurrentPlayer(hostPlayer);
    setRoom(newRoom);
    setCurrentView('lobby');
    setIsCreateModalOpen(false);
    logActivity(`${hostPlayer.displayName} created room ${newRoom.code}`, 'join');
  };

  // ─── Join Room (Strict Supabase) ───────────────────────────────────────────
  const joinRoom = async (
    roomCode: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    sound.playClick();
    const cleanCode = roomCode.trim().toUpperCase();
    const finalName = displayName.trim() || currentUser?.username || 'Challenger';

    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured. Check .env.local.' };
    }

    try {
      const { data, error } = await supabase
        .from('realtime_rooms')
        .select('state')
        .eq('code', cleanCode)
        .maybeSingle();

      if (error) {
        console.error('[JoinRoom] Supabase query error:', error.message);
        return { success: false, error: `Supabase error: ${error.message}` };
      }

      if (!data || !data.state) {
        console.warn('[JoinRoom] Room not found on Supabase:', cleanCode);
        return {
          success: false,
          error: `Room "${cleanCode}" was not found in Supabase. Verify the 6-character code.`,
        };
      }

      const targetRoom = data.state as Room;
      const maxAllowed = targetRoom.maxPlayers || 4;
      if (targetRoom.players.length >= maxAllowed) {
        return {
          success: false,
          error: `Room "${cleanCode}" is full (${targetRoom.players.length}/${maxAllowed} players).`,
        };
      }

      if (targetRoom.status !== 'LOBBY') {
        return {
          success: false,
          error: `Match in room "${cleanCode}" has already started (${targetRoom.status}).`,
        };
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

      const updatedRoom: Room = {
        ...targetRoom,
        players: [...targetRoom.players, joinedPlayer],
      };

      await saveRoomToSupabase(updatedRoom);
      subscribeToRoom(cleanCode);

      setCurrentPlayer(joinedPlayer);
      setRoom(updatedRoom);
      if (updatedRoom.questions && updatedRoom.questions.length > 0) {
        setGameQuestions(updatedRoom.questions);
      }
      setCurrentView('lobby');
      setIsJoinModalOpen(false);
      logActivity(`${joinedPlayer.displayName} joined the room`, 'join');
      return { success: true };
    } catch (err: any) {
      console.error('[JoinRoom] Error:', err);
      return { success: false, error: `Join error: ${err?.message || err}` };
    }
  };

  // ─── Add Mock Bot ──────────────────────────────────────────────────────────
  const addMockBotPlayer = async () => {
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

    await saveRoomToSupabase(updatedRoom);
    setRoom(updatedRoom);
    logActivity(`${botPlayer.displayName} joined the room`, 'join');
  };

  const removePlayer = async (playerId: string) => {
    if (!room) return;
    const removed = room.players.find((p) => p.id === playerId);
    const updatedRoom: Room = {
      ...room,
      players: room.players.filter((p) => p.id !== playerId),
    };
    await saveRoomToSupabase(updatedRoom);
    setRoom(updatedRoom);
    if (removed) {
      logActivity(`${removed.displayName} left the room`, 'leave');
    }
  };

  const togglePlayerReady = async () => {
    if (!room || !currentPlayer) return;
    sound.playClick();
    const updatedPlayers = room.players.map((p) =>
      p.id === currentPlayer.id ? { ...p, isReady: !p.isReady } : p
    );
    const updatedRoom: Room = { ...room, players: updatedPlayers };
    await saveRoomToSupabase(updatedRoom);
    setRoom(updatedRoom);
    const isNowReady = !currentPlayer.isReady;
    setCurrentPlayer({ ...currentPlayer, isReady: isNowReady });
    logActivity(`${currentPlayer.displayName} is ${isNowReady ? 'Ready' : 'Not Ready'}`, 'ready');
  };

  const leaveRoom = async () => {
    sound.playClick();
    if (currentPlayer && room) {
      logActivity(`${currentPlayer.displayName} left the arena`, 'leave');
      // Remove player from room in Supabase
      const updatedRoom: Room = {
        ...room,
        players: room.players.filter((p) => p.id !== currentPlayer.id),
      };
      if (updatedRoom.players.length > 0) {
        await saveRoomToSupabase(updatedRoom);
      } else {
        // Delete room if empty
        await supabase.from('realtime_rooms').delete().eq('code', room.code);
      }
    }

    // Unsubscribe from realtime
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    setRoom(null);
    setCurrentPlayer(null);
    setGameQuestions([]);
    setCurrentView('landing');
  };

  // ─── Start Game ────────────────────────────────────────────────────────────
  const startGame = async () => {
    if (!room) return;
    sound.playClick();

    const confirmedPlayerCount = room.players.length;
    const calculatedCount = calculateGameLength(confirmedPlayerCount);

    const questions = getQuestionsForMatch(room.topicId, room.difficultyLevel, calculatedCount);
    setGameQuestions(questions);

    const updatedRoom: Room = {
      ...room,
      status: 'QUESTION',
      playerCountAtStart: confirmedPlayerCount,
      calculatedQuestionCount: calculatedCount,
      currentQuestionIndex: 0,
      questionStartedAt: Date.now(),
      questions: questions,
      players: room.players.map((p) => ({
        ...p,
        score: 0,
        correctAnswers: 0,
        totalResponseTimeMs: 0,
        hasAnswered: false,
        selectedOption: undefined,
      })),
    };

    await saveRoomToSupabase(updatedRoom);
    setRoom(updatedRoom);
    setCurrentView('game');
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTimerSeconds(room.timePerQuestion || 15);
    setAnswerTimeStart(Date.now());
    logActivity('Match commenced! Question 1 underway.', 'system');
  };

  const currentQuestion =
    room && room.status !== 'LOBBY'
      ? (gameQuestions.length > room.currentQuestionIndex
          ? gameQuestions[room.currentQuestionIndex]
          : room.questions && room.questions.length > room.currentQuestionIndex
          ? room.questions[room.currentQuestionIndex]
          : null)
      : null;

  // ─── Submit Answer ─────────────────────────────────────────────────────────
  const submitAnswer = useCallback(
    async (option: 'A' | 'B' | 'C' | 'D') => {
      const currentRoom = roomRef.current;
      const player = currentPlayerRef.current;
      const q = currentQuestionRef.current;
      if (!currentRoom || !player || isAnswerSubmitted || !q) return;
      sound.playClick();

      setSelectedOption(option);
      setIsAnswerSubmitted(true);

      const correctOpt = q.correctOption || 'A';
      const isCorrect = option === correctOpt;
      const responseTimeMs = Date.now() - answerTimeStartRef.current;
      const responseSeconds = Math.min(currentRoom.timePerQuestion, Math.max(1, responseTimeMs / 1000));
      
      let pointsAwarded = 0;
      let timeBonus = 0;
      const basePoints = 1000;
      
      if (isCorrect) {
        timeBonus = Math.max(0, Math.floor(500 - responseSeconds * 20));
        pointsAwarded = basePoints + timeBonus;
      }

      const updatedPlayers = currentRoom.players.map((p) =>
        p.id === player.id
          ? { 
              ...p, 
              hasAnswered: true, 
              selectedOption: option,
              score: p.score + pointsAwarded,
              correctAnswers: p.correctAnswers + (isCorrect ? 1 : 0),
              totalResponseTimeMs: p.totalResponseTimeMs + responseTimeMs
            }
          : p
      );
      const nextRoom = { ...currentRoom, players: updatedPlayers };
      setRoom(nextRoom);
      saveRoomToSupabase(nextRoom);
      logActivity(`${player.displayName} submitted an answer`, 'answer');
    },
    [isAnswerSubmitted]
  );

  // ─── Transition QUESTION → REVEAL ─────────────────────────────────────────
  const handleQuestionEnd = useCallback(async () => {
    const currentRoom = roomRef.current;
    const player = currentPlayerRef.current;
    const q = currentQuestionRef.current;
    const chosenOption = selectedOptionRef.current;

    if (!currentRoom || currentRoom.status !== 'QUESTION' || !q || !player || isTransitioningRef.current) {
      return;
    }
    isTransitioningRef.current = true;

    const correctOpt = q.correctOption || 'A';
    const isCorrect = chosenOption === correctOpt;

    // Local sounds & stats
    if (chosenOption) {
      if (isCorrect) {
        sound.playCorrect();
        incrementStat('correctAnswers');
      } else {
        sound.playIncorrect();
      }
      incrementStat('totalAnswers');
    }

    // ONLY the host pushes the state transition and simulates bots.
    // This prevents race conditions where multiple clients overwrite the room.
    if (!player.isHost) {
      return;
    }

    const basePoints = 1000;
    const updatedPlayers = currentRoom.players.map((p) => {
      // Bot simulation
      if (p.id.startsWith('bot_')) {
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
      }

      // Human players (mark as answered if timer ran out without selecting)
      // Their score was already updated directly in submitAnswer if they answered!
      return {
        ...p,
        hasAnswered: true,
      };
    });

    const updatedRoom: Room = {
      ...currentRoom,
      status: 'REVEAL',
      players: updatedPlayers,
    };
    
    setRoom(updatedRoom);
    saveRoomToSupabase(updatedRoom);
  }, [incrementStat]);

  // Keep currentQuestionRef synchronized
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  // ─── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!room || room.status !== 'QUESTION') return;

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
        if (prev <= 1) {
          clearInterval(timer);
          handleQuestionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.status, room?.currentQuestionIndex, room?.players, timerSeconds, handleQuestionEnd]);


  // ─── State machine: REVEAL → QUESTION / FINAL_RESULTS ─────────────────────
  const advanceToNextState = useCallback(async () => {
    const currentRoom = roomRef.current;
    if (!currentRoom) return;
    sound.playClick();
    isTransitioningRef.current = false;

    const nextIndex = currentRoom.currentQuestionIndex + 1;
    if (nextIndex >= currentRoom.calculatedQuestionCount) {
      const finalRoom: Room = { ...currentRoom, status: 'FINAL_RESULTS' };
      setRoom(finalRoom);
      saveRoomToSupabase(finalRoom);

      incrementStat('matchesPlayed');
      const sorted = [...currentRoom.players].sort((a, b) => b.score - a.score);
      if (sorted[0]?.id === currentPlayerRef.current?.id) {
        incrementStat('wins');
      }
    } else {
      const nextQRoom: Room = {
        ...currentRoom,
        status: 'QUESTION',
        currentQuestionIndex: nextIndex,
        questionStartedAt: Date.now(),
        players: currentRoom.players.map((p) => ({
          ...p,
          hasAnswered: false,
          selectedOption: undefined,
        })),
      };
      setRoom(nextQRoom);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimerSeconds(currentRoom.timePerQuestion || 15);
      setAnswerTimeStart(Date.now());
      saveRoomToSupabase(nextQRoom);
    }
  }, [incrementStat]);

  // ─── Auto-advance from REVEAL to NEXT QUESTION ─────────────────────────────
  useEffect(() => {
    // Only the host should trigger the auto-advance to prevent multiple Supabase updates
    if (room?.status === 'REVEAL' && currentPlayer?.isHost) {
      const timer = setTimeout(() => {
        advanceToNextState();
      }, 3000); // 3 second reveal
      return () => clearTimeout(timer);
    }
  }, [room?.status, currentPlayer?.isHost, advanceToNextState]);

  const playAgain = async () => {
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
    await saveRoomToSupabase(resetRoom);
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
