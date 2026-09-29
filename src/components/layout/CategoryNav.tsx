'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';

export interface CategoryNavItem {
  slug: string;
  name: string;
  href: string;
  iconSvg: React.ReactNode;
}

export const CATEGORY_NAV_ITEMS: CategoryNavItem[] = [
  {
    slug: '',
    name: 'Start',
    href: '/',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
  },
  {
    slug: 'art-and-literature',
    name: 'Art & Literature',
    href: '/art-and-literature',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
  {
    slug: 'entertainment',
    name: 'Entertainment',
    href: '/entertainment',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    slug: 'geography',
    name: 'Geography',
    href: '/geography',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    slug: 'history',
    name: 'History',
    href: '/history',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 7H3l9-7z" />
      </svg>
    ),
  },
  {
    slug: 'languages',
    name: 'Languages',
    href: '/languages',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    slug: 'science-and-nature',
    name: 'Science & Nature',
    href: '/science-and-nature',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.31L4.17 19.5a2 2 0 0 0 1.73 3h12.2a2 2 0 0 0 1.73-3L14 9.31V2" />
        <line x1="8.5" y1="2" x2="15.5" y2="2" />
        <line x1="7.5" y1="15" x2="16.5" y2="15" />
      </svg>
    ),
  },
  {
    slug: 'sports',
    name: 'Sports',
    href: '/sports',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" />
      </svg>
    ),
  },
  {
    slug: 'trivia',
    name: 'Trivia',
    href: '/trivia',
    iconSvg: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="3" />
        <path d="M12 7a5 5 0 0 1 5 5c0 2-1 3.5-2 4.5v1.5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.5C8 15.5 7 14 7 12a5 5 0 0 1 5-5z" />
        <line x1="9.5" y1="21" x2="14.5" y2="21" />
      </svg>
    ),
  },
];

interface CategoryNavProps {
  activeSlug?: string;
  className?: string;
}

export function CategoryNav({ activeSlug, className = '' }: CategoryNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setCurrentView } = useGame();

  const currentSlug =
    activeSlug !== undefined
      ? activeSlug
      : pathname === '/'
      ? ''
      : pathname?.replace(/^\//, '').replace(/\/$/, '') || '';

  const handleClick = (e: React.MouseEvent, item: CategoryNavItem) => {
    e.preventDefault();
    if (item.slug === '') {
      setCurrentView('landing');
      router.push('/');
    } else if (item.slug === 'entertainment') {
      router.push('/entertainment');
    } else {
      router.push(`/${item.slug}`);
    }
  };

  return (
    <div className={`w-full overflow-x-auto scrollbar-none py-2 ${className}`}>
      <div className="flex flex-row items-center justify-between min-w-max md:min-w-0 md:w-full space-x-2 md:space-x-1 lg:space-x-3 px-2 md:px-0">
        {CATEGORY_NAV_ITEMS.map((item) => {
          const isActive = currentSlug === item.slug;
          return (
            <a
              key={item.slug || 'start'}
              href={item.href}
              onClick={(e) => handleClick(e, item)}
              className="whitespace-nowrap group font-roboto flex flex-col items-center flex-1 min-w-[70px] cursor-pointer py-1 select-none"
            >
              {/* Category Icon */}
              <div
                className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                  isActive
                    ? 'text-black dark:text-white opacity-100'
                    : 'text-black dark:text-white opacity-60 group-hover:opacity-100'
                }`}
              >
                {item.iconSvg}
              </div>

              {/* Label */}
              <div
                className={`pb-1 text-xs md:text-xs font-bold leading-snug tracking-[0.02em] transition-opacity duration-200 mt-1 text-center ${
                  isActive
                    ? 'text-black dark:text-white opacity-100'
                    : 'text-black dark:text-white opacity-60 group-hover:opacity-100'
                }`}
              >
                {item.name}
              </div>

              {/* Underline indicator: Solid pill just like quiz.com */}
              <div
                className={`w-full h-1 rounded-full transition-opacity duration-200 ${
                  isActive
                    ? 'bg-black dark:bg-white opacity-100'
                    : 'bg-black dark:bg-white opacity-0 group-hover:opacity-100'
                }`}
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}
