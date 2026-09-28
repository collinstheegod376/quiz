'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';
import {
  X,
  Zap,
  Users,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
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

  const [displayName, setDisplayName] = useState('PlayerOne');
  const [timePerQ, setTimePerQ] = useState(20);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom(displayName, selectedTopicId, selectedDifficultyLevel, timePerQ);
  };

  const currentTopic = TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];
  const currentCategoryTopics = TOPICS.filter((t) => t.categoryId === selectedCategoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setIsCreateModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Arena Host Setup
          </div>
          <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">
            Create a Room
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set up your real-time arena and invite 1–3 rivals to test their knowledge.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Host Display Name
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your arena name..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                const newCat = e.target.value as any;
                setSelectedCategoryId(newCat);
                const firstInCat = TOPICS.find((t) => t.categoryId === newCat);
                if (firstInCat) setSelectedTopicId(firstInCat.id);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Topic / Franchise
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {currentCategoryTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.questionCount} Questions)
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Difficulty Tier</span>
              <span className="text-red-600 dark:text-red-400">
                Level {selectedDifficultyLevel.toString().padStart(2, '0')}
              </span>
            </div>
            <select
              value={selectedDifficultyLevel}
              onChange={(e) => setSelectedDifficultyLevel(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count rule note */}
          <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-red-500" />
                Number of Questions
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold">
                Auto-calculated
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 dark:text-slate-400">
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                <span className="font-bold text-slate-900 dark:text-white block">2 Players</span>
                10 Questions
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                <span className="font-bold text-slate-900 dark:text-white block">3 Players</span>
                12 Questions
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                <span className="font-bold text-slate-900 dark:text-white block">4 Players</span>
                15 Questions
              </div>
            </div>
          </div>

          {/* Room Capacity constraints */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Min: 2 • Max: 4</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>20s Timer per Question</span>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" variant="arena" size="lg" className="w-full shadow-xl">
            <Zap className="w-4 h-4 fill-current" />
            Create Arena & Enter Lobby
          </Button>
        </form>
      </div>
    </div>
  );
}
