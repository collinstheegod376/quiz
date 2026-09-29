'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';
import { Search, ArrowLeft } from 'lucide-react';
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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Back nav */}
      <button
        onClick={() => setCurrentView('categories')}
        className="inline-flex items-center gap-2 font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] hover:text-[#000000] dark:hover:text-[#FEFEFD] tracking-[0.42px] capitalize transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Categories
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#CECCC5] dark:border-[#363535] pb-6">
        <div>
          <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize block mb-1">
            {currentCategory.tagline}
          </span>
          <h1 className="font-nunito font-black text-[30px] sm:text-[20px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
            {currentCategory.name}
          </h1>
          <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize mt-1">
            Select a topic to choose your difficulty and start the match.
          </p>
        </div>

        {/* Search — pill shaped 4px border input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595955] dark:text-[#A4A3A3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${currentCategory.name.toLowerCase()}...`}
            className="w-full pl-11 pr-5 py-3 rounded-full border-[4px] border-[#000000] dark:border-[#FEFEFD] bg-[#FFFDF4] dark:bg-[#100F0F] font-nunito font-extrabold text-[16px] text-[#000000] dark:text-[#FEFEFD] placeholder-[#CECCC5] tracking-[0.48px] focus:outline-none"
          />
        </div>
      </div>

      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border border-[#CECCC5] dark:border-[#363535]">
          {filteredTopics.map((topic, idx) => {
            const col = 4; // xl grid
            const isLastRow = idx >= filteredTopics.length - (filteredTopics.length % col || col);
            return (
              <div
                key={topic.id}
                onClick={() => handleSelectTopic(topic.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelectTopic(topic.id);
                }}
                className="group cursor-pointer bg-[#FFFDF4] dark:bg-[#100F0F] hover:bg-[#E5E3DB] dark:hover:bg-[#1E1D1D] border-b border-r border-[#CECCC5] dark:border-[#363535] transition-colors flex flex-col"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-[#E5E3DB] dark:bg-[#1E1D1D]">
                  <SafeImage
                    src={topic.imageUrl}
                    alt={topic.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {/* Rank badge */}
                  <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#E5E3DB] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
                    #{topic.popularityRank}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2 border-t border-[#CECCC5] dark:border-[#363535]">
                  <div>
                    <h3 className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px] leading-none">
                      {topic.name}
                    </h3>
                    <p className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize line-clamp-2 mt-1">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#CECCC5] dark:border-[#363535]">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                      10 Levels
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                      {topic.questionCount} Q&apos;s
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No topics found"
          description={`No topics matched "${searchQuery}". Try a different keyword.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      )}
    </div>
  );
}
