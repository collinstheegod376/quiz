'use client';

import React, { useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { MobileJoinBar } from '../layout/MobileJoinBar';
import { QuizButton } from '../ui/QuizButton';
import { QuizCarousel, QuizCardData } from '../ui/QuizCarousel';
import { Vote, Sparkles, BookOpen } from 'lucide-react';

import { TOPICS } from '@/data/topics';

export function LandingScreen() {
  const {
    setCurrentView,
    setIsCreateModalOpen,
    setSelectedCategoryId,
    createRoom,
  } = useGame();
  const { currentUser, setIsAuthModalOpen } = useAuth();

  // Dynamically derive Recently Published directly from all topics (newest additions first)
  const recentlyPublishedQuizzes: QuizCardData[] = useMemo(() => {
    return [...TOPICS]
      .reverse()
      .map((topic) => ({
        id: `${topic.id}-recent`,
        topicId: topic.id,
        title: topic.name,
        imageUrl: topic.imageUrl,
        rating: 4.9,
        author: topic.categoryId === 'anime' ? 'OtakuVerse' : topic.categoryId === 'games' ? 'GamerZone' : 'CineVerse',
        difficulty: (topic.questionCount >= 150 ? 'HARD' : 'MEDIUM') as 'HARD' | 'MEDIUM' | 'EASY',
        questionCount: topic.questionCount,
      }));
  }, []);

  const aiQuizzes: QuizCardData[] = useMemo(() => [
    {
      id: 'jujutsu-kaisen-ai',
      topicId: 'jujutsu-kaisen',
      title: 'Jujutsu Kaisen',
      imageUrl: '/images/topics/jujutsu-kaisen.jpg',
      rating: 4.9,
      author: 'AI Generator',
      difficulty: 'AI',
      questionCount: 150,
    },
    {
      id: 'attack-on-titan-ai',
      topicId: 'attack-on-titan',
      title: 'Attack on Titan',
      imageUrl: '/images/topics/attack-on-titan.jpg',
      rating: 4.8,
      author: 'AI Generator',
      difficulty: 'AI',
      questionCount: 150,
    },
    {
      id: 'bleach-tybw-ai',
      topicId: 'bleach',
      title: 'Bleach',
      imageUrl: '/images/topics/bleach.jpg',
      rating: 4.8,
      author: 'AI Generator',
      difficulty: 'AI',
      questionCount: 150,
    },
    {
      id: 'demon-slayer-ai',
      topicId: 'demon-slayer',
      title: 'Demon Slayer',
      imageUrl: '/images/topics/demon-slayer.jpg',
      rating: 4.9,
      author: 'AI Generator',
      difficulty: 'AI',
      questionCount: 150,
    },
    {
      id: 'got-westeros-ai',
      topicId: 'game-of-thrones',
      title: 'Game of Thrones',
      imageUrl: '/images/topics/game-of-thrones.jpg',
      rating: 4.8,
      author: 'AI Generator',
      difficulty: 'AI',
      questionCount: 150,
    },
  ], []);

  const bestRatedQuizzes: QuizCardData[] = useMemo(() => [
    {
      id: 'one-piece-best',
      topicId: 'one-piece',
      title: 'One Piece',
      imageUrl: '/images/topics/one-piece.jpg',
      rating: 5.0,
      author: 'mora_queen',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'naruto-shippuden-best',
      topicId: 'naruto',
      title: 'Naruto',
      imageUrl: '/images/topics/naruto.jpg',
      rating: 4.9,
      author: 'CandyQueen',
      difficulty: 'MEDIUM',
      questionCount: 110,
    },
    {
      id: 'dbz-best',
      topicId: 'dragon-ball',
      title: 'Dragon Ball Z',
      imageUrl: '/images/topics/dragon-ball.jpg',
      rating: 4.9,
      author: 'GokuSaiyan',
      difficulty: 'MEDIUM',
      questionCount: 150,
    },
    {
      id: 'hxh-best',
      topicId: 'hunter-x-hunter',
      title: 'Hunter x Hunter',
      imageUrl: '/images/topics/hunter-x-hunter.jpg',
      rating: 4.9,
      author: 'Kurapika99',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'fma-best',
      topicId: 'fullmetal-alchemist',
      title: 'Fullmetal Alchemist',
      imageUrl: '/images/topics/fullmetal.jpg',
      rating: 4.9,
      author: 'StateAlchemist',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'the-boys-best',
      topicId: 'the-boys',
      title: 'The Boys',
      imageUrl: '/images/topics/the-boys.jpg',
      rating: 4.8,
      author: 'BillyButcher',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'stranger-things-best',
      topicId: 'stranger-things',
      title: 'Stranger Things',
      imageUrl: '/images/topics/stranger-things.jpg',
      rating: 4.9,
      author: 'HawkinsLab',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'breaking-bad-best',
      topicId: 'breaking-bad',
      title: 'Breaking Bad',
      imageUrl: '/images/topics/breaking-bad.jpg',
      rating: 4.9,
      author: 'WalterWhite',
      difficulty: 'HARD',
      questionCount: 150,
    },
  ], []);

  const popularQuizzes: QuizCardData[] = useMemo(() => [
    {
      id: 'gojo-popular',
      topicId: 'gojo-vs-sukuna',
      title: 'Gojo vs. Sukuna',
      imageUrl: '/images/topics/gojo-vs-sukuna.jpg',
      rating: 5.0,
      author: 'ImLucifer',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'dbz-popular',
      topicId: 'dragon-ball',
      title: 'Dragon Ball Z',
      imageUrl: '/images/topics/dragon-ball.jpg',
      rating: 4.8,
      author: 'GokuSaiyan',
      difficulty: 'EASY',
      questionCount: 120,
    },
    {
      id: 'breaking-bad-popular',
      topicId: 'breaking-bad',
      title: 'Breaking Bad',
      imageUrl: '/images/topics/breaking-bad.jpg',
      rating: 4.9,
      author: 'brittanyk',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'the-boys-popular',
      topicId: 'the-boys',
      title: 'The Boys',
      imageUrl: '/images/topics/the-boys.jpg',
      rating: 4.8,
      author: 'Christy',
      difficulty: 'HARD',
      questionCount: 150,
    },
  ], []);

  const animeCategoryQuizzes: QuizCardData[] = useMemo(() => {
    return TOPICS.filter((t) => t.categoryId === 'anime').map((topic) => ({
      id: `anime-${topic.id}`,
      topicId: topic.id,
      title: topic.name,
      imageUrl: topic.imageUrl,
      rating: 4.9,
      author: 'AniZuki',
      difficulty: (topic.questionCount >= 150 ? 'HARD' : 'MEDIUM') as 'HARD' | 'MEDIUM' | 'EASY',
      questionCount: topic.questionCount,
    }));
  }, []);

  const handleVoteMode = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    createRoom(currentUser.username, 'one-piece', 5, 15, 4);
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF4] dark:bg-[#100F0F] text-black dark:text-[#FEFEFD] pb-8 font-sans transition-colors duration-200">
      {/* ── Mobile Join PIN Band (below navbar on mobile) ── */}
      <MobileJoinBar />

      {/* ── Main Content ── */}
      <div className="max-w-[1248px] mx-auto px-4 md:px-6 pt-3 md:pt-6 space-y-6">

        {/* ── Page Hero Headline (Semantic H1 for SEO & Discoverability) ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 pt-1">
          <div>
            <h1 className="font-nunito font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
              Anizuki Anime Quiz Arena
            </h1>
            <p className="font-roboto text-xs sm:text-sm font-bold text-black/60 dark:text-white/60">
              Real-time multiplayer trivia battles, community lobbies, and 10-tier franchise lore
            </p>
          </div>
        </div>

        {/* ── Dual Hero Promo Banners ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Create a quiz */}
          <div className="bg-[#19444A] rounded-xl p-5 md:p-8 flex flex-row items-center justify-between gap-4 text-white relative overflow-hidden shadow-sm">
            <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-2 z-1 w-full md:w-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                Create a quiz
              </h2>
              <p className="font-roboto text-xs sm:text-sm font-bold opacity-90 leading-tight">
                Host live arenas with up to 4 combatants
              </p>
              <div className="pt-2">
                <QuizButton
                  color="green"
                  size="md"
                  onClick={() => {
                    if (!currentUser) {
                      setIsAuthModalOpen(true);
                    } else {
                      setIsCreateModalOpen(true);
                    }
                  }}
                >
                  Quiz editor
                </QuizButton>
              </div>
            </div>
            {/* Visual Icon Art */}
            <div className="hidden lg:flex w-28 h-28 shrink-0 items-center justify-center opacity-85">
              <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20">
                <BookOpen className="w-12 h-12 text-[#00A76D]" />
              </div>
            </div>
          </div>

          {/* Card 2: Categories (View Category) */}
          <div className="bg-[#19444A] rounded-xl p-5 md:p-8 flex flex-row items-center justify-between gap-4 text-white relative overflow-hidden shadow-sm">
            <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-2 z-1 w-full md:w-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                Categories
              </h2>
              <p className="font-roboto text-xs sm:text-sm font-bold opacity-90 leading-tight">
                Explore anime, series, movies, and more
              </p>
              <div className="pt-2">
                <QuizButton
                  color="cyan"
                  size="md"
                  onClick={() => setCurrentView('categories')}
                >
                  View category
                </QuizButton>
              </div>
            </div>
            {/* Visual Icon Art */}
            <div className="hidden lg:flex w-28 h-28 shrink-0 items-center justify-center opacity-85">
              <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20">
                <Sparkles className="w-12 h-12 text-[#6FEEFF]" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Carousel 1: Recently published ── */}
        <QuizCarousel
          title="Recently published"
          quizzes={recentlyPublishedQuizzes}
        />

        {/* ── Carousel 2: Popular quizzes created by AI ── */}
        <QuizCarousel
          title="Popular quizzes created by AI"
          quizzes={aiQuizzes}
        />

        {/* ── Vote Mode Banner ── */}
        <div className="w-full bg-[#19444A] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-sm">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-white/10 hidden sm:flex items-center justify-center">
              <Vote className="w-5 h-5 text-[#FFC679]" />
            </div>
            <div>
              <h3 className="font-nunito font-black text-base sm:text-lg">
                Can&apos;t decide? Let players vote
              </h3>
              <p className="font-roboto text-xs opacity-80">
                Host a multiplayer match where participants vote on rounds and questions
              </p>
            </div>
          </div>
          <QuizButton
            color="yellow"
            size="sm"
            onClick={handleVoteMode}
          >
            Start vote mode
          </QuizButton>
        </div>

        {/* ── Carousel 3: Best rating right now ── */}
        <QuizCarousel
          title="Best rating right now"
          quizzes={bestRatedQuizzes}
        />

        {/* ── Carousel 4: Popular right now ── */}
        <QuizCarousel
          title="Popular right now"
          quizzes={popularQuizzes}
        />

        {/* ── Carousel 5: Anime Category Section ── */}
        <QuizCarousel
          title="Anime"
          seeAllCount={TOPICS.filter((t) => t.categoryId === 'anime').length}
          onSeeAll={() => {
            setSelectedCategoryId('anime');
            setCurrentView('topics');
          }}
          quizzes={animeCategoryQuizzes}
        />

        {/* ── Meet the Creator & SEO Section ── */}
        <footer className="mt-12 pt-8 pb-4 border-t border-[#CECCC5] dark:border-[#363535] text-center space-y-4">
          <div className="max-w-2xl mx-auto space-y-2">
            <h4 className="font-nunito font-black text-lg text-black dark:text-white">
              Anizuki — The Human Robo Anime Arena
            </h4>
            <p className="font-roboto text-xs text-[#595955] dark:text-[#A4A3A3] leading-relaxed">
              Designed and engineered from scratch by{' '}
              <a
                href="https://www.promisedkillua.sbs/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-black dark:text-white underline hover:text-[#00A76D] transition-colors"
              >
                Promised Killua
              </a>{' '}
              (nerfed_killua). Built with Next.js, React, TypeScript, and Supabase for lightning-fast real-time multiplayer trivia.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-nunito font-bold">
            <a
              href="https://www.promisedkillua.sbs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black dark:bg-[#1E1D1D] text-white dark:border dark:border-[#363535] hover:bg-black/80 transition-colors shadow-sm"
            >
              <span>Explore Promised Killua&apos;s Portfolio</span>
              <span className="text-[#6FEEFF]">↗</span>
            </a>
          </div>
          <p className="text-[11px] text-[#595955] dark:text-[#A4A3A3] font-roboto pt-2">
            © {new Date().getFullYear()} Anizuki. All rights reserved. Built by Promised Killua.
          </p>
        </footer>
      </div>
    </div>
  );
}
