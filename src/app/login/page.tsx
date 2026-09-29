'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect home
  if (currentUser) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Login failed. Please check your credentials.');
      } else {
        router.push('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#FFFDF4] dark:bg-[#100F0F] transition-colors duration-200">
      <div className="w-full max-w-md bg-[#FFFDF4] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#EBDAC3] dark:bg-[#2A2929] border-b border-[#CECCC5] dark:border-[#363535] px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-nunito font-bold text-[#595955] dark:text-[#A4A3A3] hover:text-black dark:hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="font-nunito font-black text-2xl text-black dark:text-white tracking-tight">
            Log In to AniZuki
          </h1>
          <p className="font-roboto text-xs font-bold text-[#595955] dark:text-[#A4A3A3] mt-1">
            Welcome back! Enter your credentials to continue your streak.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-[#FF94AB]/15 border border-[#FF94AB] rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-nunito font-bold text-xs text-red-700">
                {errorMsg}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-nunito font-extrabold text-sm text-black">
                <User className="w-3.5 h-3.5" />
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-black bg-white font-nunito font-bold text-sm text-black placeholder-black/30 focus:outline-none shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-nunito font-extrabold text-sm text-black">
                <Lock className="w-3.5 h-3.5" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-black bg-white font-nunito font-bold text-sm text-black placeholder-black/30 focus:outline-none shadow-sm"
              />
            </div>

            <Button
              type="submit"
              variant="arena"
              size="lg"
              className="w-full mt-2"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Sign In & Play
            </Button>
          </form>

          {/* Footer link */}
          <div className="text-center pt-2 border-t border-[#CECCC5]">
            <p className="font-roboto text-xs text-[#595955]">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-nunito font-black text-black hover:underline"
              >
                Sign Up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
