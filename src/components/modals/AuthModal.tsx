'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Lock,
  Zap,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function AuthModal() {
  const { isAuthModalOpen, login, register, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Ace');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen && isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (tab === 'login') {
      const res = login(username, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Login failed.');
      }
    } else {
      const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarSeed}`;
      const res = register(username, password, avatarUrl);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      }
    }
  };

  const randomizeAvatar = () => {
    const seeds = ['Luffy', 'Zoro', 'Nami', 'Sanji', 'Chopper', 'Robin', 'Law', 'Shanks', 'Ace', 'Goku', 'Naruto', 'Levi', 'Gojo'];
    const random = seeds[Math.floor(Math.random() * seeds.length)] + '_' + Math.floor(Math.random() * 999);
    setAvatarSeed(random);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-500/20">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Combatant Authentication</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            {tab === 'login' ? 'Enter Quiz Arena' : 'Create Arena Profile'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tab === 'login'
              ? 'Sign in with your username and password to access the battlegrounds.'
              : 'Choose a combatant username and password. No email required.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div className="flex flex-col items-center justify-center space-y-2 pb-2">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-red-500 overflow-hidden shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarSeed}`}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={randomizeAvatar}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition-colors"
                  title="Randomize Avatar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Click icon to randomize avatar</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Username
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={20}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Captain_Roger"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Password
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your arena password..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero email verification needed. Seamless instant access.</span>
          </div>

          <Button type="submit" variant="arena" size="lg" className="w-full shadow-xl">
            <Zap className="w-4 h-4 fill-current" />
            {tab === 'login' ? 'Sign In & Enter Arena' : 'Create Account & Play'}
          </Button>
        </form>
      </div>
    </div>
  );
}
