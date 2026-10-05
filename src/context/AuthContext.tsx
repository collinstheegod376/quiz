'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Safe public user account — never contains password data */
export interface UserAccount {
  id?: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
  sessionToken?: string;
  stats: {
    roomsCreated: number;
    matchesPlayed: number;
    wins: number;
    totalScore: number;
    correctAnswers: number;
    totalAnswers: number;
  };
}

/** Shape of the JSONB returned by login_fn / register_fn / restore_session_fn */
interface SafeProfileRow {
  id: string;
  username: string;
  avatar_url: string;
  rooms_created: number;
  matches_played: number;
  wins: number;
  total_score: number;
  correct_answers: number;
  total_answers: number;
  created_at: string;
  session_token?: string;
}

export type UserStatKey = 'roomsCreated' | 'matchesPlayed' | 'wins' | 'totalScore' | 'correctAnswers' | 'totalAnswers';

interface AuthContextType {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isSupabaseConnected: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, avatarUrl?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (newUsername?: string, newPassword?: string, newAvatar?: string, currentPassword?: string) => Promise<{ success: boolean; error?: string }>;
  incrementStat: (statKey: UserStatKey, amount?: number) => Promise<void>;
  incrementStats: (stats: Partial<Record<UserStatKey, number>>) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  globalStats: {
    totalRoomsCreated: number;
    totalMatchesPlayed: number;
    totalPlayersCount: number;
    overallAccuracy: number;
  };
  refreshGlobalStats: () => Promise<void>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_TOKEN_KEY = 'quiz_arena_session_token';

/** Client-side debounce limit before server check */
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Maps a safe server row to a UserAccount — password_hash is never present */
function mapRowToAccount(row: SafeProfileRow, token?: string): UserAccount {
  return {
    id: row.id,
    username: row.username,
    avatarUrl: row.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${row.username}`,
    createdAt: row.created_at || new Date().toISOString(),
    sessionToken: row.session_token || token,
    stats: {
      roomsCreated: row.rooms_created || 0,
      matchesPlayed: row.matches_played || 0,
      wins: row.wins || 0,
      totalScore: row.total_score || 0,
      correctAnswers: row.correct_answers || 0,
      totalAnswers: row.total_answers || 0,
    },
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const currentUserRef = useRef<UserAccount | null>(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalRoomsCreated: 0,
    totalMatchesPlayed: 0,
    totalPlayersCount: 0,
    overallAccuracy: 0,
  });

  // Client-side rate limiter state
  const loginAttemptsRef = useRef<{ count: number; lockedUntil: number }>({ count: 0, lockedUntil: 0 });
  const registerAttemptsRef = useRef<{ count: number; lockedUntil: number }>({ count: 0, lockedUntil: 0 });

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  // ─── Refresh Global Stats ──────────────────────────────────────────────────
  const refreshGlobalStats = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(
          `
          total_players:id.count(),
          total_rooms:rooms_created.sum(),
          total_matches:matches_played.sum(),
          total_correct:correct_answers.sum(),
          total_answers:total_answers.sum()
          `
        )
        .single();

      if (error || !data) return;

      const totalAnswers = (data as unknown as Record<string, number>).total_answers || 0;
      const totalCorrect = (data as unknown as Record<string, number>).total_correct || 0;
      const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

      setGlobalStats({
        totalRoomsCreated: (data as unknown as Record<string, number>).total_rooms || 0,
        totalMatchesPlayed: (data as unknown as Record<string, number>).total_matches || 0,
        totalPlayersCount: (data as unknown as Record<string, number>).total_players || 0,
        overallAccuracy: accuracy,
      });
    } catch {
      // Silently ignore stat aggregation errors
    }
  }, []);

  // ─── Cryptographic Session Restore (BUG-01 Fix & Guest Data Cleanup) ───────
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Clean up legacy insecure plaintext storage and guest milestone leftovers
        try {
          localStorage.removeItem('quiz_arena_current_session');
          localStorage.removeItem('anizuki_achievements_v1_guest');
        } catch {
          // Ignore storage restrictions
        }

        const savedToken = localStorage.getItem(SESSION_TOKEN_KEY);
        if (!savedToken || !isSupabaseConfigured) {
          await refreshGlobalStats();
          return;
        }

        // Restore session via cryptographic token validation
        const { data, error } = await supabase
          .rpc('restore_session_fn', { p_session_token: savedToken });

        if (error || !data) {
          if (error) console.error('[Auth] Session validation failed:', error.message);
          localStorage.removeItem(SESSION_TOKEN_KEY);
          setCurrentUser(null);
        } else {
          setCurrentUser(mapRowToAccount(data as SafeProfileRow, savedToken));
        }

        await refreshGlobalStats();
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, [refreshGlobalStats]);

  // ─── Login — server-side bcrypt + server rate limiting + session token ───
  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      return { success: false, error: 'Username and password are required.' };
    }

    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured. Check .env.local.' };
    }

    const attempts = loginAttemptsRef.current;
    const now = Date.now();
    if (now < attempts.lockedUntil) {
      const remaining = Math.ceil((attempts.lockedUntil - now) / 1000);
      return { success: false, error: `Too many failed attempts. Try again in ${remaining}s.` };
    }

    try {
      const { data, error } = await supabase
        .rpc('login_fn', { p_username: cleanUser, p_password: password });

      if (error) {
        attempts.count += 1;
        if (attempts.count >= MAX_ATTEMPTS) {
          attempts.lockedUntil = Date.now() + LOCKOUT_MS;
          attempts.count = 0;
          return { success: false, error: 'Too many failed attempts. Locked for 60 seconds.' };
        }
        const msg = error.message.includes('Invalid username or password')
          ? 'Incorrect username or password.'
          : error.message.includes('temporarily locked')
          ? error.message
          : `Login failed: ${error.message}`;
        return { success: false, error: msg };
      }

      if (!data || !data.session_token) {
        return { success: false, error: 'Login failed. Please try again.' };
      }

      attempts.count = 0;
      attempts.lockedUntil = 0;

      const token = data.session_token;
      const account = mapRowToAccount(data as SafeProfileRow, token);
      setCurrentUser(account);
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      setIsAuthModalOpen(false);
      await refreshGlobalStats();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Failed to connect: ${msg}` };
    }
  };

  // ─── Register — minimum 8-char password + input validation + session token ─
  const register = async (
    username: string,
    password: string,
    avatarUrl?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim();
    if (!cleanUser || cleanUser.length < 3 || cleanUser.length > 20) {
      return { success: false, error: 'Username must be between 3 and 20 characters.' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUser)) {
      return { success: false, error: 'Username may only contain letters, numbers, underscores, and dashes.' };
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured. Check .env.local.' };
    }

    const attempts = registerAttemptsRef.current;
    const now = Date.now();
    if (now < attempts.lockedUntil) {
      const remaining = Math.ceil((attempts.lockedUntil - now) / 1000);
      return { success: false, error: `Too many registration attempts. Try again in ${remaining}s.` };
    }

    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUser}`;

    try {
      const { data, error } = await supabase
        .rpc('register_fn', {
          p_username: cleanUser,
          p_password: password,
          p_avatar_url: finalAvatar,
        });

      if (error) {
        attempts.count += 1;
        if (attempts.count >= MAX_ATTEMPTS) {
          attempts.lockedUntil = Date.now() + LOCKOUT_MS;
          attempts.count = 0;
        }
        const msg = error.message.includes('already taken')
          ? 'Username is already taken. Please choose another or log in.'
          : `Registration failed: ${error.message}`;
        return { success: false, error: msg };
      }

      if (!data || !data.session_token) {
        return { success: false, error: 'Failed to create user profile.' };
      }

      attempts.count = 0;
      attempts.lockedUntil = 0;

      const token = data.session_token;
      const account = mapRowToAccount(data as SafeProfileRow, token);
      setCurrentUser(account);
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      setIsAuthModalOpen(false);
      await refreshGlobalStats();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Registration error: ${msg}` };
    }
  };

  // ─── Logout (BUG-05 Server Revocation & State Flush) ──────────────────────
  const logout = async () => {
    try {
      const token = localStorage.getItem(SESSION_TOKEN_KEY);
      if (token && isSupabaseConfigured) {
        await supabase.rpc('logout_fn', { p_session_token: token });
      }
    } catch {
      // Ignore network errors on logout
    }

    try {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem('quiz_active_session');
    } catch {
      // Ignore storage restrictions
    }

    setCurrentUser(null);
  };

  // ─── Delete Account (Cascade Revocation & DB Wipe) ───────────────────────
  const deleteAccount = async (
    currentPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in.' };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .rpc('delete_own_account_fn', {
            p_username: currentUser.username,
            p_current_password: currentPassword,
          });

        if (error) {
          const msg = error.message.includes('Unauthorized')
            ? 'Incorrect password. Account not deleted.'
            : `Delete failed: ${error.message}`;
          return { success: false, error: msg };
        }
      } catch (e) {
        console.error('[deleteAccount] error:', e);
        return { success: false, error: 'Delete request failed. Please try again.' };
      }
    }

    try {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem('quiz_active_session');
    } catch {
      // Ignore
    }

    setCurrentUser(null);
    setIsSettingsModalOpen(false);
    await refreshGlobalStats();
    return { success: true };
  };

  // ─── Update Profile (BUG-09 Validation & Session Revocation) ──────────────
  const updateProfile = async (
    newUsername?: string,
    newPassword?: string,
    newAvatar?: string,
    currentPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in.' };
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured.' };

    if (!currentPassword) {
      return { success: false, error: 'Current password is required to update your profile.' };
    }

    const cleanUser = newUsername?.trim();
    if (cleanUser && (cleanUser.length < 3 || cleanUser.length > 20)) {
      return { success: false, error: 'Username must be between 3 and 20 characters.' };
    }
    if (cleanUser && !/^[a-zA-Z0-9_-]+$/.test(cleanUser)) {
      return { success: false, error: 'Username may only contain letters, numbers, underscores, and dashes.' };
    }

    if (newPassword && newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters.' };
    }

    try {
      const { error } = await supabase
        .rpc('update_own_profile_fn', {
          p_username: currentUser.username,
          p_current_password: currentPassword,
          p_new_username: cleanUser && cleanUser.toLowerCase() !== currentUser.username.toLowerCase() ? cleanUser : null,
          p_new_password: newPassword && newPassword.length >= 8 ? newPassword : null,
          p_new_avatar_url: newAvatar || null,
        });

      if (error) {
        const msg = error.message.includes('Unauthorized')
          ? 'Incorrect current password.'
          : error.message.includes('already taken')
          ? 'Username already taken.'
          : `Update error: ${error.message}`;
        return { success: false, error: msg };
      }

      // If password changed, re-authenticate or keep current token
      const updatedAccount: UserAccount = {
        ...currentUser,
        username: cleanUser && cleanUser.toLowerCase() !== currentUser.username.toLowerCase()
          ? cleanUser
          : currentUser.username,
        avatarUrl: newAvatar || currentUser.avatarUrl,
      };

      setCurrentUser(updatedAccount);
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: `Update failed: ${msg}` };
    }
  };

  // ─── Stat Increment Engine (BUG-03 Fix: Server-Enforced Capped RPC) ───────
  const colMap: Record<UserStatKey, string> = {
    roomsCreated: 'rooms_created',
    matchesPlayed: 'matches_played',
    wins: 'wins',
    totalScore: 'total_score',
    correctAnswers: 'correct_answers',
    totalAnswers: 'total_answers',
  };

  const incrementStats = useCallback(
    async (statsToIncrement: Partial<Record<UserStatKey, number>>) => {
      if (!currentUserRef.current || !isSupabaseConfigured) return;

      const username = currentUserRef.current.username;

      // Functional optimistic update
      setCurrentUser((prev) => {
        if (!prev) return null;
        const nextStats = { ...prev.stats };
        for (const [key, amt] of Object.entries(statsToIncrement)) {
          if (typeof amt === 'number') {
            const statKey = key as UserStatKey;
            nextStats[statKey] = (nextStats[statKey] || 0) + amt;
          }
        }
        return {
          ...prev,
          stats: nextStats,
        };
      });

      // SEC-FIX: Dispatch to increment_user_stat_fn RPC with capped bounds
      try {
        await Promise.all(
          Object.entries(statsToIncrement).map(async ([key, amt]) => {
            if (typeof amt === 'number' && amt > 0) {
              const statKey = key as UserStatKey;
              const dbCol = colMap[statKey];
              if (!dbCol) return;
              const { error } = await supabase.rpc('increment_user_stat_fn', {
                p_username: username,
                p_stat_col: dbCol,
                p_amount: amt,
              });
              if (error) {
                console.warn(`[increment_user_stat_fn] Failed for ${dbCol}:`, error.message);
              }
            }
          })
        );
      } catch (err) {
        console.warn('[incrementStats] RPC dispatch error:', err);
      }
    },
    []
  );

  const incrementStat = useCallback(
    async (statKey: UserStatKey, amount: number = 1) => {
      return incrementStats({ [statKey]: amount });
    },
    [incrementStats]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAuthLoading,
        isSupabaseConnected: isSupabaseConfigured,
        login,
        register,
        logout,
        deleteAccount,
        updateProfile,
        incrementStat,
        incrementStats,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        globalStats,
        refreshGlobalStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
