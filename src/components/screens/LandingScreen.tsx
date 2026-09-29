'use client';

import React, { useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { MobileJoinBar } from '../layout/MobileJoinBar';
import { QuizButton } from '../ui/QuizButton';
import { QuizCarousel, QuizCardData } from '../ui/QuizCarousel';
import { Vote, Sparkles, BookOpen } from 'lucide-react';

export function LandingScreen() {
  const {
    setCurrentView,
    setIsCreateModalOpen,
    setSelectedCategoryId,
    setSelectedTopicId,
    createRoom,
  } = useGame();
  const { currentUser, setIsAuthModalOpen } = useAuth();

  // Curated sets of quizzes matching Quiz.com sections
  const recentlyPublishedQuizzes: QuizCardData[] = useMemo(() => [
    {
      id: 'gojo-vs-sukuna-recent',
      topicId: 'gojo-vs-sukuna',
      title: 'Gojo vs. Sukuna: Clash of the Strongest',
      imageUrl: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/0/0d/Unlimited_Void_vs._Malevolent_Shrine.png/revision/latest?cb=20240211155227',
      rating: 5.0,
      author: 'JujutsuHigh',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'one-piece-recent',
      topicId: 'one-piece',
      title: 'One Piece: Wano Arc & Gear 5 Awakenings',
      imageUrl: '/imu.png',
      rating: 4.9,
      author: 'LuffyCaptain',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'the-boys-recent',
      topicId: 'the-boys',
      title: 'The Boys: Vought International & Compound V',
      imageUrl: 'https://image.tmdb.org/t/p/w500/mY7SeH4YFFxW12l5L9AC3V3Gg3C.jpg',
      rating: 4.8,
      author: 'BillyButcher',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'breaking-bad-recent',
      topicId: 'breaking-bad',
      title: 'Breaking Bad: The Heisenberg Chemistry Quiz',
      imageUrl: 'https://assets.aboutslots.com/uploads/assets/O9e_MD_Nw_Tlect_Link_slot_banner_3b718b315f.jpg',
      rating: 4.9,
      author: 'WalterWhite',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'attack-on-titan-recent',
      topicId: 'attack-on-titan',
      title: 'Attack on Titan: The Nine Titans & The Rumbling',
      imageUrl: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
      rating: 4.8,
      author: 'ScoutRegiment',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'stranger-things-recent',
      topicId: 'stranger-things',
      title: 'Stranger Things: The Upside Down & Vecna',
      imageUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
      rating: 4.7,
      author: 'HellfireClub',
      difficulty: 'MEDIUM',
      questionCount: 150,
    },
  ], []);

  const aiQuizzes: QuizCardData[] = useMemo(() => [
    {
      id: 'quantum-physics-ai',
      topicId: 'physics',
      title: 'Quantum Physics: Wave-Particle Duality & Relativity',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      rating: 4.9,
      author: 'AI Generator',
      difficulty: 'AI',
      questionCount: 80,
    },
    {
      id: 'organic-chemistry-ai',
      topicId: 'chemistry',
      title: 'Chemical Reactions & Thermodynamics Masterclass',
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
      rating: 4.8,
      author: 'AI Generator',
      difficulty: 'AI',
      questionCount: 80,
    },
    {
      id: 'bleach-tybw-ai',
      topicId: 'bleach',
      title: 'Bleach: Thousand-Year Blood War & Bankai Lore',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHgv812hd8ZACsQrISDtQjzxMEDcv78Vf7yBRGZ9iVCPA2UHIKbpYeW5Fk&s=10',
      rating: 4.8,
      author: 'AI Generator',
      difficulty: 'AI',
      questionCount: 150,
    },
    {
      id: 'demon-slayer-ai',
      topicId: 'demon-slayer',
      title: 'Demon Slayer: Infinity Castle Arc Battle Trivia',
      imageUrl: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
      rating: 4.9,
      author: 'AI Generator',
      difficulty: 'AI',
      questionCount: 150,
    },
    {
      id: 'got-westeros-ai',
      topicId: 'game-of-thrones',
      title: 'Game of Thrones: Valyrian Steel & Great Dynasties',
      imageUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
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
      title: 'One Piece: Ultimate Pirate King Trivia',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTUtYmVjMy00YjRiLTkxMWUtNzZkMDNiYjZhNmViXkEyXkFqcGc@._V1_.jpg',
      rating: 5.0,
      author: 'mora_queen',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'naruto-shippuden-best',
      topicId: 'naruto',
      title: 'Naruto Shippuden: Shinobi War & Akatsuki',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BNTk3MDA1ZjAtNTRhYS00YzNiLTgwOGEtYWRmYTQ3NjA0NTAwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
      rating: 4.9,
      author: 'CandyQueen',
      difficulty: 'MEDIUM',
      questionCount: 110,
    },
    {
      id: 'dark-knight-best',
      topicId: 'popular-movies',
      title: 'The Dark Knight: Christopher Nolan Masterpiece',
      imageUrl: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      rating: 4.9,
      author: 'GothamKnight',
      difficulty: 'MEDIUM',
      questionCount: 80,
    },
    {
      id: 'hxh-best',
      topicId: 'hunter-x-hunter',
      title: 'Hunter x Hunter: Nen Principles & Chimera Ants',
      imageUrl: 'https://image.tmdb.org/t/p/w500/ucmpFdWzFpWzL7z9pBfPzD3lS7Y.jpg',
      rating: 4.9,
      author: 'Kurapika99',
      difficulty: 'HARD',
      questionCount: 130,
    },
    {
      id: 'fma-best',
      topicId: 'fullmetal-alchemist',
      title: 'Fullmetal Alchemist: Equivalent Exchange Lore',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BNDc4MThhN2EtZjMzNC00ZDJmLThiZTgtNThlY2UxZWM4NjdkXkEyXkFqcGc@._V1_.jpg',
      rating: 4.9,
      author: 'EdwardElric',
      difficulty: 'HARD',
      questionCount: 120,
    },
  ], []);

  const popularQuizzes: QuizCardData[] = useMemo(() => [
    {
      id: 'gojo-popular',
      topicId: 'gojo-vs-sukuna',
      title: 'Gojo vs. Sukuna: Hollow Purple & Malevolent Shrine',
      imageUrl: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/0/0d/Unlimited_Void_vs._Malevolent_Shrine.png/revision/latest?cb=20240211155227',
      rating: 5.0,
      author: 'ImLucifer',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'dbz-popular',
      topicId: 'dragon-ball-z',
      title: 'Dragon Ball Z: Super Saiyans & Cell Games',
      imageUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      rating: 4.8,
      author: 'GokuSaiyan',
      difficulty: 'EASY',
      questionCount: 120,
    },
    {
      id: 'breaking-bad-popular',
      topicId: 'breaking-bad',
      title: 'Breaking Bad: Los Pollos Hermanos & Gus Fring',
      imageUrl: 'https://assets.aboutslots.com/uploads/assets/O9e_MD_Nw_Tlect_Link_slot_banner_3b718b315f.jpg',
      rating: 4.9,
      author: 'brittanyk',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'the-boys-popular',
      topicId: 'the-boys',
      title: 'The Boys: Homelander vs Butcher Feud',
      imageUrl: 'https://image.tmdb.org/t/p/w500/mY7SeH4YFFxW12l5L9AC3V3Gg3C.jpg',
      rating: 4.8,
      author: 'Christy',
      difficulty: 'HARD',
      questionCount: 150,
    },
  ], []);

  const animeCategoryQuizzes: QuizCardData[] = useMemo(() => [
    {
      id: 'anime-op',
      topicId: 'one-piece',
      title: 'One Piece: Grand Line & Devil Fruits',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTUtYmVjMy00YjRiLTkxMWUtNzZkMDNiYjZhNmViXkEyXkFqcGc@._V1_.jpg',
      rating: 4.9,
      author: 'OdaFan',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'anime-jjk',
      topicId: 'gojo-vs-sukuna',
      title: 'Jujutsu Kaisen: Cursed Techniques & Special Grades',
      imageUrl: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/0/0d/Unlimited_Void_vs._Malevolent_Shrine.png/revision/latest?cb=20240211155227',
      rating: 5.0,
      author: 'Sorcerer',
      difficulty: 'HARD',
      questionCount: 150,
    },
    {
      id: 'anime-naruto',
      topicId: 'naruto',
      title: 'Naruto: Hidden Leaf Hokages & Chunin Exams',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BNTk3MDA1ZjAtNTRhYS00YzNiLTgwOGEtYWRmYTQ3NjA0NTAwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
      rating: 4.8,
      author: 'KonohaGenin',
      difficulty: 'EASY',
      questionCount: 110,
    },
    {
      id: 'anime-bleach',
      topicId: 'bleach',
      title: 'Bleach: Soul Society & Espada Numbers',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHgv812hd8ZACsQrISDtQjzxMEDcv78Vf7yBRGZ9iVCPA2UHIKbpYeW5Fk&s=10',
      rating: 4.8,
      author: 'Shinikami',
      difficulty: 'HARD',
      questionCount: 150,
    },
  ], []);

  const handleVoteMode = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    createRoom(currentUser.username, 'one-piece', 5, 15, 4);
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF4] text-black pb-8 font-sans">
      {/* ── Mobile Join PIN Band (below navbar on mobile) ── */}
      <MobileJoinBar />

      {/* ── Main Content ── */}
      <div className="max-w-[1248px] mx-auto px-4 md:px-6 pt-3 md:pt-6 space-y-6">

        {/* ── Dual Hero Promo Banners ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Create a quiz */}
          <div className="bg-[#19444A] rounded-xl p-5 md:p-8 flex flex-row items-center justify-between gap-4 text-white relative overflow-hidden shadow-sm">
            <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-2 z-1 w-full md:w-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                Create a quiz
              </h2>
              <p className="font-roboto text-xs sm:text-sm font-bold opacity-90 leading-tight">
                Play for free with 300 participants
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
            <div className="hidden lg:flex w-28 h-28 shrink-0 items-center justify-center opacity-85">
              <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20">
                <BookOpen className="w-12 h-12 text-[#00A76D]" />
              </div>
            </div>
          </div>

          {/* Card 2: A.I. */}
          <div className="bg-[#19444A] rounded-xl p-5 md:p-8 flex flex-row items-center justify-between gap-4 text-white relative overflow-hidden shadow-sm">
            <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-2 z-1 w-full md:w-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                A.I.
              </h2>
              <p className="font-roboto text-xs sm:text-sm font-bold opacity-90 leading-tight">
                Generate a quiz from any subject or pdf
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
            <div className="hidden lg:flex w-28 h-28 shrink-0 items-center justify-center opacity-85">
              <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20">
                <Sparkles className="w-12 h-12 text-[#6FEEFF]" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Carousel 1: Recently published (Image 1 & 3) ── */}
        <QuizCarousel
          title="Recently published"
          quizzes={recentlyPublishedQuizzes}
        />

        {/* ── Carousel 2: Popular quizzes created by AI (Image 1 & 3) ── */}
        <QuizCarousel
          title="Popular quizzes created by AI"
          quizzes={aiQuizzes}
        />

        {/* ── Vote Mode Banner (from Image 3) ── */}
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

        {/* ── Carousel 3: Best rating right now (Image 2 & 3) ── */}
        <QuizCarousel
          title="Best rating right now"
          quizzes={bestRatedQuizzes}
        />

        {/* ── Carousel 4: Popular right now (Image 2 & 3) ── */}
        <QuizCarousel
          title="Popular right now"
          quizzes={popularQuizzes}
        />

        {/* ── Carousel 5: Anime Category Section (Image 2 & 3) ── */}
        <QuizCarousel
          title="Anime"
          seeAllCount={15}
          onSeeAll={() => {
            setSelectedCategoryId('anime');
            setCurrentView('topics');
          }}
          quizzes={animeCategoryQuizzes}
        />
      </div>
    </div>
  );
}
