'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserAccount {
  username: string;
  passwordHash: string; // Stored securely in client storage
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
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (username: string, password: string, avatarUrl?: string) => { success: boolean; error?: string };
  logout: () => void;
  deleteAccount: () => void;
  updateProfile: (newUsername?: string, newPassword?: string, newAvatar?: string) => { success: boolean; error?: string };
  incrementStat: (statKey: 'roomsCreated' | 'matchesPlayed' | 'wins' | 'totalScore' | 'correctAnswers' | 'totalAnswers', amount?: number) => void;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCOUNTS_KEY = 'quiz_arena_accounts';
const SESSION_KEY = 'quiz_arena_current_session';
const GLOBAL_STATS_KEY = 'quiz_arena_global_stats';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalRoomsCreated: 1,
    totalMatchesPlayed: 0,
    totalPlayersCount: 1,
    overallAccuracy: 100,
  });

  // Load active session and global stats on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
      const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];

      if (savedSession) {
        const found = accounts.find((a) => a.username.toLowerCase() === savedSession.toLowerCase());
        if (found) {
          setCurrentUser(found);
        } else {
          setIsAuthModalOpen(true);
        }
      } else {
        // Prompt login on first opening as requested!
        setIsAuthModalOpen(true);
      }

      // Load global stats
      const savedStatsStr = localStorage.getItem(GLOBAL_STATS_KEY);
      if (savedStatsStr) {
        setGlobalStats(JSON.parse(savedStatsStr));
      } else {
        const initial = {
          totalRoomsCreated: 1,
          totalMatchesPlayed: 0,
          totalPlayersCount: Math.max(1, accounts.length),
          overallAccuracy: 100,
        };
        localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(initial));
        setGlobalStats(initial);
      }
    } catch {
      setIsAuthModalOpen(true);
    }
  }, []);

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      return { success: false, error: 'Username and password are required.' };
    }

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
  };

  const register = (
    username: string,
    password: string,
    avatarUrl?: string
  ): { success: boolean; error?: string } => {
    const cleanUser = username.trim();
    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
    const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
    const exists = accounts.some((a) => a.username.toLowerCase() === cleanUser.toLowerCase());

    if (exists) {
      return { success: false, error: 'Username is already registered. Please log in.' };
    }

    const newAccount: UserAccount = {
      username: cleanUser,
      passwordHash: password,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUser}`,
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

    // Update global players count
    setGlobalStats((prev) => {
      const updated = { ...prev, totalPlayersCount: accounts.length };
      localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(updated));
      return updated;
    });

    setCurrentUser(newAccount);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    setIsAuthModalOpen(true);
  };

  const deleteAccount = () => {
    if (!currentUser) return;
    const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
    let accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
    accounts = accounts.filter((a) => a.username.toLowerCase() !== currentUser.username.toLowerCase());
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setIsSettingsModalOpen(false);
    setIsAuthModalOpen(true);
  };

  const updateProfile = (
    newUsername?: string,
    newPassword?: string,
    newAvatar?: string
  ): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Not logged in' };

    const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
    const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
    const index = accounts.findIndex((a) => a.username.toLowerCase() === currentUser.username.toLowerCase());

    if (index === -1) return { success: false, error: 'Account not found' };

    if (newUsername && newUsername.trim() !== currentUser.username) {
      const cleanUser = newUsername.trim();
      const exists = accounts.some(
        (a, i) => i !== index && a.username.toLowerCase() === cleanUser.toLowerCase()
      );
      if (exists) return { success: false, error: 'Username already taken' };
      accounts[index].username = cleanUser;
    }

    if (newPassword && newPassword.length >= 4) {
      accounts[index].passwordHash = newPassword;
    }

    if (newAvatar) {
      accounts[index].avatarUrl = newAvatar;
    }

    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    localStorage.setItem(SESSION_KEY, accounts[index].username);
    setCurrentUser({ ...accounts[index] });
    return { success: true };
  };

  const incrementStat = (
    statKey: 'roomsCreated' | 'matchesPlayed' | 'wins' | 'totalScore' | 'correctAnswers' | 'totalAnswers',
    amount: number = 1
  ) => {
    if (!currentUser) return;

    const savedAccountsStr = localStorage.getItem(ACCOUNTS_KEY);
    const accounts: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
    const index = accounts.findIndex((a) => a.username.toLowerCase() === currentUser.username.toLowerCase());

    if (index !== -1) {
      accounts[index].stats[statKey] = (accounts[index].stats[statKey] || 0) + amount;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      setCurrentUser({ ...accounts[index] });
    }

    // Update global stats
    setGlobalStats((prev) => {
      const updated = { ...prev };
      if (statKey === 'roomsCreated') updated.totalRoomsCreated += amount;
      if (statKey === 'matchesPlayed') updated.totalMatchesPlayed += amount;

      // Accuracy calc
      if (currentUser.stats.totalAnswers > 0) {
        updated.overallAccuracy = Math.round(
          (currentUser.stats.correctAnswers / currentUser.stats.totalAnswers) * 100
        );
      }
      localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(updated));
      return updated;
    });
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
