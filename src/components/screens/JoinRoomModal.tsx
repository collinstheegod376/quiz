'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export function JoinRoomModal() {
  const { isJoinModalOpen, setIsJoinModalOpen, joinRoom } = useGame();
  const { currentUser } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.username || 'Challenger');
  const [roomCode, setRoomCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (currentUser?.username) setDisplayName(currentUser.username);
  }, [currentUser]);

  if (!isJoinModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = roomCode.trim().toUpperCase();
    if (!clean) return;
    setIsJoining(true);
    const result = await joinRoom(clean, displayName);
    setIsJoining(false);
    if (!result.success) {
      setErrorMsg(result.error || 'Room not found. Verify the 6-character room code.');
    } else {
      setIsJoinModalOpen(false);
    }
  };

  const inputClass = "w-full px-5 py-3 rounded-full border-[4px] border-[#000000] dark:border-[#FEFEFD] bg-[#FFFDF4] dark:bg-[#100F0F] font-nunito font-extrabold text-[16px] text-[#000000] dark:text-[#FEFEFD] placeholder-[#CECCC5] tracking-[0.48px] focus:outline-none";
  const labelClass = "font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize block mb-1.5";

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
              Join a Room
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
          {/* Display Name */}
          <div>
            <label className={labelClass}>Your Display Name</label>
            <input
              type="text"
              required
              maxLength={20}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. ZoroFan"
              className={inputClass}
            />
          </div>

          {/* Room Code — signature hero input */}
          <div>
            <label className={labelClass}>Room PIN / Code</label>
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

          {/* Info strip */}
          <div className="flex items-center gap-2 p-3 bg-[#F7F5ED] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535]">
            <ShieldCheck className="w-4 h-4 text-[#4CA471] shrink-0" />
            <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
              Real-time presence syncs scores and answers instantly.
            </span>
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
