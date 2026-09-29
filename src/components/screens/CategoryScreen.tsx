'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { CATEGORIES } from '@/data/categories';
import { CategoryId } from '@/types/quiz';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from '../ui/SafeImage';

export function CategoryScreen() {
  const { setSelectedCategoryId, setCurrentView } = useGame();

  const handleSelectCategory = (id: CategoryId) => {
    setSelectedCategoryId(id);
    setCurrentView('topics');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#CECCC5] dark:border-[#363535] pb-6">
        <div>
          <h1 className="font-nunito font-black text-[30px] sm:text-[20px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
            Choose a Category
          </h1>
          <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize mt-1">
            Select a universe to explore topics, franchises, and challenging quiz tiers.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize whitespace-nowrap">
          5 Categories · 40+ Topics
        </span>
      </div>

      {/* Categories Grid — sharp-edged cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-[#CECCC5] dark:border-[#363535] divide-y divide-[#CECCC5] dark:divide-[#363535] md:divide-y-0">
        {CATEGORIES.map((category, idx) => (
          <div
            key={category.id}
            onClick={() => handleSelectCategory(category.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleSelectCategory(category.id);
            }}
            className={`group relative cursor-pointer bg-[#FFFDF4] dark:bg-[#100F0F] hover:bg-[#E5E3DB] dark:hover:bg-[#1E1D1D] transition-colors flex flex-col ${
              idx !== CATEGORIES.length - 1 ? 'md:border-r border-[#CECCC5] dark:border-[#363535]' : ''
            }`}
          >
            {/* Image Banner — sharp corners */}
            <div className="relative h-44 w-full overflow-hidden bg-[#E5E3DB] dark:bg-[#1E1D1D]">
              <SafeImage
                src={category.bannerImage}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />

              {/* Category pill overlay */}
              <span className="absolute top-3 left-3 inline-flex items-center px-3 py-1 rounded-full bg-[#E5E3DB] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
                {category.topicCount}+ Topics
              </span>
            </div>

            {/* Card body */}
            <div className="p-5 flex-1 flex flex-col justify-between border-t border-[#CECCC5] dark:border-[#363535] space-y-3">
              <div>
                <span className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize block mb-1">
                  {category.tagline}
                </span>
                <h2 className="font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.6px] leading-[1.4]">
                  {category.name}
                </h2>
                <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize mt-1 line-clamp-2">
                  {category.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#CECCC5] dark:border-[#363535]">
                <span className="font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize">
                  Explore Franchises
                </span>
                <div className="w-8 h-8 flex items-center justify-center bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] group-hover:border-[#000000] dark:group-hover:border-[#FEFEFD] transition-colors">
                  <ArrowRight className="w-4 h-4 text-[#000000] dark:text-[#FEFEFD]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
