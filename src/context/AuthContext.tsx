'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface UserAccount {
  username: string;
  passwordHash: string;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'quiz_arena_current_session';

function mapRowToAccount(row: any): UserAccount {
  return {
    username: row.username,
    passwordHash: row.password_hash,
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

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  // ─── Refresh Global Stats from Supabase ──────────────────────────────────────
  const refreshGlobalStats = useCallback(async () => {
    if (!isSupabaseConfigured) {
      console.warn('[GlobalStats] Supabase is not configured.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('rooms_created, matches_played, wins, total_score, correct_answers, total_answers');

      if (error) {
        console.error('[GlobalStats] Supabase query failed:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const totalAnswers = data.reduce((acc, row) => acc + (row.total_answers || 0), 0);
        const correctAnswers = data.reduce((acc, row) => acc + (row.correct_answers || 0), 0);
        const computedAccuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
        const totalMatches = data.reduce((acc, row) => acc + (row.matches_played || 0), 0);
        const totalRooms = data.reduce((acc, row) => acc + (row.rooms_created || 0), 0);

        setGlobalStats({
          totalRoomsCreated: totalRooms,
          totalMatchesPlayed: totalMatches,
          totalPlayersCount: data.length,
          overallAccuracy: computedAccuracy,
        });
      }
    } catch (e) {
      console.error('[GlobalStats] Unexpected error:', e);
    }
  }, []);

  // ─── Initial session load from Supabase ─────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (!savedSession) {
          // Do not force open auth modal on public visit
          await refreshGlobalStats();
          return;
        }

        if (!isSupabaseConfigured) {
          console.error('[Auth] Supabase credentials not found in env!');
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .ilike('username', savedSession)
          .maybeSingle();

        if (error) {
          console.error('[Auth] Supabase fetch session failed:', error.message);
          return;
        }

        if (data) {
          const account = mapRowToAccount(data);
          setCurrentUser(account);
        } else {
          // Username in session not found in Supabase
          localStorage.removeItem(SESSION_KEY);
        }

        await refreshGlobalStats();
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, [refreshGlobalStats]);

  // ─── Login (Strict Supabase) ────────────────────────────────────────────────
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

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('username', cleanUser)
        .maybeSingle();

      if (error) {
        console.error('[Login] Supabase error:', error.message);
        return { success: false, error: `Database error: ${error.message}` };
      }

      if (!data) {
        return { success: false, error: `Account "${cleanUser}" does not exist in Supabase. Please register first.` };
      }

      if (data.password_hash !== password) {
        return { success: false, error: 'Incorrect password.' };
      }

      const account = mapRowToAccount(data);
      setCurrentUser(account);
      localStorage.setItem(SESSION_KEY, account.username);
      setIsAuthModalOpen(false);
      await refreshGlobalStats();
      return { success: true };
    } catch (err: any) {
      console.error('[Login] Connection error:', err);
      return { success: false, error: `Failed to connect to Supabase: ${err?.message || err}` };
    }
  };

  // ─── Register (Strict Supabase) ─────────────────────────────────────────────
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

    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUser}`;

    try {
      // 1. Check if user already exists in Supabase
      const { data: existing, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('username', cleanUser)
        .maybeSingle();

      if (checkError) {
        console.error('[Register] Supabase check error:', checkError.message);
        return { success: false, error: `Supabase check error: ${checkError.message}` };
      }

      if (existing) {
        return { success: false, error: 'Username is already taken in Supabase. Please log in.' };
      }

      // 2. Insert into user_profiles table in Supabase
      const { data: inserted, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          username: cleanUser,
          password_hash: password,
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
        console.error('[Register] Supabase insert failed:', insertError);
        return { success: false, error: `Supabase insert failed: ${insertError.message}` };
      }

      if (inserted) {
        const account = mapRowToAccount(inserted);
        setCurrentUser(account);
        localStorage.setItem(SESSION_KEY, account.username);
        setIsAuthModalOpen(false);
        await refreshGlobalStats();
        return { success: true };
      }

      return { success: false, error: 'Failed to create user profile in Supabase.' };
    } catch (err: any) {
      console.error('[Register] Connection error:', err);
      return { success: false, error: `Supabase registration error: ${err?.message || err}` };
    }
  };

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    setIsAuthModalOpen(true);
  };

  // ─── Delete Account (Strict Supabase) ───────────────────────────────────────
  const deleteAccount = async () => {
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
    setIsAuthModalOpen(true);
    await refreshGlobalStats();
  };

  // ─── Update Profile (Strict Supabase) ───────────────────────────────────────
  const updateProfile = async (
    newUsername?: string,
    newPassword?: string,
    newAvatar?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };

    const cleanUser = newUsername?.trim();
    const updates: any = { updated_at: new Date().toISOString() };

    if (cleanUser && cleanUser.toLowerCase() !== currentUser.username.toLowerCase()) {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('username', cleanUser)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Username already taken in Supabase' };
      }
      updates.username = cleanUser;
    }

    if (newPassword && newPassword.length >= 4) {
      updates.password_hash = newPassword;
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
        return { success: false, error: `Supabase update error: ${error.message}` };
      }

      const updatedAccount: UserAccount = {
        ...currentUser,
        username: updates.username || currentUser.username,
        passwordHash: updates.password_hash || currentUser.passwordHash,
        avatarUrl: updates.avatar_url || currentUser.avatarUrl,
      };

      localStorage.setItem(SESSION_KEY, updatedAccount.username);
      setCurrentUser(updatedAccount);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: `Update failed: ${e?.message || e}` };
    }
  };

  // ─── Increment Stat (Strict Supabase) ───────────────────────────────────────
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
    const updatedUser: UserAccount = {
      ...currentUser,
      stats: {
        ...currentUser.stats,
        [statKey]: newStatValue,
      },
    };
    setCurrentUser(updatedUser);

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

    await refreshGlobalStats();
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
