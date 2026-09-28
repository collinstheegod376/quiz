'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';
import {
  Search,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { SafeImage } from '../ui/SafeImage';

export function TopicScreen() {
  const {
    selectedCategoryId,
    setSelectedTopicId,
    setCurrentView,
  } = useGame();

  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCategoryId) || CATEGORIES[0];
  }, [selectedCategoryId]);

  const filteredTopics = useMemo(() => {
    return TOPICS.filter((topic) => {
      const matchesCategory = topic.categoryId === selectedCategoryId;
      const matchesSearch =
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryId, searchQuery]);

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentView('difficulty');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Back & Header */}
      <div className="space-y-4">
        <button
          onClick={() => setCurrentView('categories')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              {currentCategory.tagline}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white">
              {currentCategory.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select a specific franchise or scientific discipline to test your knowledge.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentCategory.name.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => handleSelectTopic(topic.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelectTopic(topic.id);
              }}
              className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <SafeImage
                  src={topic.imageUrl}
                  alt={topic.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Popularity Rank */}
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Rank #{topic.popularityRank}
                </div>

                {/* Topic Name Overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-xl font-black font-display text-white tracking-wide drop-shadow-md">
                    {topic.name}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    10 Levels
                  </div>
                  <div className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {topic.questionCount} Questions
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No topics found"
          description={`No franchises or topics matched your search "${searchQuery}". Try a different keyword.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      )}
    </div>
  );
}
