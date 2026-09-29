'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';
import { X, Users, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

export function CreateRoomModal() {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createRoom,
    selectedCategoryId,
    selectedTopicId,
    selectedDifficultyLevel,
    setSelectedCategoryId,
    setSelectedTopicId,
    setSelectedDifficultyLevel,
  } = useGame();
  const { currentUser } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.username || 'PlayerOne');
  const [timePerQ, setTimePerQ] = useState(15);
  const [targetPlayers, setTargetPlayers] = useState<2 | 3 | 4>(2);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (currentUser?.username) setDisplayName(currentUser.username);
  }, [currentUser]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createRoom(displayName, selectedTopicId, selectedDifficultyLevel, timePerQ, targetPlayers);
    } finally {
      setIsCreating(false);
    }
  };

  const currentCategoryTopics = TOPICS.filter((t) => t.categoryId === selectedCategoryId);

  const selectClass = "w-full px-5 py-3 rounded-full border-[4px] border-[#000000] dark:border-[#FEFEFD] bg-[#FFFDF4] dark:bg-[#100F0F] font-nunito font-extrabold text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px] focus:outline-none appearance-none cursor-pointer";
  const inputClass = "w-full px-5 py-3 rounded-full border-[4px] border-[#000000] dark:border-[#FEFEFD] bg-[#FFFDF4] dark:bg-[#100F0F] font-nunito font-extrabold text-[16px] text-[#000000] dark:text-[#FEFEFD] placeholder-[#CECCC5] tracking-[0.48px] focus:outline-none";
  const labelClass = "font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize block mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}
    >
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#FFFDF4] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] shadow-2xl">
        {/* Header Band */}
        <div className="bg-[#EBDAC3] border-b border-[#CECCC5] px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="font-nunito font-black text-[20px] text-[#000000] leading-[1.4] tracking-[0.6px]">
              Create a Room
            </h2>
            <p className="font-nunito font-extrabold text-[12.8px] text-[#595955] tracking-[0.38px] capitalize mt-1">
              Set up your arena and invite 1–3 rivals.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="w-8 h-8 flex items-center justify-center bg-[#E5E3DB] border border-[#CECCC5] hover:bg-[#CECCC5] transition-colors"
          >
            <X className="w-4 h-4 text-[#000000]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Display Name */}
          <div>
            <label className={labelClass}>Host Display Name</label>
            <input
              type="text"
              required
              maxLength={20}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your arena name…"
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                const newCat = e.target.value as any;
                setSelectedCategoryId(newCat);
                const firstInCat = TOPICS.find((t) => t.categoryId === newCat);
                if (firstInCat) setSelectedTopicId(firstInCat.id);
              }}
              className={selectClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className={labelClass}>Topic / Franchise</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className={selectClass}
            >
              {currentCategoryTopics.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.questionCount} Questions)</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className={labelClass}>
              Difficulty Level{' '}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#EBDAC3] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize ml-1">
                Level {selectedDifficultyLevel.toString().padStart(2, '0')}
              </span>
            </label>
            <select
              value={selectedDifficultyLevel}
              onChange={(e) => setSelectedDifficultyLevel(Number(e.target.value))}
              className={selectClass}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <option key={lvl} value={lvl}>Level {lvl.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          {/* Players */}
          <div>
            <label className={labelClass}>Number of Players</label>
            <div className="grid grid-cols-3 gap-0 border border-[#CECCC5] dark:border-[#363535]">
              {([2, 3, 4] as const).map((num) => {
                const isSelected = targetPlayers === num;
                const questionCount = num === 2 ? 10 : num === 3 ? 12 : 15;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTargetPlayers(num)}
                    className={`flex flex-col items-center py-3 px-2 border-r last:border-r-0 border-[#CECCC5] dark:border-[#363535] text-center transition-colors ${
                      isSelected
                        ? 'bg-[#EBDAC3]'
                        : 'bg-[#FFFDF4] dark:bg-[#100F0F] hover:bg-[#E5E3DB] dark:hover:bg-[#1E1D1D]'
                    }`}
                  >
                    <Users className="w-4 h-4 text-[#000000] dark:text-[#FEFEFD] mb-1" />
                    <span className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px]">
                      {num}p
                    </span>
                    <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                      {questionCount} Q's
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info strip */}
          <div className="flex items-center gap-2 p-3 bg-[#F7F5ED] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535]">
            <Clock className="w-4 h-4 text-[#23616A] shrink-0" />
            <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
              15 seconds per question · Match length auto-scales to player count
            </span>
          </div>

          <Button type="submit" variant="arena" size="lg" className="w-full" disabled={isCreating} isLoading={isCreating}>
            {isCreating ? 'Initializing Arena…' : 'Create Arena & Enter Lobby'}
          </Button>
        </form>
      </div>
    </div>
  );
}
