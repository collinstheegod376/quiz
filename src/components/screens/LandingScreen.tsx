'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Users, Flame, Award, Plus, LogIn, Compass } from 'lucide-react';
import { Button } from '../ui/Button';
import { SafeImage } from '../ui/SafeImage';

export function LandingScreen() {
  const { setCurrentView, setIsCreateModalOpen, setIsJoinModalOpen, createRoom } = useGame();
  const { globalStats, currentUser, setIsAuthModalOpen } = useAuth();

  const handleCreateRoom = () => {
    if (!currentUser) { setIsAuthModalOpen(true); return; }
    setIsCreateModalOpen(true);
  };

  const handleJoinRoom = () => {
    if (!currentUser) { setIsAuthModalOpen(true); return; }
    setIsJoinModalOpen(true);
  };

  const handleExploreTopics = () => {
    if (!currentUser) { setIsAuthModalOpen(true); return; }
    setCurrentView('categories');
  };

  const handleQuickStartOnePiece = () => {
    if (!currentUser) { setIsAuthModalOpen(true); return; }
    createRoom(currentUser.username, 'one-piece', 5, 15, 2);
  };

  const featuredTopics = [
    { label: 'One Piece', tag: 'Anime', image: '/imu.png' },
    { label: 'Jujutsu Kaisen', tag: 'Anime', image: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/0/0d/Unlimited_Void_vs._Malevolent_Shrine.png/revision/latest?cb=20240211155227' },
    { label: 'Physics', tag: 'Science', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Einstein_tongue.jpg/800px-Einstein_tongue.jpg' },
    { label: 'Chemistry', tag: 'Science', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hydrogen_Spectra.jpg/800px-Hydrogen_Spectra.jpg' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FFFDF4] dark:bg-[#100F0F] text-[#000000] dark:text-[#FEFEFD] transition-colors">

      {/* ── Hero Band: "Join Game? Enter PIN" ── */}
      <section className="border-b border-[#CECCC5] dark:border-[#363535]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="bg-[#EBDAC3] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Left: Join prompt */}
              <div className="space-y-1">
                <h2 className="font-nunito font-extrabold text-[20px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
                  Join Game? Enter PIN / Room Code:
                </h2>
                <p className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
                  Jump straight into a live match with your friends
                </p>
              </div>

              {/* Right: Input + Join button */}
              <div className="flex items-center gap-3 flex-1 sm:max-w-sm">
                <input
                  type="text"
                  placeholder="e.g. AB12CD"
                  maxLength={6}
                  onClick={handleJoinRoom}
                  readOnly
                  className="flex-1 min-w-0 px-5 py-3 rounded-full border-[4px] border-[#000000] dark:border-[#FEFEFD] bg-[#FFFDF4] dark:bg-[#100F0F] font-nunito font-extrabold text-[16px] text-[#000000] dark:text-[#FEFEFD] placeholder-[#CECCC5] tracking-[0.48px] focus:outline-none cursor-pointer"
                />
                <Button variant="arena" size="md" onClick={handleJoinRoom}>
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Stats Strip ── */}
      <section className="border-b border-[#CECCC5] dark:border-[#363535]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4CA471] animate-pulse inline-block" />
              <span className="font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize">
                {globalStats.totalPlayersCount} Active Players
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#B9843E]" />
              <span className="font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize">
                {globalStats.totalRoomsCreated} Rooms Created
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#23616A]" />
              <span className="font-nunito font-extrabold text-[14px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.42px] capitalize">
                {globalStats.overallAccuracy}% Arena Accuracy
              </span>
            </div>

            {/* CTA buttons on the right */}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExploreTopics}>
                <Compass className="w-3.5 h-3.5" />
                Browse
              </Button>
              <Button variant="arena" size="sm" onClick={handleCreateRoom}>
                <Plus className="w-3.5 h-3.5" />
                Create Room
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Quick Play ── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Section heading */}
        <div className="flex items-end justify-between border-b border-[#CECCC5] dark:border-[#363535] pb-4">
          <div>
            <h2 className="font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD] leading-[1.4] tracking-[0.6px]">
              Featured Quick Match
            </h2>
            <p className="font-nunito font-extrabold text-[12.8px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.38px] capitalize">
              Dive into a ready-made battle
            </p>
          </div>
          <button
            onClick={handleExploreTopics}
            className="font-nunito font-extrabold text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px] hover:underline"
          >
            See all →
          </button>
        </div>

        {/* Hero + Side cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-[#CECCC5] dark:border-[#363535]">
          {/* Main hero card */}
          <div
            className="lg:col-span-2 group relative border-b lg:border-b-0 lg:border-r border-[#CECCC5] dark:border-[#363535] cursor-pointer hover:bg-[#E5E3DB] dark:hover:bg-[#1E1D1D] transition-colors"
            onClick={handleQuickStartOnePiece}
          >
            {/* Image */}
            <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-[#E5E3DB] dark:bg-[#1E1D1D]">
              <SafeImage
                src="/imu.png"
                fallbackSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5v8aImTlIh60FlNLO18G7LEclN2vkaKhR4pfu5vjkGcQ4s05Mc27gjYfi&s=10"
                alt="One Piece Grand Line Arena"
                className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
              />
              {/* Category pill */}
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5E3DB] border border-[#CECCC5] font-nunito font-extrabold text-[12.8px] text-[#000000] tracking-[0.38px] capitalize">
                Anime
              </span>
            </div>

            {/* Card body */}
            <div className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.6px] leading-[1.4]">
                    One Piece Grand Line Arena
                  </h3>
                  <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize mt-1">
                    Test your knowledge of Devil Fruits, Yonko powers, Haki, and the Void Century.
                  </p>
                </div>
                <Button variant="arena" size="md" onClick={handleQuickStartOnePiece} className="shrink-0">
                  Play Now
                </Button>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-[#CECCC5] dark:border-[#363535]">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                  <Users className="w-3.5 h-3.5" /> 2–4 Players
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                  Level 05
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                  10 Questions
                </span>
              </div>
            </div>
          </div>

          {/* Side: recently published stream */}
          <div className="flex flex-col divide-y divide-[#CECCC5] dark:divide-[#363535]">
            <div className="px-5 py-4">
              <h3 className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] uppercase">
                Recently Published
              </h3>
            </div>

            {featuredTopics.map((topic, i) => (
              <button
                key={i}
                onClick={handleExploreTopics}
                className="group flex items-center gap-3 px-5 py-4 hover:bg-[#E5E3DB] dark:hover:bg-[#1E1D1D] transition-colors text-left w-full"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 shrink-0 overflow-hidden bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535]">
                  <SafeImage
                    src={topic.image}
                    alt={topic.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-nunito font-black text-[16px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.48px] leading-none truncate">
                    {topic.label}
                  </div>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] font-nunito font-extrabold text-[12.8px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.38px] capitalize">
                    {topic.tag}
                  </span>
                </div>
                <span className="text-[#CECCC5] dark:text-[#363535] group-hover:text-[#000000] dark:group-hover:text-[#FEFEFD] transition-colors">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore Categories Teaser ── */}
      <section className="border-t border-[#CECCC5] dark:border-[#363535]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 bg-[#F7F5ED] dark:bg-[#1E1D1D] border border-[#CECCC5] dark:border-[#363535]">
            <div className="text-center sm:text-left">
              <h2 className="font-nunito font-black text-[20px] text-[#000000] dark:text-[#FEFEFD] tracking-[0.6px] leading-[1.4]">
                Explore 5 Categories · 40+ Topics
              </h2>
              <p className="font-nunito font-extrabold text-[14px] text-[#595955] dark:text-[#A4A3A3] tracking-[0.42px] capitalize mt-1">
                Anime, Series, Movies, Chemistry, Physics — pick your arena.
              </p>
            </div>
            <Button variant="arena" size="lg" onClick={handleExploreTopics}>
              Browse All Categories
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
