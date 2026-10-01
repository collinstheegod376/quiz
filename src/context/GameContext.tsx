'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  CategoryId,
  Room,
  Player,
  Question,
  AnswerSubmissionResult,
  RoomActivityLog,
} from '@/types/quiz';
import { getQuestionsForMatch } from '@/data/questions';
import {
  calculateGameLength,
  generateRoomCode,
  calculateQuestionXp,
  validateAnswerOption,
  sortPlayersFairly,
} from '@/lib/utils';
import { sound } from '@/lib/sound';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type AppView = 'landing' | 'entertainment' | 'categories' | 'topics' | 'difficulty' | 'lobby' | 'game' | 'achievements' | 'leaderboard';

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
  localQuestionIndex: number;
  isLocalReveal: boolean;
  isMatchFinished: boolean;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isAnswerSubmitted: boolean;
  submitAnswer: (option: 'A' | 'B' | 'C' | 'D') => void;
  timerSeconds: number;
  lastRevealResult: AnswerSubmissionResult | null;
  advanceToNextState: () => void;
  playAgain: () => void;
  goToNextLevel: () => Promise<void>;
  goToNextRound: (targetLevel?: number) => Promise<void>;
  startNextRound: () => Promise<void>;

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
  const { currentUser, incrementStat, incrementStats } = useAuth();

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
  const sessionSeenQuestionsRef = useRef<Record<string, string[]>>({});
  // FE-14: store setTimeout handle so it can be cleared on unmount
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Race-safe refs: submitAnswer and the countdown timer both read these to guard each other
  const isAnswerSubmittedRef = useRef<boolean>(false);
  const isLocalRevealRef = useRef<boolean>(false);
  // Ref for the countdown interval so it can be cleared from inside a state updater safely
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botAnsweredIndexRef = useRef<Record<string, number>>({});
  const botTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Initialize session history from sessionStorage if available
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('quiz_session_seen_questions');
      if (stored) {
        sessionSeenQuestionsRef.current = JSON.parse(stored);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  const recordSeenQuestions = useCallback((topicId: string, questionIds: string[]) => {
    const current = sessionSeenQuestionsRef.current[topicId] || [];
    const merged = Array.from(new Set([...current, ...questionIds]));
    sessionSeenQuestionsRef.current[topicId] = merged;
    try {
      sessionStorage.setItem('quiz_session_seen_questions', JSON.stringify(sessionSeenQuestionsRef.current));
    } catch {
      // ignore
    }
    return merged;
  }, []);

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
          // FE-13: typed properly — no `as any`
          const incomingRoom = (payload.new as { state?: Room })?.state;
          if (!incomingRoom) return;

          // Sync questions if present
          if (incomingRoom.questions && incomingRoom.questions.length > 0) {
            setGameQuestions(incomingRoom.questions);
            if (incomingRoom.topicId) {
              recordSeenQuestions(incomingRoom.topicId, incomingRoom.questions.map((q) => q.id));
            }
          }
          if (incomingRoom.seenQuestionIds && incomingRoom.seenQuestionIds.length > 0 && incomingRoom.topicId) {
            recordSeenQuestions(incomingRoom.topicId, incomingRoom.seenQuestionIds);
          }

          // Auto-switch view when game starts or moves to next round
          if (
            incomingRoom.status === 'QUESTION' ||
            incomingRoom.status === 'REVEAL' ||
            incomingRoom.status === 'FINAL_RESULTS' ||
            incomingRoom.status === 'FINISHED' ||
            incomingRoom.status === 'NEXT_ROUND'
          ) {
            setCurrentView('game');
          }

          if (incomingRoom.status === 'NEXT_ROUND') {
            setIsMatchFinished(false);
            setLocalQuestionIndex(0);
            setIsLocalReveal(false);
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
      .subscribe();

    realtimeChannelRef.current = channel;
  }, []);

  // Unsubscribe on unmount
  useEffect(() => {
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
      // FE-14: clear any pending reveal→advance timeout on unmount
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // ─── Reset question UI on every new question or next round ─────────────────
  const roomStatus = room?.status;
  const currentQuestionIdx = room?.currentQuestionIndex;

  useEffect(() => {
    if (roomStatus === 'QUESTION') {
      // Reset refs immediately so submitAnswer / countdown timer guard correctly
      isAnswerSubmittedRef.current = false;
      isLocalRevealRef.current = false;
      isTransitioningRef.current = false;
      // Cancel any pending submit timeout from the previous question
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
      // Cancel any lingering countdown from the previous question
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsLocalReveal(false);
      setIsMatchFinished(false);
      setTimerSeconds(room?.timePerQuestion || 15);
      setAnswerTimeStart(Date.now());
      // Blur any active element to prevent phantom keypress or tap triggers
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } else if (roomStatus === 'NEXT_ROUND') {
      isAnswerSubmittedRef.current = false;
      isLocalRevealRef.current = false;
      setIsMatchFinished(false);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsLocalReveal(false);
      setLocalQuestionIndex(0);
    }
  }, [roomStatus, currentQuestionIdx, room?.timePerQuestion]);

  // ─── Periodic Room Polling (guarantees cross-device sync) ────────────────
  useEffect(() => {
    if (!room?.code || !isSupabaseConfigured) return;

    // Fast poll during active gameplay or next round ready staging, relaxed poll in lobby
    const pollIntervalMs =
      room.status === 'QUESTION' || room.status === 'REVEAL' || room.status === 'NEXT_ROUND'
        ? 750
        : 1500;

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

            // Check if there are any meaningful differences
            const playersChanged =
              remoteRoom.players.length !== prev.players.length ||
              remoteRoom.players.some((rp) => {
                const lp = prev.players.find((p) => p.id === rp.id);
                return (
                  !lp ||
                  lp.hasAnswered !== rp.hasAnswered ||
                  lp.score !== rp.score ||
                  lp.isReady !== rp.isReady
                );
              });

            if (
              playersChanged ||
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
                remoteRoom.status === 'FINISHED' ||
                remoteRoom.status === 'NEXT_ROUND'
              ) {
                setCurrentView('game');
              }
              if (remoteRoom.status === 'NEXT_ROUND') {
                setIsMatchFinished(false);
                setLocalQuestionIndex(0);
                setIsLocalReveal(false);
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
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [room?.code, room?.status]);

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
      id: crypto.randomUUID(),
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
    const playerId = 'host_' + crypto.randomUUID();
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
      id: 'room_' + crypto.randomUUID(),
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
      questions: [],
      seenQuestionIds: sessionSeenQuestionsRef.current[topicId] || [],
    };

    setCurrentPlayer(hostPlayer);
    setRoom(newRoom);
    setCurrentView('lobby');
    setIsCreateModalOpen(false);
    logActivity(`${hostPlayer.displayName} created room ${newRoom.code}`, 'join');

    await saveRoomToSupabase(newRoom);
    subscribeToRoom(roomCode);
    incrementStat('roomsCreated');
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

      const playerId = 'p_' + crypto.randomUUID();
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

      setCurrentPlayer(joinedPlayer);
      setRoom(updatedRoom);
      if (updatedRoom.questions && updatedRoom.questions.length > 0) {
        setGameQuestions(updatedRoom.questions);
      }
      setCurrentView('lobby');
      setIsJoinModalOpen(false);
      logActivity(`${joinedPlayer.displayName} joined the room`, 'join');

      await saveRoomToSupabase(updatedRoom);
      subscribeToRoom(cleanCode);
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

    const botId = 'bot_' + crypto.randomUUID();
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

    setRoom(updatedRoom);
    logActivity(`${botPlayer.displayName} joined the room`, 'join');
    await saveRoomToSupabase(updatedRoom);
  };

  const removePlayer = async (playerId: string) => {
    if (!room) return;
    const removed = room.players.find((p) => p.id === playerId);
    const updatedRoom: Room = {
      ...room,
      players: room.players.filter((p) => p.id !== playerId),
    };
    setRoom(updatedRoom);
    if (removed) {
      logActivity(`${removed.displayName} left the room`, 'leave');
    }
    await saveRoomToSupabase(updatedRoom);
  };

  const togglePlayerReady = async () => {
    if (!room || !currentPlayer) return;
    sound.playClick();
    const updatedPlayers = room.players.map((p) =>
      p.id === currentPlayer.id ? { ...p, isReady: !p.isReady } : p
    );
    const updatedRoom: Room = { ...room, players: updatedPlayers };
    const isNowReady = !currentPlayer.isReady;
    setCurrentPlayer({ ...currentPlayer, isReady: isNowReady });
    setRoom(updatedRoom);
    logActivity(`${currentPlayer.displayName} is ${isNowReady ? 'Ready' : 'Not Ready'}`, 'ready');
    await saveRoomToSupabase(updatedRoom);
  };

  const leaveRoom = async () => {
    sound.playClick();
    if (currentPlayer && room) {
      logActivity(`${currentPlayer.displayName} left the arena`, 'leave');
      const updatedRoom: Room = {
        ...room,
        players: room.players.filter((p) => p.id !== currentPlayer.id),
      };
      if (updatedRoom.players.length > 0) {
        await saveRoomToSupabase(updatedRoom);
      } else {
        await supabase.from('realtime_rooms').delete().eq('code', room.code);
      }
    }

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    setRoom(null);
    setCurrentPlayer(null);
    setGameQuestions([]);
    setIsMatchFinished(false);
    setCurrentView('landing');
  };

  const [localQuestionIndex, setLocalQuestionIndex] = useState<number>(0);
  const [isLocalReveal, setIsLocalReveal] = useState<boolean>(false);
  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(false);
  const localQuestionIndexRef = useRef<number>(0);

  useEffect(() => {
    localQuestionIndexRef.current = localQuestionIndex;
  }, [localQuestionIndex]);

  // ─── Start Game ────────────────────────────────────────────────────────────
  const startGame = async () => {
    if (!room) return;
    sound.playClick();

    const confirmedPlayerCount = room.players.length;
    const calculatedCount = calculateGameLength(confirmedPlayerCount);

    const sessionSeen = sessionSeenQuestionsRef.current[room.topicId] || [];
    const roomSeen = room.seenQuestionIds || [];
    const allExcluded = Array.from(new Set([...sessionSeen, ...roomSeen]));

    const questions = getQuestionsForMatch(room.topicId, room.difficultyLevel, calculatedCount, allExcluded);
    setGameQuestions(questions);

    const updatedSeen = recordSeenQuestions(room.topicId, questions.map((q) => q.id));

    const updatedRoom: Room = {
      ...room,
      status: 'QUESTION',
      playerCountAtStart: confirmedPlayerCount,
      calculatedQuestionCount: calculatedCount,
      currentQuestionIndex: 0,
      questionStartedAt: Date.now(),
      questions: questions,
      seenQuestionIds: updatedSeen,
      players: room.players.map((p) => ({
        ...p,
        score: 0,
        correctAnswers: 0,
        totalResponseTimeMs: 0,
        hasAnswered: false,
        selectedOption: undefined,
      })),
    };

    botAnsweredIndexRef.current = {};
    setLocalQuestionIndex(0);
    setIsLocalReveal(false);
    setIsMatchFinished(false);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTimerSeconds(room.timePerQuestion || 15);
    setAnswerTimeStart(Date.now());
    setCurrentPlayer((prev) => (prev ? { ...prev, score: 0, correctAnswers: 0, totalResponseTimeMs: 0, hasAnswered: false, selectedOption: undefined } : null));
    setRoom(updatedRoom);
    setCurrentView('game');
    logActivity('Match commenced! Questions underway.', 'system');

    await saveRoomToSupabase(updatedRoom);
  };

  const currentQuestion = useMemo(() => {
    if (!room || room.status === 'LOBBY') return null;
    const qList = gameQuestions.length > 0 ? gameQuestions : room.questions || [];
    if (localQuestionIndex < qList.length) {
      return qList[localQuestionIndex];
    }
    return null;
  }, [room, gameQuestions, localQuestionIndex]);

  // Keep currentQuestionRef synchronized
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  // ─── Advance to Next Local Question ────────────────────────────────────────
  const advanceLocalQuestion = useCallback(() => {
    const currentRoom = roomRef.current;
    const totalCount = currentRoom?.calculatedQuestionCount || gameQuestions.length || 10;
    const nextIdx = localQuestionIndexRef.current + 1;

    if (nextIdx >= totalCount) {
      // Completed all questions!
      setIsMatchFinished(true);
      incrementStat('matchesPlayed');
      sound.playWin();

      if (currentRoom) {
        const finishedRoom: Room = {
          ...currentRoom,
          status: 'FINAL_RESULTS',
        };
        setRoom(finishedRoom);
        saveRoomToSupabase(finishedRoom);

        const sorted = sortPlayersFairly(currentRoom.players);
        if (sorted[0]?.id === currentPlayerRef.current?.id) {
          incrementStat('wins');
        }
      }
    } else {
      // Reset refs synchronously so the new question's guards are live before
      // React re-renders (prevents a tap landing during the state-flush window)
      isAnswerSubmittedRef.current = false;
      isLocalRevealRef.current = false;
      setLocalQuestionIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsLocalReveal(false);
      setTimerSeconds(currentRoom?.timePerQuestion || 15);
      setAnswerTimeStart(Date.now());
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [gameQuestions.length, incrementStat]);

  // ─── Submit Answer (Instant Local Progression + Background Supabase Sync) ──
  const submitAnswer = useCallback(
    (option: 'A' | 'B' | 'C' | 'D') => {
      const currentRoom = roomRef.current;
      const player = currentPlayerRef.current;
      const q = currentQuestionRef.current;
      // Bug fix 1: read from refs (not stale closure state) to guard against the
      // tap-vs-timer-expiry race condition.
      if (!currentRoom || !player || isAnswerSubmittedRef.current || !q || isLocalRevealRef.current) return;

      // 300ms tap bleed protection
      const elapsed = Date.now() - answerTimeStartRef.current;
      if (elapsed < 300) return;

      // Bug fix 2: flip refs synchronously BEFORE any async work so the countdown
      // timer interval sees the lock on its very next tick.
      isAnswerSubmittedRef.current = true;
      isLocalRevealRef.current = true;

      setSelectedOption(option);
      setIsAnswerSubmitted(true);
      setIsLocalReveal(true);

      // Validate answer securely against canonical correctOption
      const validation = validateAnswerOption(option, q.correctOption);
      const isCorrect = validation.isCorrect;
      const responseTimeMs = Math.max(50, elapsed);

      // Calculate XP with normalized time decay, streak combo, and difficulty scalar
      const xpResult = calculateQuestionXp({
        isCorrect,
        responseTimeMs,
        timePerQuestion: currentRoom.timePerQuestion || 15,
        streak: player.streak || 0,
        difficultyLevel: currentRoom.difficultyLevel || 1,
      });

      if (isCorrect) {
        sound.playCorrect();
        incrementStats({
          correctAnswers: 1,
          totalScore: xpResult.pointsAwarded,
          totalAnswers: 1,
        });
      } else {
        sound.playIncorrect();
        incrementStats({
          totalAnswers: 1,
        });
      }

      const maxStreak = Math.max(player.maxStreak || 0, xpResult.newStreak);

      const updatedPlayer: Player = {
        ...player,
        hasAnswered: true,
        selectedOption: option,
        score: player.score + xpResult.pointsAwarded,
        correctAnswers: player.correctAnswers + (isCorrect ? 1 : 0),
        totalResponseTimeMs: player.totalResponseTimeMs + responseTimeMs,
        streak: xpResult.newStreak,
        maxStreak,
      };

      setCurrentPlayer(updatedPlayer);

      const updatedPlayers = currentRoom.players.map((p) =>
        p.id === player.id ? updatedPlayer : p
      );
      const nextRoom: Room = { ...currentRoom, players: updatedPlayers };
      setRoom(nextRoom);

      // Async background Supabase update (non-blocking)
      saveRoomToSupabase(nextRoom);

      // 700ms crisp micro-reveal then zero-delay jump to next question
      // FE-14: store handle so it can be cleared on unmount
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = setTimeout(() => {
        advanceLocalQuestion();
      }, 700);
    },
    [incrementStats, advanceLocalQuestion]
  );

  // ─── Local Question Countdown Timer ────────────────────────────────────────
  useEffect(() => {
    if (!room || (room.status !== 'QUESTION' && room.status !== 'REVEAL') || isLocalReveal) return;

    // Bug fix 3: store the interval ID in a ref so it can be reliably cleared
    // from inside the setTimerSeconds functional updater (where the local `timer`
    // variable from the closure cannot be safely captured in Concurrent Mode).
    const id = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 4 && prev > 1) {
          sound.playTick();
        }
        if (prev <= 1) {
          // Bug fix 3: clear via ref, not via the local `id` closure inside a state updater
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          // Bug fix 4: only count totalAnswers on timeout if the player hasn't
          // already answered (prevents double-count when a tap and the timer fire together)
          if (!isAnswerSubmittedRef.current) {
            isAnswerSubmittedRef.current = true;
            isLocalRevealRef.current = true;
            setIsAnswerSubmitted(true);
            setIsLocalReveal(true);
            sound.playIncorrect();
            incrementStat('totalAnswers');
            if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
            submitTimeoutRef.current = setTimeout(() => {
              advanceLocalQuestion();
            }, 700);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    countdownTimerRef.current = id;

    return () => {
      clearInterval(id);
      countdownTimerRef.current = null;
    };
  }, [room?.status, localQuestionIndex, isLocalReveal, advanceLocalQuestion, incrementStat]);

  // ─── Simulated Rivals / Bots Progression (Host Only, Anchored Per Question) ───
  useEffect(() => {
    // Clear any previous scheduled bot timeouts when question changes or leaves QUESTION state
    botTimeoutsRef.current.forEach((t) => clearTimeout(t));
    botTimeoutsRef.current = [];

    if (!room || room.status !== 'QUESTION' || !currentPlayer?.isHost) return;

    const bots = room.players.filter((p) => p.id.startsWith('bot_'));
    if (bots.length === 0) return;

    const currentQIdx = localQuestionIndex;
    const timeLimitSec = room.timePerQuestion || 15;
    const diffLevel = room.difficultyLevel || 1;

    bots.forEach((bot) => {
      // Ensure each bot answers at most once per question index
      if (botAnsweredIndexRef.current[bot.id] === currentQIdx) return;
      botAnsweredIndexRef.current[bot.id] = currentQIdx;

      // Realistic human-like delay: between 2.0s and (timeLimitSec * 0.75)s
      const delayMs = Math.floor(2000 + Math.random() * Math.max(1000, (timeLimitSec * 0.75 - 2) * 1000));

      const timerId = setTimeout(() => {
        setRoom((prev) => {
          if (!prev || prev.status !== 'QUESTION') return prev;

          // Fair accuracy curve: 70% base accuracy slightly calibrated by difficulty level
          const accuracyChance = Math.max(0.40, Math.min(0.75, 0.75 - (diffLevel - 1) * 0.025));
          const isBotCorrect = Math.random() < accuracyChance;

          const responseTimeMs = delayMs;
          const xpResult = calculateQuestionXp({
            isCorrect: isBotCorrect,
            responseTimeMs,
            timePerQuestion: timeLimitSec,
            streak: bot.streak || 0,
            difficultyLevel: diffLevel,
          });

          const updatedPlayers = prev.players.map((p) => {
            if (p.id === bot.id) {
              const maxStreak = Math.max(p.maxStreak || 0, xpResult.newStreak);
              return {
                ...p,
                score: p.score + xpResult.pointsAwarded,
                correctAnswers: p.correctAnswers + (isBotCorrect ? 1 : 0),
                totalResponseTimeMs: p.totalResponseTimeMs + responseTimeMs,
                streak: xpResult.newStreak,
                maxStreak,
                hasAnswered: true,
              };
            }
            return p;
          });

          const nextRoom = { ...prev, players: updatedPlayers };
          saveRoomToSupabase(nextRoom);
          return nextRoom;
        });
      }, delayMs);

      botTimeoutsRef.current.push(timerId);
    });

    return () => {
      botTimeoutsRef.current.forEach((t) => clearTimeout(t));
      botTimeoutsRef.current = [];
    };
  }, [room?.status, localQuestionIndex, currentPlayer?.isHost, room?.timePerQuestion, room?.difficultyLevel]);

  const playAgain = async () => {
    if (!room) return;
    sound.playClick();
    botAnsweredIndexRef.current = {};
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
    setIsMatchFinished(false);
    setLastRevealResult(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  // ─── Stage Next Round (Ready-check intermission) ──────────────────────────
  const goToNextRound = async (targetLevel?: number) => {
    if (!room) return;
    sound.playClick();
    botAnsweredIndexRef.current = {};
    const currentLvl = room.difficultyLevel || selectedDifficultyLevel || 1;
    const nextLvl = targetLevel || (currentLvl >= 9 ? 1 : currentLvl + 1);
    setSelectedDifficultyLevel(nextLvl);

    const updatedPlayers = room.players.map((p) => ({
      ...p,
      hasAnswered: false,
      selectedOption: undefined,
      // Host is ready by default; bots are ready; challenger is not ready until they click Ready
      // If the challenger was the one who clicked Next Round, they are marked ready immediately
      isReady: p.isHost || p.id.startsWith('bot_') ? true : p.id === currentPlayer?.id,
    }));

    const updatedRoom: Room = {
      ...room,
      difficultyLevel: nextLvl,
      status: 'NEXT_ROUND',
      currentQuestionIndex: 0,
      questionStartedAt: null,
      players: updatedPlayers,
    };

    setLocalQuestionIndex(0);
    setIsLocalReveal(false);
    setIsMatchFinished(false);
    setLastRevealResult(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setRoom(updatedRoom);
    setCurrentView('game');

    await saveRoomToSupabase(updatedRoom);
    logActivity(`Staged for Round ${nextLvl}! Waiting for combatants to ready up.`, 'system');
  };

  const goToNextLevel = goToNextRound;

  // ─── Launch Next Round (Host Starts after Challenger Ready) ───────────────
  const startNextRound = async () => {
    if (!room) return;
    sound.playClick();

    const confirmedPlayerCount = room.players.length;
    const calculatedCount = calculateGameLength(confirmedPlayerCount);

    const sessionSeen = sessionSeenQuestionsRef.current[room.topicId] || [];
    const roomSeen = room.seenQuestionIds || [];
    const allExcluded = Array.from(new Set([...sessionSeen, ...roomSeen]));

    const questions = getQuestionsForMatch(room.topicId, room.difficultyLevel, calculatedCount, allExcluded);
    setGameQuestions(questions);

    const updatedSeen = recordSeenQuestions(room.topicId, questions.map((q) => q.id));

    const updatedRoom: Room = {
      ...room,
      status: 'QUESTION',
      playerCountAtStart: confirmedPlayerCount,
      calculatedQuestionCount: calculatedCount,
      currentQuestionIndex: 0,
      questionStartedAt: Date.now(),
      questions: questions,
      seenQuestionIds: updatedSeen,
      players: room.players.map((p) => ({
        ...p,
        hasAnswered: false,
        selectedOption: undefined,
        isReady: true,
      })),
    };

    setLocalQuestionIndex(0);
    setIsLocalReveal(false);
    setIsMatchFinished(false);
    setLastRevealResult(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTimerSeconds(updatedRoom.timePerQuestion || 15);
    setAnswerTimeStart(Date.now());
    setRoom(updatedRoom);
    setCurrentView('game');

    await saveRoomToSupabase(updatedRoom);
    logActivity(`Round launched at Level ${room.difficultyLevel}!`, 'system');
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
        localQuestionIndex,
        isLocalReveal,
        isMatchFinished,
        selectedOption,
        isAnswerSubmitted,
        submitAnswer,
        timerSeconds,
        lastRevealResult,
        advanceToNextState: advanceLocalQuestion,
        playAgain,
        goToNextLevel,
        goToNextRound,
        startNextRound,
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
