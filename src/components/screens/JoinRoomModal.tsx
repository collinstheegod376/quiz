'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { X, LogIn, Hash, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export function JoinRoomModal() {
  const { isJoinModalOpen, setIsJoinModalOpen, joinRoom } = useGame();
  const { currentUser } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.username || 'Challenger');
  const [roomCode, setRoomCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (currentUser?.username) {
      setDisplayName(currentUser.username);
    }
  }, [currentUser]);

  if (!isJoinModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = roomCode.trim().toUpperCase();
    if (!clean) return;
    setIsJoining(true);
    const success = await joinRoom(clean, displayName);
    setIsJoining(false);
    if (!success) {
      setErrorMsg('Room not found or max capacity reached. Please verify the 6-character room code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setIsJoinModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <LogIn className="w-3.5 h-3.5" />
            Direct Access
          </div>
          <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">
            Join a Room
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter the 6-character room code provided by your match host.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Your Display Name
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. ZoroFan"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Room Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              6-Character Room Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full px-4 py-3 text-center tracking-[0.25em] font-mono text-xl uppercase font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-[11px] text-slate-400 text-center">
              Room codes are case-insensitive letters and numbers.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Real-time presence syncs scores and answers instantly.</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <Button type="submit" variant="arena" size="lg" className="w-full shadow-xl" disabled={isJoining}>
            <LogIn className="w-4 h-4" />
            {isJoining ? 'Connecting...' : 'Connect to Lobby'}
          </Button>
        </form>
      </div>
    </div>
  );
}
