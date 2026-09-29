'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';

export function MobileJoinBar() {
  const [pin, setPin] = useState('');
  const { joinRoom, setIsJoinModalOpen } = useGame();
  const { currentUser, setIsAuthModalOpen } = useAuth();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const cleanPin = pin.replace(/\s+/g, '').toUpperCase();
    joinRoom(cleanPin, currentUser.username);
  };

  const handleInputClick = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsJoinModalOpen(true);
  };

  // Format PIN with space in middle if user types
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (raw.length > 6) raw = raw.slice(0, 6);
    if (raw.length > 3) {
      setPin(`${raw.slice(0, 3)} ${raw.slice(3)}`);
    } else {
      setPin(raw);
    }
  };

  return (
    <div className="w-full md:hidden px-3 pt-3 pb-2">
      <div className="rounded-xl bg-[#FFA7A0] p-3 shadow-sm border border-black/10 flex flex-col items-center justify-center w-full overflow-hidden">
        <form onSubmit={handleJoin} className="flex flex-row items-center justify-between w-full gap-2">
          {/* Label */}
          <div className="whitespace-nowrap flex flex-col font-nunito text-xs sm:text-sm font-black leading-tight tracking-normal text-black shrink-0">
            <span>Join game?</span>
            <span className="opacity-80">Enter PIN:</span>
          </div>

          {/* Input field styled exactly like Quiz.com */}
          <div className="flex-1 max-w-[200px] relative">
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck="false"
              placeholder="123 456"
              maxLength={7}
              value={pin}
              onChange={handlePinChange}
              onClick={handleInputClick}
              className="w-full font-nunito font-extrabold text-center rounded-full h-11 text-base bg-white text-black shadow-[inset_0_4px_0_0_rgba(0,0,0,0.15)] border-black border-solid border-4 placeholder:text-black/40 focus:outline-none tracking-widest uppercase transition-all"
            />
          </div>

          {/* Go / Submit Button */}
          <button
            type="submit"
            className="h-11 px-4 bg-black text-white font-nunito font-black text-sm rounded-full active:scale-95 transition-transform shrink-0"
          >
            GO
          </button>
        </form>
      </div>
    </div>
  );
}
