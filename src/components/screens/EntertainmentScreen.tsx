'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { MobileJoinBar } from '@/components/layout/MobileJoinBar';
import { QuizButton } from '@/components/ui/QuizButton';
import { Star, FileText, Users, Play, Sparkles, Plus, Check } from 'lucide-react';
import { SafeImage } from '../ui/SafeImage';

interface QuizItem {
  id: string;
  topicId: string;
  title: string;
  category: 'anime' | 'series' | 'movies' | 'gaming';
  tags: string[];
  questionCount: number;
  rating: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Nightmare';
  imageUrl: string;
  creator: string;
}

export function EntertainmentScreen() {
  const {
    setSelectedTopicId,
    setCurrentView,
    createRoom,
    setIsCreateModalOpen,
  } = useGame();
  const { currentUser } = useAuth();

  const [activeTag, setActiveTag] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('best');
  const [playedQuizIds, setPlayedQuizIds] = useState<Set<string>>(new Set(['one-piece']));

  // Curate comprehensive entertainment quizzes with local images and clean names
  const entertainmentQuizzes: QuizItem[] = useMemo(() => {
    return [
      {
        id: 'one-piece-grand-line',
        topicId: 'one-piece',
        title: 'One Piece',
        category: 'anime',
        tags: ['Anime', 'Shonen', 'Pirates', 'Luffy'],
        questionCount: 150,
        rating: 4.9,
        difficulty: 'Hard',
        imageUrl: '/images/topics/one-piece.jpg',
        creator: 'Eiichiro Lore',
      },
      {
        id: 'gojo-sukuna-shinjuku',
        topicId: 'gojo-vs-sukuna',
        title: 'Gojo vs. Sukuna',
        category: 'anime',
        tags: ['Anime', 'Jujutsu Kaisen', 'Gojo', 'Sukuna'],
        questionCount: 120,
        rating: 5.0,
        difficulty: 'Nightmare',
        imageUrl: '/images/topics/gojo-vs-sukuna.jpg',
        creator: 'Jujutsu High',
      },
      {
        id: 'breaking-bad-empire',
        topicId: 'breaking-bad',
        title: 'Breaking Bad',
        category: 'series',
        tags: ['TV Series', 'Drama', 'Crime', 'Heisenberg'],
        questionCount: 150,
        rating: 4.9,
        difficulty: 'Hard',
        imageUrl: '/images/topics/breaking-bad.jpg',
        creator: 'Walter White',
      },
      {
        id: 'the-boys-vought',
        topicId: 'the-boys',
        title: 'The Boys',
        category: 'series',
        tags: ['TV Series', 'Superheroes', 'Homelander', 'Action'],
        questionCount: 150,
        rating: 4.8,
        difficulty: 'Hard',
        imageUrl: '/images/topics/the-boys.jpg',
        creator: 'Billy Butcher',
      },
      {
        id: 'attack-on-titan-rumbling',
        topicId: 'attack-on-titan',
        title: 'Attack on Titan',
        category: 'anime',
        tags: ['Anime', 'Dark Fantasy', 'Eren', 'Titans'],
        questionCount: 150,
        rating: 4.8,
        difficulty: 'Hard',
        imageUrl: '/images/topics/attack-on-titan.jpg',
        creator: 'Scout Regiment',
      },
      {
        id: 'stranger-things-upside-down',
        topicId: 'stranger-things',
        title: 'Stranger Things',
        category: 'series',
        tags: ['TV Series', 'Sci-Fi', '80s', 'Hawkins'],
        questionCount: 150,
        rating: 4.7,
        difficulty: 'Medium',
        imageUrl: '/images/topics/stranger-things.jpg',
        creator: 'Hellfire Club',
      },
      {
        id: 'demon-slayer-kizuki',
        topicId: 'demon-slayer',
        title: 'Demon Slayer',
        category: 'anime',
        tags: ['Anime', 'Swords', 'Hashira', 'Tanjiro'],
        questionCount: 150,
        rating: 4.9,
        difficulty: 'Easy',
        imageUrl: '/images/topics/demon-slayer.jpg',
        creator: 'Demon Corps',
      },
      {
        id: 'game-of-thrones-westeros',
        topicId: 'game-of-thrones',
        title: 'Game of Thrones',
        category: 'series',
        tags: ['TV Series', 'Fantasy', 'Westeros', 'Dragons'],
        questionCount: 150,
        rating: 4.8,
        difficulty: 'Hard',
        imageUrl: '/images/topics/game-of-thrones.jpg',
        creator: 'Citadel Maester',
      },
      {
        id: 'bleach-tybw',
        topicId: 'bleach',
        title: 'Bleach',
        category: 'anime',
        tags: ['Anime', 'Soul Reaper', 'Ichigo', 'Bankai'],
        questionCount: 150,
        rating: 4.8,
        difficulty: 'Hard',
        imageUrl: '/images/topics/bleach.jpg',
        creator: 'Gotei 13',
      },
      {
        id: 'naruto-shippuden-lore',
        topicId: 'naruto',
        title: 'Naruto',
        category: 'anime',
        tags: ['Anime', 'Ninja', 'Naruto', 'Sasuke'],
        questionCount: 110,
        rating: 4.8,
        difficulty: 'Medium',
        imageUrl: '/images/topics/naruto.jpg',
        creator: 'Hidden Leaf',
      },
      {
        id: 'dark-knight-cinematic',
        topicId: 'the-dark-knight',
        title: 'The Dark Knight',
        category: 'movies',
        tags: ['Movies', 'Batman', 'DC', 'Joker'],
        questionCount: 80,
        rating: 4.9,
        difficulty: 'Medium',
        imageUrl: '/images/topics/dark-knight.jpg',
        creator: 'Gotham Knight',
      },
      {
        id: 'inception-totem',
        topicId: 'inception',
        title: 'Inception',
        category: 'movies',
        tags: ['Movies', 'Sci-Fi', 'Nolan', 'Dreams'],
        questionCount: 100,
        rating: 4.9,
        difficulty: 'Hard',
        imageUrl: '/images/topics/inception.jpg',
        creator: 'Architect Cobb',
      },
      {
        id: 'star-wars-saga',
        topicId: 'star-wars',
        title: 'Star Wars',
        category: 'movies',
        tags: ['Movies', 'Sci-Fi', 'Jedi', 'Skywalker'],
        questionCount: 150,
        rating: 4.8,
        difficulty: 'Hard',
        imageUrl: '/images/topics/star-wars.jpg',
        creator: 'Jedi Council',
      },
      {
        id: 'mcu-avengers-endgame',
        topicId: 'mcu',
        title: 'Marvel Universe',
        category: 'movies',
        tags: ['Movies', 'Marvel', 'Avengers', 'Iron Man'],
        questionCount: 150,
        rating: 4.9,
        difficulty: 'Hard',
        imageUrl: '/images/topics/mcu-avengers.jpg',
        creator: 'S.H.I.E.L.D.',
      },
      {
        id: 'dragon-ball-saiyan',
        topicId: 'dragon-ball',
        title: 'Dragon Ball Z',
        category: 'anime',
        tags: ['Anime', 'Shonen', 'Goku', 'Saiyan'],
        questionCount: 120,
        rating: 4.8,
        difficulty: 'Easy',
        imageUrl: '/images/topics/dragon-ball.jpg',
        creator: 'Kame House',
      },
      {
        id: 'hunter-x-hunter-nen',
        topicId: 'hunter-x-hunter',
        title: 'Hunter x Hunter',
        category: 'anime',
        tags: ['Anime', 'Gon', 'Killua', 'Nen'],
        questionCount: 130,
        rating: 4.9,
        difficulty: 'Hard',
        imageUrl: '/images/topics/hunter-x-hunter.jpg',
        creator: 'Hunter Assoc',
      },
    ];
  }, []);

  // Filter & Sort
  const filteredQuizzes = useMemo(() => {
    let result = entertainmentQuizzes;

    // Filter by tag
    if (activeTag !== 'All') {
      result = result.filter((q) =>
        q.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase()) ||
        q.category.toLowerCase() === activeTag.toLowerCase()
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortOption === 'name-asc') return a.title.localeCompare(b.title);
      if (sortOption === 'name-desc') return b.title.localeCompare(a.title);
      if (sortOption === 'rating-desc') return b.rating - a.rating;
      if (sortOption === 'slides-desc') return b.questionCount - a.questionCount;
      return 0; // default best match
    });
  }, [entertainmentQuizzes, activeTag, sortOption]);

  // Handle instant play / topic start
  const handlePlayQuiz = (quiz: QuizItem) => {
    setPlayedQuizIds((prev) => new Set([...prev, quiz.id]));
    setSelectedTopicId(quiz.topicId);
    setCurrentView('difficulty');
  };

  // Handle host multiplayer room
  const handleHostRoom = (quiz: QuizItem) => {
    const username = currentUser?.username || 'PlayerOne';
    createRoom(username, quiz.topicId, 5, 15, 2);
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF4] text-[#000000] pb-8 font-sans">
      {/* Mobile Join PIN Band */}
      <MobileJoinBar />

      {/* Main Container */}
      <div className="max-w-[1248px] mx-auto px-4 md:px-6 pt-4 md:pt-6 space-y-6">

        {/* ── Promotional Banners: Create Quiz & Categories ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Banner 1: Create a quiz */}
          <div className="bg-[#19444A] rounded-xl p-5 md:p-8 flex flex-row items-center justify-between gap-4 text-white relative overflow-hidden shadow-sm">
            <div className="flex flex-col items-start justify-center space-y-2 z-1">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
                Create a quiz
              </h2>
              <p className="font-roboto text-xs md:text-sm font-bold opacity-90 leading-tight">
                Play for free with up to 300 participants
              </p>
              <div className="pt-2">
                <QuizButton
                  color="green"
                  size="md"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Quiz editor
                </QuizButton>
              </div>
            </div>
            {/* Visual Icon Art */}
            <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 flex items-center justify-center opacity-85">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20">
                <Plus className="w-10 h-10 md:w-14 md:h-14 text-[#00A76D]" />
              </div>
            </div>
          </div>

          {/* Banner 2: Categories */}
          <div className="bg-[#19444A] rounded-xl p-5 md:p-8 flex flex-row items-center justify-between gap-4 text-white relative overflow-hidden shadow-sm">
            <div className="flex flex-col items-start justify-center space-y-2 z-1">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
                Categories
              </h2>
              <p className="font-roboto text-xs md:text-sm font-bold opacity-90 leading-tight">
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
            <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 flex items-center justify-center opacity-85">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20">
                <Sparkles className="w-10 h-10 md:w-14 md:h-14 text-[#6FEEFF]" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Category Header & Controls Bar ── */}
        <div className="space-y-4 pt-2">
          {/* Title & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="font-nunito font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
                Entertainment
              </h1>
              <p className="font-roboto text-xs sm:text-sm font-bold text-black/60 dark:text-white/60">
                From anime to Hollywood blockbusters · {entertainmentQuizzes.length} Quizzes Available
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-black/80 text-white font-nunito font-black text-xs sm:text-sm rounded-full transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create in Entertainment</span>
              </button>
            </div>
          </div>

          {/* Tags Pills Row */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {['All', 'Anime', 'TV Series', 'Movies', 'Gaming'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`px-3.5 py-1.5 rounded-full font-nunito font-bold text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer border ${
                  activeTag === tag
                    ? 'bg-black text-white border-black'
                    : 'bg-[#E5E3DB] dark:bg-[#2A2929] text-black dark:text-white border-[#CECCC5] dark:border-[#363535] hover:bg-black/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Sort Selector Bar */}
          <div className="flex items-center justify-between text-xs sm:text-sm border-b border-black/10 dark:border-white/10 pb-3">
            <span className="font-roboto font-bold text-black/60 dark:text-white/60">
              Showing {filteredQuizzes.length} results
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-[#E5E3DB] dark:bg-[#2A2929] text-black dark:text-white font-nunito font-bold text-xs sm:text-sm rounded-full px-4 py-1.5 border border-[#CECCC5] dark:border-[#363535] focus:outline-none cursor-pointer"
            >
              <option value="best">Best match</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
              <option value="rating-desc">Rating: Highest first</option>
              <option value="slides-desc">Slide count: Highest first</option>
            </select>
          </div>
        </div>

        {/* ── Quiz Feed (Quiz.com Row Style) ── */}
        <div className="divide-y divide-black/10 dark:divide-white/10 border-b border-black/10 dark:border-white/10">
          {filteredQuizzes.map((quiz) => {
            const isPlayed = playedQuizIds.has(quiz.id);
            const cleanTitle = quiz.title.split(':')[0].trim();

            return (
              <div
                key={quiz.id}
                className="py-4 md:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors rounded-lg px-2"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* 4:3 Aspect Thumbnail */}
                  <div
                    onClick={() => handlePlayQuiz(quiz)}
                    className="relative w-20 h-15 sm:w-24 sm:h-18 md:w-28 md:h-21 rounded-lg overflow-hidden bg-black/10 shrink-0 cursor-pointer shadow-sm group-hover:opacity-95 transition-opacity"
                  >
                    <SafeImage
                      src={quiz.imageUrl}
                      alt={cleanTitle}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Played checkmark badge */}
                    {isPlayed && (
                      <div className="absolute top-0 left-0 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}

                    {/* Difficulty Badge */}
                    <div className="absolute bottom-1 left-1.5">
                      <span
                        className={`text-[9px] md:text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                          quiz.difficulty === 'Nightmare'
                            ? 'bg-red-600 text-white'
                            : quiz.difficulty === 'Hard'
                            ? 'bg-[#FF94AB] text-black'
                            : quiz.difficulty === 'Medium'
                            ? 'bg-[#B9843E] text-white'
                            : 'bg-[#4CA471] text-white'
                        }`}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="flex flex-col justify-center min-w-0 space-y-1">
                    <h3
                      onClick={() => handlePlayQuiz(quiz)}
                      className="font-nunito font-black text-base md:text-lg text-black dark:text-white hover:underline cursor-pointer leading-snug line-clamp-1"
                    >
                      {cleanTitle}
                    </h3>

                    {/* Author line */}
                    <p className="font-roboto text-xs font-bold text-black/50 dark:text-white/50">
                      Quiz by <span className="hover:underline">{quiz.creator}</span>
                    </p>

                    {/* Meta badges row */}
                    <div className="flex flex-wrap items-center gap-3 pt-0.5 font-roboto text-xs">
                      {/* Rating */}
                      <div className="flex items-center gap-1 font-bold text-[#B9843E]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{quiz.rating.toFixed(1)}</span>
                      </div>

                      {/* Slides / Questions */}
                      <div className="flex items-center gap-1 font-bold text-black/70 dark:text-white/70">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{quiz.questionCount} Questions</span>
                      </div>

                      {/* Tags (Desktop) */}
                      <div className="hidden md:flex items-center gap-1 text-black/40 dark:text-white/40">
                        {quiz.tags.slice(0, 3).map((t, idx) => (
                          <span key={t}>
                            #{t}
                            {idx < 2 ? ' · ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleHostRoom(quiz)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#E5E3DB] dark:bg-[#2A2929] hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-nunito font-bold text-xs rounded-full border border-[#CECCC5] dark:border-[#363535] transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Host Room</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayQuiz(quiz)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-black/80 text-white font-nunito font-bold text-xs rounded-full transition-colors cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Solo</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
