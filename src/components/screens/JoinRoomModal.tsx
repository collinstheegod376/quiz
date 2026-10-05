'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { Button } from '../ui/Button';

export function JoinRoomModal() {
  const { isJoinModalOpen, setIsJoinModalOpen, joinRoom } = useGame();
  const { currentUser, openAuthModal } = useAuth();

  const [roomCode, setRoomCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  if (!isJoinModalOpen) return null;

  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm animate-fadeIn"
        onClick={(e) => { if (e.target === e.currentTarget) setIsJoinModalOpen(false); }}
      >
        <div className="relative w-full max-w-md bg-[#FFFDF4] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-nunito font-black text-xl text-black dark:text-white">
            Combatant Profile Required
          </h2>
          <p className="font-roboto text-xs text-[#595955] dark:text-[#A4A3A3] leading-relaxed">
            Guest mode has been disabled. You must log in or create an account to enter multiplayer rooms and join live arenas.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="arena"
              size="md"
              onClick={() => {
                setIsJoinModalOpen(false);
                openAuthModal('login');
              }}
            >
              Sign In / Register
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsJoinModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = roomCode.trim().toUpperCase();
    if (!clean) return;
    setIsJoining(true);
    const result = await joinRoom(clean, currentUser.username);
    setIsJoining(false);
    if (!result.success) {
      setErrorMsg(result.error || 'Room not found. Verify the 6-character room code.');
    } else {
      setIsJoinModalOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) setIsJoinModalOpen(false); }}
    >
      <div className="relative w-full max-w-md bg-[#FFFDF4] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] shadow-2xl">
        {/* Header Band */}
        <div className="bg-[#EBDAC3] dark:bg-[#2A2929] border-b border-[#CECCC5] dark:border-[#363535] px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
              Join an Arena Room
            </h2>
            <p className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize mt-1">
              Enter the 6-character code from your match host.
            </p>
          </div>
          <button
            onClick={() => setIsJoinModalOpen(false)}
            className="w-8 h-8 flex items-center justify-center bg-[#E5E3DB] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] hover:bg-[#CECCC5] dark:hover:bg-[#363535] text-[#000000] dark:text-[#FEFEFD] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Verified Player Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#E5E3DB]/50 dark:bg-[#100F0F] border border-[#CECCC5] dark:border-[#363535]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-black/20 dark:border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-nunito font-extrabold text-[11px] text-[#595955] dark:text-[#A4A3A3] block uppercase tracking-wider">
                  Challenger
                </span>
                <span className="font-nunito font-black text-sm text-black dark:text-white">
                  {currentUser.username}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authenticated</span>
            </div>
          </div>

          {/* Room Code input */}
          <div>
            <label className="font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize block mb-1.5">
              Room PIN / Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full px-5 py-4 rounded-full border-[4px] border-[#000000] dark:border-[#FEFEFD] bg-[#FFFDF4] dark:bg-[#100F0F] font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD] placeholder-[#CECCC5] tracking-[8px] text-center focus:outline-none uppercase"
            />
            <p className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize text-center mt-2">
              6 characters · case insensitive
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-[#FF94AB]/10 border border-[#FF94AB]/40">
              <AlertCircle className="w-4 h-4 text-[#FF94AB] shrink-0" />
              <span className="font-nunito font-extrabold text-[12.8px] text-[#FF94AB] tracking-[0.38px] capitalize">
                {errorMsg}
              </span>
            </div>
          )}

          <Button type="submit" variant="arena" size="lg" className="w-full" disabled={isJoining} isLoading={isJoining}>
            {isJoining ? 'Connecting…' : 'Connect to Lobby'}
          </Button>
        </form>
      </div>
    </div>
  );
}
