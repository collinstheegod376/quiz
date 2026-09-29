'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { CategoryNav } from '@/components/layout/CategoryNav';
import { MobileJoinBar } from '@/components/layout/MobileJoinBar';
import { QuizButton } from '@/components/ui/QuizButton';
import { TOPICS } from '@/data/topics';
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
  const { currentUser, setIsAuthModalOpen } = useAuth();

  const [activeTag, setActiveTag] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('best');
  const [playedQuizIds, setPlayedQuizIds] = useState<Set<string>>(new Set(['one-piece']));

  // Curate comprehensive entertainment quizzes from topic database
  const entertainmentQuizzes: QuizItem[] = useMemo(() => {
    return [
      {
        id: 'one-piece-grand-line',
        topicId: 'one-piece',
        title: 'One Piece: The Grand Line & Pirate King Lore',
        category: 'anime',
        tags: ['Anime', 'Shonen', 'Pirates', 'Luffy'],
        questionCount: 150,
        rating: 4.9,
        difficulty: 'Hard',
        imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTUtYmVjMy00YjRiLTkxMWUtNzZkMDNiYjZhNmViXkEyXkFqcGc@._V1_.jpg',
        creator: 'Eiichiro Lore',
      },
      {
        id: 'gojo-sukuna-shinjuku',
        topicId: 'gojo-vs-sukuna',
        title: 'Gojo vs. Sukuna: Shinjuku Showdown of the Strongest',
        category: 'anime',
        tags: ['Anime', 'Jujutsu Kaisen', 'Gojo', 'Sukuna'],
        questionCount: 120,
        rating: 5.0,
        difficulty: 'Nightmare',
        imageUrl: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/0/0d/Unlimited_Void_vs._Malevolent_Shrine.png/revision/latest?cb=20240211155227',
        creator: 'Jujutsu High',
      },
      {
        id: 'breaking-bad-empire',
        topicId: 'breaking-bad',
        title: 'Breaking Bad: Heisenberg & The Albuquerque Chemistry',
        category: 'series',
        tags: ['TV Series', 'Drama', 'Crime', 'Heisenberg'],
        questionCount: 150,
        rating: 4.9,
        difficulty: 'Hard',
        imageUrl: 'https://assets.aboutslots.com/uploads/assets/O9e_MD_Nw_Tlect_Link_slot_banner_3b718b315f.jpg',
        creator: 'Walter White',
      },
      {
        id: 'the-boys-vought',
        topicId: 'the-boys',
        title: 'The Boys: Vought International & Compound V',
        category: 'series',
        tags: ['TV Series', 'Superheroes', 'Homelander', 'Action'],
        questionCount: 150,
        rating: 4.8,
        difficulty: 'Hard',
        imageUrl: 'https://image.tmdb.org/t/p/w500/mY7SeH4YFFxW12l5L9AC3V3Gg3C.jpg',
        creator: 'Billy Butcher',
      },
      {
        id: 'attack-on-titan-rumbling',
        topicId: 'attack-on-titan',
        title: 'Attack on Titan: The Nine Titans & The Rumbling',
        category: 'anime',
        tags: ['Anime', 'Dark Fantasy', 'Eren', 'Titans'],
        questionCount: 150,
        rating: 4.8,
        difficulty: 'Hard',
        imageUrl: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
        creator: 'Scout Regiment',
      },
      {
        id: 'stranger-things-upside-down',
        topicId: 'stranger-things',
        title: 'Stranger Things: The Upside Down, Hawkins & Vecna',
        category: 'series',
        tags: ['TV Series', 'Sci-Fi', '80s', 'Hawkins'],
        questionCount: 150,
        rating: 4.7,
        difficulty: 'Medium',
        imageUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
        creator: 'Hellfire Club',
      },
      {
        id: 'demon-slayer-kizuki',
        topicId: 'demon-slayer',
        title: 'Demon Slayer: Nichirin Blades, Hashira & Twelve Kizuki',
        category: 'anime',
        tags: ['Anime', 'Swords', 'Hashira', 'Tanjiro'],
        questionCount: 150,
        rating: 4.9,
        difficulty: 'Easy',
        imageUrl: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
        creator: 'Demon Corps',
      },
      {
        id: 'game-of-thrones-westeros',
        topicId: 'game-of-thrones',
        title: 'Game of Thrones: The Iron Throne & Great Houses',
        category: 'series',
        tags: ['TV Series', 'Fantasy', 'Westeros', 'Dragons'],
        questionCount: 150,
        rating: 4.8,
        difficulty: 'Hard',
        imageUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
        creator: 'Citadel Maester',
      },
      {
        id: 'bleach-tybw',
        topicId: 'bleach',
        title: 'Bleach: Soul Society, Zanpakuto & Thousand-Year Blood War',
        category: 'anime',
        tags: ['Anime', 'Soul Reaper', 'Ichigo', 'Bankai'],
        questionCount: 150,
        rating: 4.8,
        difficulty: 'Hard',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHgv812hd8ZACsQrISDtQjzxMEDcv78Vf7yBRGZ9iVCPA2UHIKbpYeW5Fk&s=10',
        creator: 'Gotei 13',
      },
      {
        id: 'naruto-shippuden-lore',
        topicId: 'naruto',
        title: 'Naruto Shippuden: Akatsuki, Shinobi War & Kekkei Genkai',
        category: 'anime',
        tags: ['Anime', 'Ninja', 'Naruto', 'Sasuke'],
        questionCount: 110,
        rating: 4.8,
        difficulty: 'Medium',
        imageUrl: 'https://m.media-amazon.com/images/M/MV5BNTk3MDA1ZjAtNTRhYS00YzNiLTgwOGEtYWRmYTQ3NjA0NTAwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
        creator: 'Hidden Leaf',
      },
      {
        id: 'dark-knight-cinematic',
        topicId: 'popular-movies',
        title: 'The Dark Knight Trilogy: Christopher Nolan Gotham Lore',
        category: 'movies',
        tags: ['Movies', 'Batman', 'DC', 'Christopher Nolan'],
        questionCount: 80,
        rating: 4.9,
        difficulty: 'Medium',
        imageUrl: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        creator: 'Wayne Enterprises',
      },
      {
        id: 'dragon-ball-z-super',
        topicId: 'dragon-ball-z',
        title: 'Dragon Ball Z: Super Saiyan Evolutions & Planet Namek',
        category: 'anime',
        tags: ['Anime', 'Saiyan', 'Goku', 'Vegeta'],
        questionCount: 120,
        rating: 4.8,
        difficulty: 'Easy',
        imageUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        creator: 'Capsule Corp',
      },
      {
        id: 'hunter-x-hunter-chimera',
        topicId: 'hunter-x-hunter',
        title: 'Hunter x Hunter: Nen Principles & Chimera Ant Arc',
        category: 'anime',
        tags: ['Anime', 'Nen', 'Gon', 'Killua'],
        questionCount: 130,
        rating: 4.9,
        difficulty: 'Nightmare',
        imageUrl: 'https://image.tmdb.org/t/p/w500/ucmpFdWzFpWzL7z9pBfPzD3lS7Y.jpg',
        creator: 'Hunter Assoc',
      },
    ];
  }, []);

  const tagsList = ['All', 'Anime', 'TV Series', 'Movies', 'Gaming'];

  // Filter quizzes by active tag
  const filteredQuizzes = useMemo(() => {
    let list = entertainmentQuizzes;
    if (activeTag !== 'All') {
      list = list.filter((q) =>
        q.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())
      );
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortOption === 'name-asc') return a.title.localeCompare(b.title);
      if (sortOption === 'name-desc') return b.title.localeCompare(a.title);
      if (sortOption === 'rating-desc') return b.rating - a.rating;
      if (sortOption === 'slides-desc') return b.questionCount - a.questionCount;
      return 0; // default best match
    });
  }, [entertainmentQuizzes, activeTag, sortOption]);

  // Handle instant play / topic start
  const handlePlayQuiz = (quiz: QuizItem) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setPlayedQuizIds((prev) => new Set([...prev, quiz.id]));
    setSelectedTopicId(quiz.topicId);
    setCurrentView('difficulty');
  };

  // Handle host multiplayer room
  const handleHostRoom = (quiz: QuizItem) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    createRoom(currentUser.username, quiz.topicId, 5, 15, 2);
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF4] dark:bg-[#100F0F] text-[#000000] dark:text-[#FEFEFD] transition-colors pb-24 md:pb-16 font-sans">
      {/* ── Subnav Category Bar ── */}
      <div className="w-full border-b border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F]">
        <div className="max-w-[1248px] mx-auto px-4 md:px-6">
          <CategoryNav activeCategory="anime" />
        </div>
      </div>

      {/* ── Mobile Join PIN Band ── */}
      <MobileJoinBar />

      {/* ── Main Container (Quiz.com md:custom-container) ── */}
      <div className="max-w-[1248px] mx-auto px-4 md:px-6 pt-4 md:pt-6 space-y-6">

        {/* ── Promotional Banners: Create Quiz & A.I. Generator ── */}
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
                  onClick={() => {
                    if (!currentUser) { setIsAuthModalOpen(true); return; }
                    setIsCreateModalOpen(true);
                  }}
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

          {/* Banner 2: A.I. Generator */}
          <div className="bg-[#19444A] rounded-xl p-5 md:p-8 flex flex-row items-center justify-between gap-4 text-white relative overflow-hidden shadow-sm">
            <div className="flex flex-col items-start justify-center space-y-2 z-1">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
                A.I. Generator
              </h2>
              <p className="font-roboto text-xs md:text-sm font-bold opacity-90 leading-tight">
                Generate a live quiz from any anime, movie, or prompt
              </p>
              <div className="pt-2">
                <QuizButton
                  color="cyan"
                  size="md"
                  onClick={() => {
                    if (!currentUser) { setIsAuthModalOpen(true); return; }
                    setSelectedTopicId('gojo-vs-sukuna');
                    setCurrentView('difficulty');
                  }}
                >
                  Quiz generator
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

        {/* ── Category Title Header ── */}
        <div className="pt-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-normal text-black dark:text-white">
            Entertainment
          </h1>
          <p className="font-roboto text-sm md:text-base font-bold text-black/60 dark:text-white/60 mt-1">
            Dive into movies, anime, TV series, gaming, and pop culture quizzes. Challenge your friends or conquer solo tiers.
          </p>
        </div>

        {/* ── Filter Tags & Sort Control Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#CECCC5] dark:border-[#363535]">
          {/* Tag Pills */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {tagsList.map((tag) => {
              const isSelected = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`px-4 py-1.5 rounded-full font-nunito font-extrabold text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-[#E5E3DB] dark:bg-[#2A2929] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="font-roboto text-xs font-bold opacity-60">Sort:</span>
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
                      alt={quiz.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      className="font-nunito font-black text-base md:text-lg text-black dark:text-white hover:underline cursor-pointer leading-snug line-clamp-2"
                    >
                      {quiz.title}
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

                  <QuizButton
                    color="green"
                    size="sm"
                    onClick={() => handlePlayQuiz(quiz)}
                  >
                    Play
                  </QuizButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
