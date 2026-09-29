'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { CategoryId } from '@/types/quiz';

export interface CategoryNavItem {
  id: string;
  name: string;
  categoryId?: CategoryId;
  iconSvg: React.ReactNode;
}

export const CATEGORY_NAV_ITEMS: CategoryNavItem[] = [
  {
    id: 'start',
    name: 'Start',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" fillOpacity="0.25" />
      </svg>
    ),
  },
  {
    id: 'anime',
    name: 'Anime',
    categoryId: 'anime',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
        <path d="M13 19l6-6" />
        <path d="M16 16l4 4" />
        <path d="M19 21l2-2" />
      </svg>
    ),
  },
  {
    id: 'series',
    name: 'Series',
    categoryId: 'series',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
        <polyline points="17 2 12 7 7 2" />
      </svg>
    ),
  },
  {
    id: 'movies',
    name: 'Movies',
    categoryId: 'movies',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    ),
  },
  {
    id: 'games',
    name: 'Games',
    categoryId: 'games',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <rect x="2" y="6" width="20" height="12" rx="2" />
      </svg>
    ),
  },
  {
    id: 'science',
    name: 'Science',
    categoryId: 'chemistry',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.31L4.17 19.5a2 2 0 0 0 1.73 3h12.2a2 2 0 0 0 1.73-3L14 9.31V2" />
        <line x1="8.5" y1="2" x2="15.5" y2="2" />
        <line x1="7.5" y1="15" x2="16.5" y2="15" />
      </svg>
    ),
  },
  {
    id: 'achievements',
    name: 'Achievements',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
];

interface CategoryNavProps {
  activeCategory?: string;
  onSelectCategory?: (id: string) => void;
  className?: string;
}

export function CategoryNav({
  activeCategory = 'start',
  onSelectCategory,
  className = '',
}: CategoryNavProps) {
  const { setCurrentView, setSelectedCategoryId } = useGame();

  const handleItemClick = (item: CategoryNavItem) => {
    if (onSelectCategory) {
      onSelectCategory(item.id);
    }

    if (item.id === 'start') {
      setCurrentView('landing');
    } else if (item.id === 'achievements') {
      setCurrentView('achievements');
    } else if (item.categoryId) {
      setSelectedCategoryId(item.categoryId);
      setCurrentView('topics');
    }
  };

  return (
    <div className={`w-full overflow-x-auto scrollbar-none py-2 ${className}`}>
      <div className="flex flex-row items-center justify-center max-w-[800px] mx-auto gap-4 sm:gap-8 md:gap-12 px-2">
        {CATEGORY_NAV_ITEMS.map((item) => {
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className="whitespace-nowrap group font-roboto flex flex-col items-center cursor-pointer py-1 select-none focus:outline-none min-w-[56px] sm:min-w-[68px]"
            >
              {/* Category Icon */}
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                  isActive
                    ? 'text-black dark:text-white opacity-100'
                    : 'text-black dark:text-white opacity-55 group-hover:opacity-100'
                }`}
              >
                {item.iconSvg}
              </div>

              {/* Label */}
              <div
                className={`pb-1 text-xs sm:text-xs font-bold leading-snug tracking-[0.02em] transition-opacity duration-200 mt-1 text-center ${
                  isActive
                    ? 'text-black dark:text-white opacity-100'
                    : 'text-black dark:text-white opacity-55 group-hover:opacity-100'
                }`}
              >
                {item.name}
              </div>

              {/* Underline indicator: Solid pill just like quiz.com */}
              <div
                className={`w-full h-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-black dark:bg-white opacity-100'
                    : 'bg-black dark:bg-white opacity-0 group-hover:opacity-60'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
