'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';
import { X, Lock, ShieldCheck } from 'lucide-react';
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
  const { currentUser, openAuthModal } = useAuth();

  const [timePerQ, setTimePerQ] = useState(15);
  const [targetPlayers, setTargetPlayers] = useState<2 | 3 | 4>(2);
  const [isCreating, setIsCreating] = useState(false);

  if (!isCreateModalOpen) return null;

  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm animate-fadeIn"
        onClick={(e) => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}
      >
        <div className="relative w-full max-w-md bg-[#FFFDF4] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-nunito font-black text-xl text-black dark:text-white">
            Combatant Profile Required
          </h2>
          <p className="font-roboto text-xs text-[#595955] dark:text-[#A4A3A3] leading-relaxed">
            Guest mode has been disabled. You must log in or create an account to host real-time multiplayer arenas and save match XP.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="arena"
              size="md"
              onClick={() => {
                setIsCreateModalOpen(false);
                openAuthModal('login');
              }}
            >
              Sign In / Register
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
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
    if (!selectedTopicId) return;
    setIsCreating(true);
    try {
      await createRoom(currentUser.username, selectedTopicId, selectedDifficultyLevel, timePerQ, targetPlayers);
      setIsCreateModalOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const currentCategoryTopics = TOPICS.filter((t) => t.categoryId === selectedCategoryId);

  const selectClass = "w-full px-5 py-3 rounded-full border-[4px] border-[#000000] dark:border-[#FEFEFD] bg-[#FFFDF4] dark:bg-[#100F0F] font-nunito font-extrabold text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px] focus:outline-none appearance-none cursor-pointer";
  const labelClass = "font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize block mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}
    >
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#FFFDF4] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] shadow-2xl">
        {/* Header Band */}
        <div className="bg-[#EBDAC3] dark:bg-[#2A2929] border-b border-[#CECCC5] dark:border-[#363535] px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
              Create an Arena Room
            </h2>
            <p className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize mt-1">
              Host a live match for 1–3 rivals.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="w-8 h-8 flex items-center justify-center bg-[#E5E3DB] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] hover:bg-[#CECCC5] dark:hover:bg-[#363535] text-[#000000] dark:text-[#FEFEFD] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Verified Host Badge */}
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
                  Host Profile
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

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                const newCat = e.target.value as any;
                setSelectedCategoryId(newCat);
                const firstInCat = TOPICS.find((t) => t.categoryId === newCat);
                if (firstInCat) {
                  setSelectedTopicId(firstInCat.id);
                } else {
                  setSelectedTopicId('');
                }
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
              disabled={currentCategoryTopics.length === 0}
            >
              {currentCategoryTopics.length > 0 ? (
                currentCategoryTopics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.questionCount} Questions)</option>
                ))
              ) : (
                <option value="" disabled>No topics in this category yet</option>
              )}
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

          {/* Target Players */}
          <div>
            <label className={labelClass}>Maximum Combatants</label>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetPlayers(num)}
                  className={`py-3 rounded-full border-[3px] border-[#000000] dark:border-[#FEFEFD] font-nunito font-black text-[16px] transition-colors ${
                    targetPlayers === num
                      ? 'bg-[#EBDAC3] dark:bg-[#B9843E] text-[#000000] dark:text-[#FEFEFD]'
                      : 'bg-[#FFFDF4] dark:bg-[#100F0F] text-[#595955] dark:text-[#A4A3A3] hover:bg-[#E5E3DB] dark:hover:bg-[#1E1D1D]'
                  }`}
                >
                  {num} Players
                </button>
              ))}
            </div>
          </div>

          {/* Time per Question */}
          <div>
            <label className={labelClass}>Time Per Question: {timePerQ}s</label>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
              value={timePerQ}
              onChange={(e) => setTimePerQ(Number(e.target.value))}
              className="w-full accent-black dark:accent-white cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[#595955] dark:text-[#A4A3A3] font-nunito font-extrabold mt-1">
              <span>10s (Fast)</span>
              <span>15s (Standard)</span>
              <span>20s</span>
              <span>30s (Casual)</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="arena"
            size="lg"
            className="w-full mt-4"
            disabled={isCreating}
            isLoading={isCreating}
          >
            Launch Room
          </Button>
        </form>
      </div>
    </div>
  );
}
