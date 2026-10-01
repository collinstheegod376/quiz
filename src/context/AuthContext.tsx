'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Safe public user account — never contains password data */
export interface UserAccount {
  username: string;
  avatarUrl: string;
  createdAt: string;
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
}

export type UserStatKey = 'roomsCreated' | 'matchesPlayed' | 'wins' | 'totalScore' | 'correctAnswers' | 'totalAnswers';

interface AuthContextType {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isSupabaseConnected: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, avatarUrl?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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
const SESSION_KEY = 'quiz_arena_current_session';

/** Rate limit: max attempts before lockout */
const MAX_ATTEMPTS = 5;
/** Lockout duration in milliseconds (60 seconds) */
const LOCKOUT_MS = 60_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Maps a safe server row to a UserAccount — password_hash is never present */
function mapRowToAccount(row: SafeProfileRow): UserAccount {
  return {
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

  // ─── Rate limiter state (in-memory, per session) ─────────────────────────
  const loginAttemptsRef = useRef<{ count: number; lockedUntil: number }>({ count: 0, lockedUntil: 0 });
  const registerAttemptsRef = useRef<{ count: number; lockedUntil: number }>({ count: 0, lockedUntil: 0 });

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  // ─── Refresh Global Stats (single aggregate query, no full scan) ──────────
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
      // Silently ignore stat aggregation errors — non-critical
    }
  }, []);

  // ─── Initial session restore ──────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (!savedSession || !isSupabaseConfigured) {
          await refreshGlobalStats();
          return;
        }

        // SEC-FIX: Use restore_session_fn — never SELECT directly (would expose no hash
        // columns post-migration, but this is explicit and safe regardless)
        const { data, error } = await supabase
          .rpc('restore_session_fn', { p_username: savedSession });

        if (error) {
          console.error('[Auth] Session restore failed:', error.message);
          localStorage.removeItem(SESSION_KEY);
          await refreshGlobalStats();
          return;
        }

        if (data) {
          setCurrentUser(mapRowToAccount(data as SafeProfileRow));
        } else {
          localStorage.removeItem(SESSION_KEY);
        }

        await refreshGlobalStats();
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, [refreshGlobalStats]);

  // ─── Login — server-side bcrypt via login_fn RPC ──────────────────────────
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

    // Rate limiting check
    const attempts = loginAttemptsRef.current;
    const now = Date.now();
    if (now < attempts.lockedUntil) {
      const remaining = Math.ceil((attempts.lockedUntil - now) / 1000);
      return { success: false, error: `Too many failed attempts. Try again in ${remaining}s.` };
    }

    try {
      // SEC-FIX: Password is verified server-side via pgcrypto inside login_fn.
      // The hash never leaves the database. The client only receives safe profile fields.
      const { data, error } = await supabase
        .rpc('login_fn', { p_username: cleanUser, p_password: password });

      if (error) {
        attempts.count += 1;
        if (attempts.count >= MAX_ATTEMPTS) {
          attempts.lockedUntil = Date.now() + LOCKOUT_MS;
          attempts.count = 0;
          return { success: false, error: `Too many failed attempts. Locked for 60 seconds.` };
        }
        // Surface user-facing error without leaking internals
        const msg = error.message.includes('Invalid username or password')
          ? 'Incorrect username or password.'
          : `Login failed: ${error.message}`;
        return { success: false, error: msg };
      }

      if (!data) {
        return { success: false, error: 'Login failed. Please try again.' };
      }

      // Reset rate limiter on success
      attempts.count = 0;
      attempts.lockedUntil = 0;

      const account = mapRowToAccount(data as SafeProfileRow);
      setCurrentUser(account);
      localStorage.setItem(SESSION_KEY, account.username);
      setIsAuthModalOpen(false);
      await refreshGlobalStats();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Failed to connect: ${msg}` };
    }
  };

  // ─── Register — server-side bcrypt via register_fn RPC ───────────────────
  const register = async (
    username: string,
    password: string,
    avatarUrl?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim();
    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured. Check .env.local.' };
    }

    // Rate limiting
    const attempts = registerAttemptsRef.current;
    const now = Date.now();
    if (now < attempts.lockedUntil) {
      const remaining = Math.ceil((attempts.lockedUntil - now) / 1000);
      return { success: false, error: `Too many registration attempts. Try again in ${remaining}s.` };
    }

    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUser}`;

    try {
      // SEC-FIX: Password hashed server-side in register_fn using pgcrypto.
      // Plaintext password is sent over TLS but never stored or logged.
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
          ? 'Username is already taken. Please log in.'
          : `Registration failed: ${error.message}`;
        return { success: false, error: msg };
      }

      if (!data) {
        return { success: false, error: 'Failed to create user profile.' };
      }

      // Reset rate limiter on success
      attempts.count = 0;
      attempts.lockedUntil = 0;

      const account = mapRowToAccount(data as SafeProfileRow);
      setCurrentUser(account);
      localStorage.setItem(SESSION_KEY, account.username);
      setIsAuthModalOpen(false);
      await refreshGlobalStats();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Registration error: ${msg}` };
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    // Let users browse the public site freely — do NOT force the auth modal
  };

  // ─── Delete Account — verified server-side via delete_own_account_fn ──────
  const deleteAccount = async (
    currentPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in.' };

    if (isSupabaseConfigured) {
      try {
        // SEC-FIX: Password verified server-side. No 'VERIFIED' bypass.
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

    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setIsSettingsModalOpen(false);
    await refreshGlobalStats();
    return { success: true };
  };

  // ─── Update Profile — verified server-side via update_own_profile_fn ─────
  const updateProfile = async (
    newUsername?: string,
    newPassword?: string,
    newAvatar?: string,
    currentPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };

    if (!currentPassword) {
      return { success: false, error: 'Current password is required to update your profile.' };
    }

    const cleanUser = newUsername?.trim();

    try {
      // SEC-FIX: Verification and hashing happen server-side.
      // New password is hashed inside update_own_profile_fn via pgcrypto.
      const { error } = await supabase
        .rpc('update_own_profile_fn', {
          p_username: currentUser.username,
          p_current_password: currentPassword,
          p_new_username: cleanUser && cleanUser.toLowerCase() !== currentUser.username.toLowerCase() ? cleanUser : null,
          p_new_password: newPassword && newPassword.length >= 4 ? newPassword : null,
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

      // Update local state with new display values (no hash involved)
      const updatedAccount: UserAccount = {
        ...currentUser,
        username: cleanUser && cleanUser.toLowerCase() !== currentUser.username.toLowerCase()
          ? cleanUser
          : currentUser.username,
        avatarUrl: newAvatar || currentUser.avatarUrl,
      };

      localStorage.setItem(SESSION_KEY, updatedAccount.username);
      setCurrentUser(updatedAccount);
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: `Update failed: ${msg}` };
    }
  };

  // ─── Atomic Multi-Stat Increment Engine (Atlas Architecture) ────────────
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
      let calculatedStats: UserAccount['stats'] | null = null;

      // Functional atomic update prevents race conditions and state stomping
      setCurrentUser((prev) => {
        if (!prev) return null;
        const nextStats = { ...prev.stats };
        for (const [key, amt] of Object.entries(statsToIncrement)) {
          if (typeof amt === 'number') {
            const statKey = key as UserStatKey;
            nextStats[statKey] = (nextStats[statKey] || 0) + amt;
          }
        }
        calculatedStats = nextStats;
        return {
          ...prev,
          stats: nextStats,
        };
      });

      try {
        // Construct batched DB update payload
        const dbUpdates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        for (const [key] of Object.entries(statsToIncrement)) {
          const statKey = key as UserStatKey;
          const dbCol = colMap[statKey];
          if (calculatedStats && typeof calculatedStats[statKey] === 'number') {
            dbUpdates[dbCol] = calculatedStats[statKey];
          }
        }

        const { error } = await supabase
          .from('user_profiles')
          .update(dbUpdates)
          .ilike('username', username);

        if (error) {
          console.error('[incrementStats] Supabase batched update failed:', error.message);
        }
      } catch (err) {
        console.error('[incrementStats] Sync error:', err);
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
