'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, AlertCircle, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SignUpPage() {
  const router = useRouter();
  const { register, currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Ace');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect home
  if (currentUser) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
  }

  const randomizeAvatar = () => {
    const seeds = ['Luffy', 'Zoro', 'Nami', 'Sanji', 'Chopper', 'Robin', 'Law', 'Shanks', 'Ace', 'Goku', 'Naruto', 'Levi', 'Gojo'];
    const random = seeds[Math.floor(Math.random() * seeds.length)] + '_' + Math.floor(Math.random() * 999);
    setAvatarSeed(random);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarSeed}`;
      const res = await register(username, password, avatarUrl);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      } else {
        router.push('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#FFFDF4]">
      <div className="w-full max-w-md bg-[#FFFDF4] border border-[#CECCC5] shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#EBDAC3] border-b border-[#CECCC5] px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-nunito font-bold text-[#595955] hover:text-black mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="font-nunito font-black text-2xl text-black tracking-tight">
            Create Your AniZuki Account
          </h1>
          <p className="font-roboto text-xs font-bold text-[#595955] mt-1">
            Zero email verification. Instant access to multiplayer quizzes.
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
            {/* Avatar Selector */}
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#E5E3DB] border-2 border-black overflow-hidden shadow-sm">
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
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-black text-white hover:bg-black/80 transition-colors shadow"
                  title="Randomize Avatar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="font-roboto text-[11px] font-bold text-[#595955]">
                Tap icon to shuffle avatar
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-nunito font-extrabold text-sm text-black">
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
                placeholder="Choose a username (min 3 chars)"
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
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password (min 4 chars)"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-black bg-white font-nunito font-bold text-sm text-black placeholder-black/30 focus:outline-none shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-[#F7F5ED] border border-[#CECCC5] rounded-xl text-[#595955]">
              <ShieldCheck className="w-4 h-4 text-[#4CA471] shrink-0" />
              <span className="font-roboto text-xs font-bold">
                Play on all devices with your username & password.
              </span>
            </div>

            <Button
              type="submit"
              variant="arena"
              size="lg"
              className="w-full mt-2"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Create Account & Enter Arena
            </Button>
          </form>

          {/* Footer link */}
          <div className="text-center pt-2 border-t border-[#CECCC5]">
            <p className="font-roboto text-xs text-[#595955]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-nunito font-black text-black hover:underline"
              >
                Log In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
