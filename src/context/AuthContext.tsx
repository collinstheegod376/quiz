'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, avatarUrl?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateProfile: (newUsername?: string, newPassword?: string, newAvatar?: string) => Promise<{ success: boolean; error?: string }>;
  incrementStat: (statKey: 'roomsCreated' | 'matchesPlayed' | 'wins' | 'totalScore' | 'correctAnswers' | 'totalAnswers', amount?: number) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
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

const ACCOUNTS_KEY = 'quiz_arena_accounts';
const SESSION_KEY = 'quiz_arena_current_session';
const GLOBAL_STATS_KEY = 'quiz_arena_global_stats';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalRoomsCreated: 0,
    totalMatchesPlayed: 0,
    totalPlayersCount: 0,
    overallAccuracy: 0,
  });

  // ─── Refresh Global Stats from Supabase ──────────────────────────────────────
  const refreshGlobalStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('rooms_created, matches_played, wins, total_score, correct_answers, total_answers');

      if (!error && data && data.length > 0) {
        const totalAnswers = data.reduce((acc, row) => acc + (row.total_answers || 0), 0);
        const correctAnswers = data.reduce((acc, row) => acc + (row.correct_answers || 0), 0);
        const computedAccuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
        const totalMatches = data.reduce((acc, row) => acc + (row.matches_played || 0), 0);
        const totalRooms = data.reduce((acc, row) => acc + (row.rooms_created || 0), 0);

        const realStats = {
          totalRoomsCreated: totalRooms,
          totalMatchesPlayed: totalMatches,
          totalPlayersCount: data.length,
          overallAccuracy: computedAccuracy,
        };
        localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(realStats));
        setGlobalStats(realStats);
        return;
      }
    } catch (e) {
      console.warn('[GlobalStats] Supabase query failed, falling back to local storage:', e);
    }

    // LocalStorage fallback
    try {
      const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
      const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
      const totalAnswers = accounts.reduce((acc, a) => acc + (a.stats?.totalAnswers || 0), 0);
      const correctAnswers = accounts.reduce((acc, a) => acc + (a.stats?.correctAnswers || 0), 0);
      const computedAccuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      const totalMatches = accounts.reduce((acc, a) => acc + (a.stats?.matchesPlayed || 0), 0);
      const totalRooms = accounts.reduce((acc, a) => acc + (a.stats?.roomsCreated || 0), 0);

      const localStats = {
        totalRoomsCreated: totalRooms,
        totalMatchesPlayed: totalMatches,
        totalPlayersCount: accounts.length,
        overallAccuracy: computedAccuracy,
      };
      setGlobalStats(localStats);
    } catch {}
  }, []);

  // ─── Initial session load ──────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (!savedSession) {
        setIsAuthModalOpen(true);
        refreshGlobalStats();
        return;
      }

      // 1. Try to load user profile from Supabase
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .ilike('username', savedSession)
          .maybeSingle();

        if (!error && data) {
          const account = mapRowToAccount(data);
          setCurrentUser(account);
          refreshGlobalStats();
          return;
        }
      } catch (err) {
        console.warn('[Auth] Supabase fetch session failed, trying local fallback:', err);
      }

      // 2. Fallback to localStorage accounts
      try {
        const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
        const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
        const found = accounts.find((a) => a.username.toLowerCase() === savedSession.toLowerCase());
        if (found) {
          setCurrentUser(found);
        } else {
          setIsAuthModalOpen(true);
        }
      } catch {
        setIsAuthModalOpen(true);
      }

      refreshGlobalStats();
    };

    initAuth();
  }, [refreshGlobalStats]);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      return { success: false, error: 'Username and password are required.' };
    }

    // 1. Attempt Supabase login
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('username', cleanUser)
        .maybeSingle();

      if (!error && data) {
        if (data.password_hash !== password) {
          return { success: false, error: 'Incorrect password.' };
        }
        const account = mapRowToAccount(data);
        setCurrentUser(account);
        localStorage.setItem(SESSION_KEY, account.username);
        setIsAuthModalOpen(false);
        refreshGlobalStats();
        return { success: true };
      }
    } catch (err) {
      console.warn('[Login] Supabase login error:', err);
    }

    // 2. Fallback to localStorage login
    try {
      const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
      const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
      const found = accounts.find((a) => a.username.toLowerCase() === cleanUser.toLowerCase());

      if (!found) {
        return { success: false, error: 'Account not found. Please register.' };
      }

      if (found.passwordHash !== password) {
        return { success: false, error: 'Incorrect password.' };
      }

      setCurrentUser(found);
      localStorage.setItem(SESSION_KEY, found.username);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to authenticate user.' };
    }
  };

  // ─── Register ─────────────────────────────────────────────────────────────
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

    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUser}`;

    // 1. Check & Insert in Supabase
    try {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('username', cleanUser)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Username is already registered. Please log in.' };
      }

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

      if (!insertError && inserted) {
        const account = mapRowToAccount(inserted);
        setCurrentUser(account);
        localStorage.setItem(SESSION_KEY, account.username);
        setIsAuthModalOpen(false);
        refreshGlobalStats();
        return { success: true };
      }
    } catch (err) {
      console.warn('[Register] Supabase register error:', err);
    }

    // 2. Fallback to localStorage
    try {
      const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
      const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
      const exists = accounts.some((a) => a.username.toLowerCase() === cleanUser.toLowerCase());

      if (exists) {
        return { success: false, error: 'Username is already registered. Please log in.' };
      }

      const newAccount: UserAccount = {
        username: cleanUser,
        passwordHash: password,
        avatarUrl: finalAvatar,
        createdAt: new Date().toISOString(),
        stats: {
          roomsCreated: 0,
          matchesPlayed: 0,
          wins: 0,
          totalScore: 0,
          correctAnswers: 0,
          totalAnswers: 0,
        },
      };

      accounts.push(newAccount);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      localStorage.setItem(SESSION_KEY, newAccount.username);

      setCurrentUser(newAccount);
      setIsAuthModalOpen(false);
      refreshGlobalStats();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to create account.' };
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    setIsAuthModalOpen(true);
  };

  // ─── Delete Account ───────────────────────────────────────────────────────
  const deleteAccount = async () => {
    if (!currentUser) return;

    try {
      await supabase
        .from('user_profiles')
        .delete()
        .ilike('username', currentUser.username);
    } catch (e) {
      console.warn('[deleteAccount] Supabase delete error:', e);
    }

    try {
      const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
      let accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
      accounts = accounts.filter((a) => a.username.toLowerCase() !== currentUser.username.toLowerCase());
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {}

    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setIsSettingsModalOpen(false);
    setIsAuthModalOpen(true);
    refreshGlobalStats();
  };

  // ─── Update Profile ───────────────────────────────────────────────────────
  const updateProfile = async (
    newUsername?: string,
    newPassword?: string,
    newAvatar?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in' };

    const cleanUser = newUsername?.trim();
    const updates: any = { updated_at: new Date().toISOString() };

    if (cleanUser && cleanUser.toLowerCase() !== currentUser.username.toLowerCase()) {
      try {
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('id')
          .ilike('username', cleanUser)
          .maybeSingle();

        if (existing) {
          return { success: false, error: 'Username already taken' };
        }
      } catch {}
      updates.username = cleanUser;
    }

    if (newPassword && newPassword.length >= 4) {
      updates.password_hash = newPassword;
    }

    if (newAvatar) {
      updates.avatar_url = newAvatar;
    }

    // 1. Supabase update
    try {
      await supabase
        .from('user_profiles')
        .update(updates)
        .ilike('username', currentUser.username);
    } catch (e) {
      console.warn('[updateProfile] Supabase update error:', e);
    }

    // 2. Local state update
    const updatedAccount: UserAccount = {
      ...currentUser,
      username: updates.username || currentUser.username,
      passwordHash: updates.password_hash || currentUser.passwordHash,
      avatarUrl: updates.avatar_url || currentUser.avatarUrl,
    };

    try {
      const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
      const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
      const idx = accounts.findIndex((a) => a.username.toLowerCase() === currentUser.username.toLowerCase());
      if (idx !== -1) {
        accounts[idx] = updatedAccount;
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      }
    } catch {}

    localStorage.setItem(SESSION_KEY, updatedAccount.username);
    setCurrentUser(updatedAccount);
    return { success: true };
  };

  // ─── Increment Stat ───────────────────────────────────────────────────────
  const incrementStat = async (
    statKey: 'roomsCreated' | 'matchesPlayed' | 'wins' | 'totalScore' | 'correctAnswers' | 'totalAnswers',
    amount: number = 1
  ) => {
    if (!currentUser) return;

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

    // Sync to Supabase
    try {
      const dbCol = colMap[statKey];
      await supabase
        .from('user_profiles')
        .update({
          [dbCol]: newStatValue,
          updated_at: new Date().toISOString(),
        })
        .ilike('username', currentUser.username);
    } catch (e) {
      console.warn('[incrementStat] Supabase error:', e);
    }

    // Fallback sync to local storage
    try {
      const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
      const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
      const idx = accounts.findIndex((a) => a.username.toLowerCase() === currentUser.username.toLowerCase());
      if (idx !== -1) {
        accounts[idx] = updatedUser;
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      }
    } catch {}

    refreshGlobalStats();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        deleteAccount,
        updateProfile,
        incrementStat,
        isAuthModalOpen,
        setIsAuthModalOpen,
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
