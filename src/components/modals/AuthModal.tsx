'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, ShieldCheck, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function AuthModal() {
  const { isAuthModalOpen, isAuthLoading, login, register, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Ace');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthLoading) return null;
  if (isAuthenticated && !isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        const res = await login(username, password);
        if (!res.success) setErrorMsg(res.error || 'Login failed.');
      } else {
        const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarSeed}`;
        const res = await register(username, password, avatarUrl);
        if (!res.success) setErrorMsg(res.error || 'Registration failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const randomizeAvatar = () => {
    const seeds = ['Luffy', 'Zoro', 'Nami', 'Sanji', 'Chopper', 'Robin', 'Law', 'Shanks', 'Ace', 'Goku', 'Naruto', 'Levi', 'Gojo'];
    const random = seeds[Math.floor(Math.random() * seeds.length)] + '_' + Math.floor(Math.random() * 999);
    setAvatarSeed(random);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FFFDF4] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] shadow-2xl">

        {/* Header band */}
        <div className="bg-[#EBDAC3] border-b border-[#CECCC5] px-6 py-5">
          <h2 className="font-nunito font-black text-[20px] text-[#000000] leading-[1.4] tracking-[0.6px]">
            {tab === 'login' ? 'Sign In to Quiz Arena' : 'Create Your Account'}
          </h2>
          <p className="font-nunito font-extrabold text-[12.8px] text-[#595955] tracking-[0.38px] capitalize mt-1">
            {tab === 'login'
              ? 'Welcome back! Enter your credentials to continue.'
              : 'No email required. Seamless instant access.'}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Tab switch */}
          <div className="grid grid-cols-2 border border-[#CECCC5] dark:border-[#363535]">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setErrorMsg(''); }}
                className={`py-2.5 font-nunito font-extrabold text-[14px] tracking-[0.42px] capitalize transition-colors ${
                  tab === t
                    ? 'bg-[#EBDAC3] text-[#000000]'
                    : 'bg-[#FFFDF4] dark:bg-[#100F0F] text-[#595955] dark:text-[#A4A3A3] hover:bg-[#E5E3DB] dark:hover:bg-[#1E1D1D]'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="p-3 bg-[#FF94AB]/10 border border-[#FF94AB]/40 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF94AB] shrink-0" />
              <span className="font-nunito font-extrabold text-[12.8px] text-[#FF94AB] tracking-[0.38px] capitalize">
                {errorMsg}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar picker for register */}
            {tab === 'register' && (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="relative">
                  <div className="w-16 h-16 bg-[#E5E3DB] dark:bg-[#2A2929] border-2 border-[#CECCC5] dark:border-[#363535] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarSeed}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={randomizeAvatar}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-[#EBDAC3] border border-[#CECCC5] hover:bg-[#E5E3DB] transition-colors"
                    title="Randomize Avatar"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#000000]" />
                  </button>
                </div>
                <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                  Click icon to randomize avatar
                </span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize">
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
                className="w-full px-5 py-3 rounded-full border-[4px] border-[#000000] dark:border-[#FEFEFD] bg-[#FFFDF4] dark:bg-[#100F0F] font-nunito font-extrabold text-[16px] text-[#000000] dark:text-[#FEFEFD] placeholder-[#CECCC5] tracking-[0.48px] focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize">
                <Lock className="w-3.5 h-3.5" />
                Password
              </label>
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your arena password…"
                className="w-full px-5 py-3 rounded-full border-[4px] border-[#000000] dark:border-[#FEFEFD] bg-[#FFFDF4] dark:bg-[#100F0F] font-nunito font-extrabold text-[16px] text-[#000000] dark:text-[#FEFEFD] placeholder-[#CECCC5] tracking-[0.48px] focus:outline-none"
              />
            </div>

            {/* Shield notice */}
            <div className="flex items-center gap-2 p-3 bg-[#F7F5ED] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535]">
              <ShieldCheck className="w-4 h-4 text-[#4CA471] shrink-0" />
              <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                Zero email verification. Seamless instant access.
              </span>
            </div>

            <Button
              type="submit"
              variant="arena"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {tab === 'login' ? 'Sign In & Enter Arena' : 'Create Account & Play'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
