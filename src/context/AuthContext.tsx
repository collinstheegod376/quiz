'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Shape of a row returned from the user_profiles table */
interface UserProfileRow {
  id: string;
  username: string;
  password_hash: string;
  avatar_url: string;
  rooms_created: number;
  matches_played: number;
  wins: number;
  total_score: number;
  correct_answers: number;
  total_answers: number;
  created_at: string;
  updated_at: string;
}

/** Public user account — never contains password data */
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

interface AuthContextType {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isSupabaseConnected: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, avatarUrl?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateProfile: (newUsername?: string, newPassword?: string, newAvatar?: string) => Promise<{ success: boolean; error?: string }>;
  incrementStat: (statKey: 'roomsCreated' | 'matchesPlayed' | 'wins' | 'totalScore' | 'correctAnswers' | 'totalAnswers', amount?: number) => Promise<void>;
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
const BCRYPT_ROUNDS = 10;
/** Rate limit: max attempts before lockout */
const MAX_ATTEMPTS = 5;
/** Lockout duration in milliseconds (60 seconds) */
const LOCKOUT_MS = 60_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Maps a raw Supabase row to a safe UserAccount — never includes password data */
function mapRowToAccount(row: UserProfileRow): UserAccount {
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

/**
 * Verify a password against a stored hash using rolling migration:
 * - If the stored value is a bcrypt hash ($2b$...), use bcrypt.compare()
 * - If it's a legacy plain-text value, compare directly
 * Returns { valid, needsRehash } so callers can upgrade legacy passwords.
 */
async function verifyPassword(
  plainPassword: string,
  storedHash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  const isBcrypt = storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$');
  if (isBcrypt) {
    const valid = await bcrypt.compare(plainPassword, storedHash);
    return { valid, needsRehash: false };
  }
  // Legacy plain-text comparison — flag for rehash
  const valid = storedHash === plainPassword;
  return { valid, needsRehash: valid };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
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

  // ─── Refresh Global Stats (BE-16: single aggregate query, no full scan) ──
  const refreshGlobalStats = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      // Use Supabase aggregate functions — returns a single row, not all rows
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

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .ilike('username', savedSession)
          .maybeSingle();

        if (error) {
          console.error('[Auth] Session restore failed:', error.message);
          await refreshGlobalStats();
          return;
        }

        if (data) {
          setCurrentUser(mapRowToAccount(data as UserProfileRow));
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

  // ─── Login (BE-01: rolling bcrypt migration, BE-08: rate limiting) ────────
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

    // BE-08: Rate limiting check
    const attempts = loginAttemptsRef.current;
    const now = Date.now();
    if (now < attempts.lockedUntil) {
      const remaining = Math.ceil((attempts.lockedUntil - now) / 1000);
      return { success: false, error: `Too many failed attempts. Try again in ${remaining}s.` };
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('username', cleanUser)
        .maybeSingle();

      if (error) {
        return { success: false, error: `Database error: ${error.message}` };
      }

      if (!data) {
        return { success: false, error: `Account "${cleanUser}" does not exist. Please register first.` };
      }

      // BE-01: Rolling migration — supports both bcrypt and legacy plain-text passwords
      const { valid, needsRehash } = await verifyPassword(password, (data as UserProfileRow).password_hash);

      if (!valid) {
        // Track failed attempts
        attempts.count += 1;
        if (attempts.count >= MAX_ATTEMPTS) {
          attempts.lockedUntil = Date.now() + LOCKOUT_MS;
          attempts.count = 0;
          return { success: false, error: `Too many failed attempts. Locked for 60 seconds.` };
        }
        return { success: false, error: 'Incorrect password.' };
      }

      // Reset rate limiter on success
      attempts.count = 0;
      attempts.lockedUntil = 0;

      // BE-01 Rolling migration: silently upgrade legacy plain-text password to bcrypt
      if (needsRehash) {
        const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await supabase
          .from('user_profiles')
          .update({ password_hash: newHash, updated_at: new Date().toISOString() })
          .ilike('username', cleanUser);
      }

      const account = mapRowToAccount(data as UserProfileRow);
      setCurrentUser(account);
      localStorage.setItem(SESSION_KEY, account.username);
      setIsAuthModalOpen(false);
      await refreshGlobalStats();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Failed to connect to Supabase: ${msg}` };
    }
  };

  // ─── Register (BE-02: bcrypt hash on insert, BE-08: rate limiting) ────────
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

    // BE-08: Rate limiting
    const attempts = registerAttemptsRef.current;
    const now = Date.now();
    if (now < attempts.lockedUntil) {
      const remaining = Math.ceil((attempts.lockedUntil - now) / 1000);
      return { success: false, error: `Too many registration attempts. Try again in ${remaining}s.` };
    }

    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUser}`;

    try {
      const { data: existing, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('username', cleanUser)
        .maybeSingle();

      if (checkError) {
        attempts.count += 1;
        if (attempts.count >= MAX_ATTEMPTS) {
          attempts.lockedUntil = Date.now() + LOCKOUT_MS;
          attempts.count = 0;
        }
        return { success: false, error: `Check error: ${checkError.message}` };
      }

      if (existing) {
        return { success: false, error: 'Username is already taken. Please log in.' };
      }

      // BE-02: Hash password before storing — never store plain text
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const { data: inserted, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          username: cleanUser,
          password_hash: hashedPassword,
          avatar_url: finalAvatar,
          rooms_created: 0,
          matches_played: 0,
          wins: 0,
          total_score: 0,
          correct_answers: 0,
          total_answers: 0,
        })
        .select('*')
        .single();

      if (insertError) {
        return { success: false, error: `Registration failed: ${insertError.message}` };
      }

      if (inserted) {
        // Reset rate limiter on success
        attempts.count = 0;
        attempts.lockedUntil = 0;

        const account = mapRowToAccount(inserted as UserProfileRow);
        setCurrentUser(account);
        localStorage.setItem(SESSION_KEY, account.username);
        setIsAuthModalOpen(false);
        await refreshGlobalStats();
        return { success: true };
      }

      return { success: false, error: 'Failed to create user profile.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Registration error: ${msg}` };
    }
  };

  // ─── Logout (BE-24: no forced auth modal) ────────────────────────────────
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    // Let users browse the public site freely — do NOT force the auth modal
  };

  // ─── Delete Account (BE-26: properly async) ───────────────────────────────
  const deleteAccount = async (): Promise<void> => {
    if (!currentUser) return;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .delete()
          .ilike('username', currentUser.username);

        if (error) {
          console.error('[deleteAccount] Supabase delete error:', error.message);
        }
      } catch (e) {
        console.error('[deleteAccount] Supabase error:', e);
      }
    }

    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setIsSettingsModalOpen(false);
    // BE-26: Now properly awaited since deleteAccount is async
    await refreshGlobalStats();
  };

  // ─── Update Profile (BE-03: bcrypt hash on password change) ──────────────
  const updateProfile = async (
    newUsername?: string,
    newPassword?: string,
    newAvatar?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };

    const cleanUser = newUsername?.trim();
    const updates: Record<string, string> = { updated_at: new Date().toISOString() };

    if (cleanUser && cleanUser.toLowerCase() !== currentUser.username.toLowerCase()) {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('username', cleanUser)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Username already taken' };
      }
      updates.username = cleanUser;
    }

    if (newPassword && newPassword.length >= 4) {
      // BE-03: Hash the new password before storing
      updates.password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    }

    if (newAvatar) {
      updates.avatar_url = newAvatar;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .ilike('username', currentUser.username);

      if (error) {
        return { success: false, error: `Update error: ${error.message}` };
      }

      // BE-07: Never store passwordHash in state — only keep safe fields
      const updatedAccount: UserAccount = {
        ...currentUser,
        username: updates.username || currentUser.username,
        avatarUrl: updates.avatar_url || currentUser.avatarUrl,
      };

      localStorage.setItem(SESSION_KEY, updatedAccount.username);
      setCurrentUser(updatedAccount);
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: `Update failed: ${msg}` };
    }
  };

  // ─── Increment Stat (BE-17: no refreshGlobalStats on every call) ──────────
  const incrementStat = async (
    statKey: 'roomsCreated' | 'matchesPlayed' | 'wins' | 'totalScore' | 'correctAnswers' | 'totalAnswers',
    amount: number = 1
  ) => {
    if (!currentUser || !isSupabaseConfigured) return;

    const colMap: Record<string, string> = {
      roomsCreated: 'rooms_created',
      matchesPlayed: 'matches_played',
      wins: 'wins',
      totalScore: 'total_score',
      correctAnswers: 'correct_answers',
      totalAnswers: 'total_answers',
    };

    const newStatValue = (currentUser.stats[statKey] || 0) + amount;

    // Optimistic UI update
    setCurrentUser({
      ...currentUser,
      stats: { ...currentUser.stats, [statKey]: newStatValue },
    });

    try {
      const dbCol = colMap[statKey];
      const { error } = await supabase
        .from('user_profiles')
        .update({
          [dbCol]: newStatValue,
          updated_at: new Date().toISOString(),
        })
        .ilike('username', currentUser.username);

      if (error) {
        console.error('[incrementStat] Supabase error:', error.message);
      }
    } catch (e) {
      console.error('[incrementStat] Supabase error:', e);
    }
    // BE-17: Removed refreshGlobalStats() call — no longer triggers full-table
    // scan on every answer submission. Stats refresh on login/logout only.
  };

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
