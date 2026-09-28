'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { CATEGORIES } from '@/data/categories';
import { CategoryId } from '@/types/quiz';
import { Compass, ArrowRight, Layers, Flame } from 'lucide-react';

export function CategoryScreen() {
  const { setSelectedCategoryId, setCurrentView } = useGame();

  const handleSelectCategory = (id: CategoryId) => {
    setSelectedCategoryId(id);
    setCurrentView('topics');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 tracking-wider uppercase mb-1">
            <Compass className="w-4 h-4" />
            Category Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white">
            Choose a Category
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Select a universe to explore topics, franchises, and challenging quiz tiers.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 w-fit">
          5 Curated Domains • 40+ Topics
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => (
          <div
            key={category.id}
            onClick={() => handleSelectCategory(category.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleSelectCategory(category.id);
            }}
            className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
          >
            {/* Image Banner */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.bannerImage}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Tag / Topic count */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
                <Layers className="w-3.5 h-3.5 text-red-500" />
                {category.topicCount}+ Topics Available
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 drop-shadow">
                  {category.tagline}
                </span>
                <h2 className="text-2xl font-black font-display text-white tracking-wide">
                  {category.name}
                </h2>
              </div>
            </div>

            {/* Description & Action */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {category.description}
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400 group-hover:text-red-500">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Explore Franchises
                </span>
                <div className="w-8 h-8 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
