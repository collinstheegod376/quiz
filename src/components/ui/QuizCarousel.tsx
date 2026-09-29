'use client';

import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Star, Play } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';

export interface QuizCardData {
  id: string;
  topicId: string;
  title: string;
  imageUrl: string;
  rating: number;
  author: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'AI';
  questionCount?: number;
}

interface QuizCarouselProps {
  title: string;
  seeAllCount?: number;
  onSeeAll?: () => void;
  quizzes: QuizCardData[];
}

export function QuizCarousel({
  title,
  seeAllCount,
  onSeeAll,
  quizzes,
}: QuizCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setSelectedTopicId, setCurrentView } = useGame();
  const { currentUser, setIsAuthModalOpen } = useAuth();

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleCardClick = (quiz: QuizCardData) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedTopicId(quiz.topicId);
    setCurrentView('difficulty');
  };

  return (
    <section className="w-full space-y-2 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-nunito font-black text-lg sm:text-xl text-black dark:text-white tracking-tight">
          {title}
        </h2>
        {seeAllCount !== undefined && (
          <button
            type="button"
            onClick={onSeeAll}
            className="font-roboto font-bold text-xs sm:text-sm text-[#00AFC6] hover:underline cursor-pointer"
          >
            See all ({seeAllCount})
          </button>
        )}
      </div>

      {/* Carousel Track with Left/Right Buttons */}
      <div className="relative group">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="hidden group-hover:flex absolute left-0 top-1/3 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white items-center justify-center shadow-lg transition-opacity cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex flex-row items-start gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory px-1 py-1"
        >
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              onClick={() => handleCardClick(quiz)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(quiz);
              }}
              className="flex flex-col shrink-0 w-[140px] sm:w-[160px] md:w-[180px] snap-start group/card cursor-pointer focus:outline-none select-none"
            >
              {/* Thumbnail 4:3 */}
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-black/10 shadow-sm border border-black/5 dark:border-white/10">
                <SafeImage
                  src={quiz.imageUrl}
                  alt={quiz.title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                />

                {/* Difficulty / AI Badge */}
                {quiz.difficulty && (
                  <span
                    className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      quiz.difficulty === 'AI'
                        ? 'bg-[#6FEEFF] text-black'
                        : quiz.difficulty === 'HARD'
                        ? 'bg-[#FF94AB] text-black'
                        : quiz.difficulty === 'EASY'
                        ? 'bg-[#4CA471] text-white'
                        : 'bg-[#B9843E] text-white'
                    }`}
                  >
                    {quiz.difficulty}
                  </span>
                )}

                {/* Play Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-md transform scale-90 group-hover/card:scale-100 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="pt-1.5 space-y-0.5">
                <h3 className="font-nunito font-extrabold text-xs sm:text-sm text-black dark:text-white leading-snug line-clamp-2 group-hover/card:underline">
                  {quiz.title}
                </h3>
                <div className="flex items-center gap-2 font-roboto text-[11px] sm:text-xs">
                  <div className="flex items-center gap-0.5 font-bold text-[#B9843E]">
                    <span>{quiz.rating.toFixed(1)}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-black/50 dark:text-white/50 truncate">
                    {quiz.author}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/3 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-lg transition-opacity cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
