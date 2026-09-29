'use client';

import React, { useState, useMemo } from 'react';
import { useAchievements } from '@/context/AchievementContext';
import { useGame } from '@/context/GameContext';
import { AchievementCategory } from '@/types/achievement';
import {
  Trophy,
  ArrowLeft,
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  Zap,
  Target,
  Compass,
  Award,
  Crown,
  Medal,
  BookOpen,
  Users,
  Clock,
  ShieldCheck,
  Skull,
  Swords,
  Crosshair,
  Wand2,
  Eye,
  Atom,
  Cpu,
  Layers,
  Glasses,
  Radio,
  Car,
  Heart,
  FlaskConical,
  Globe,
  GraduationCap,
  Star,
  Activity,
  Footprints,
  Gamepad2,
} from 'lucide-react';

const CATEGORY_TABS: Array<{ id: 'all' | 'completed' | AchievementCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Unlocked' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'skill', label: 'Skill & Speed' },
  { id: 'streaks', label: 'Streaks & Wins' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'topics', label: 'Topic Mastery' },
  { id: 'grind', label: 'Career Grind' },
];

function getAchievementIcon(iconName: string, unlocked: boolean) {
  const iconProps = {
    className: `w-6 h-6 ${unlocked ? 'text-[#19444A] dark:text-[#FFC679]' : 'text-gray-400 dark:text-gray-500'}`,
  };

  switch (iconName) {
    case 'Trophy': return <Trophy {...iconProps} />;
    case 'Sparkles': return <Sparkles {...iconProps} />;
    case 'Flame': return <Flame {...iconProps} />;
    case 'Zap': return <Zap {...iconProps} />;
    case 'Target': return <Target {...iconProps} />;
    case 'Compass': return <Compass {...iconProps} />;
    case 'Award': return <Award {...iconProps} />;
    case 'Crown': return <Crown {...iconProps} />;
    case 'Medal': return <Medal {...iconProps} />;
    case 'BookOpen': return <BookOpen {...iconProps} />;
    case 'Users': return <Users {...iconProps} />;
    case 'Clock': return <Clock {...iconProps} />;
    case 'ShieldCheck': return <ShieldCheck {...iconProps} />;
    case 'Skull': return <Skull {...iconProps} />;
    case 'Swords': return <Swords {...iconProps} />;
    case 'Crosshair': return <Crosshair {...iconProps} />;
    case 'Wand2': return <Wand2 {...iconProps} />;
    case 'Eye': return <Eye {...iconProps} />;
    case 'Atom': return <Atom {...iconProps} />;
    case 'Cpu': return <Cpu {...iconProps} />;
    case 'Layers': return <Layers {...iconProps} />;
    case 'Glasses': return <Glasses {...iconProps} />;
    case 'Radio': return <Radio {...iconProps} />;
    case 'Car': return <Car {...iconProps} />;
    case 'Heart': return <Heart {...iconProps} />;
    case 'FlaskConical': return <FlaskConical {...iconProps} />;
    case 'Globe': return <Globe {...iconProps} />;
    case 'GraduationCap': return <GraduationCap {...iconProps} />;
    case 'Star': return <Star {...iconProps} />;
    case 'Activity': return <Activity {...iconProps} />;
    case 'Footprints': return <Footprints {...iconProps} />;
    case 'Gamepad2': return <Gamepad2 {...iconProps} />;
    default: return <Trophy {...iconProps} />;
  }
}

export function AchievementsScreen() {
  const { setCurrentView } = useGame();
  const { achievements, unlockedCount, totalCount, completionPercentage, totalXpEarned } = useAchievements();
  const [activeCategory, setActiveCategory] = useState<'all' | 'completed' | AchievementCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      // Category filter
      if (activeCategory === 'completed' && !item.unlocked) return false;
      if (activeCategory !== 'all' && activeCategory !== 'completed' && item.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }

      return true;
    });
  }, [achievements, activeCategory, searchQuery]);

  return (
    <div className="max-w-[1248px] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 animate-fadeIn">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CECCC5] dark:border-[#363535] pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="w-10 h-10 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer border border-[#CECCC5] dark:border-[#363535]"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FFC679]" />
              <h1 className="font-nunito font-black text-2xl sm:text-3xl text-black dark:text-white leading-tight">
                Achievements & Trophies
              </h1>
            </div>
            <p className="font-roboto text-xs sm:text-sm text-[#595955] dark:text-[#A4A3A3] mt-0.5">
              Smash milestones as you play to unlock badges, XP, and bragging rights.
            </p>
          </div>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-3 bg-[#E5E3DB] dark:bg-[#1E1D1D] px-4 py-2 rounded-2xl border border-[#CECCC5] dark:border-[#363535]">
          <div className="text-right">
            <span className="font-nunito font-black text-sm text-black dark:text-white">
              {unlockedCount} / {totalCount} Unlocked
            </span>
            <span className="block font-roboto text-xs text-[#595955] dark:text-[#A4A3A3]">
              {completionPercentage}% Complete
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#19444A] flex items-center justify-center text-[#FFC679] font-black text-sm shadow-inner">
            {completionPercentage}%
          </div>
        </div>
      </div>

      {/* ── Hero Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-[#19444A] text-white rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-nunito text-xs font-extrabold uppercase tracking-wider text-[#FFC679]">
              Total Unlocked
            </span>
            <Trophy className="w-5 h-5 text-[#FFC679]" />
          </div>
          <div className="text-3xl font-black">{unlockedCount} <span className="text-sm font-semibold opacity-75">/ 50</span></div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#FFC679] h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#19444A] text-white rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-nunito text-xs font-extrabold uppercase tracking-wider text-[#6FEEFF]">
              Achievement XP
            </span>
            <Sparkles className="w-5 h-5 text-[#6FEEFF]" />
          </div>
          <div className="text-3xl font-black text-[#6FEEFF]">+{totalXpEarned.toLocaleString()} <span className="text-sm font-semibold text-white/80">XP</span></div>
          <p className="font-roboto text-xs text-white/70 mt-3">Earned directly from completing achievements</p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#19444A] text-white rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-nunito text-xs font-extrabold uppercase tracking-wider text-[#4CA471]">
              Leaderboard Glory
            </span>
            <Crown className="w-5 h-5 text-[#4CA471]" />
          </div>
          <div className="text-lg font-black leading-snug">Podium Royalty</div>
          <p className="font-roboto text-xs text-white/80 mt-1">
            Reach Top 3 on the Global Leaderboard to unlock the apex badge!
          </p>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full font-nunito font-extrabold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                    : 'bg-[#E5E3DB] dark:bg-[#2A2929] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#595955] dark:text-[#A4A3A3]" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-nunito font-bold rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] text-black dark:text-white border border-[#CECCC5] dark:border-[#363535] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
        </div>
      </div>

      {/* ── 50 Achievements Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((item) => {
          const isUnlocked = item.unlocked;
          const target = item.target;
          const currentProgress = item.progress;
          const progressPercent = Math.min(100, Math.round((currentProgress / target) * 100));

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4.5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-[#FFFDF4] dark:bg-[#1A1919] border-[#FFC679] dark:border-[#FFC679]/80 shadow-md ring-1 ring-[#FFC679]/30'
                  : 'bg-[#F2EFE9] dark:bg-[#141414] border-[#CECCC5] dark:border-[#2C2B2B] opacity-80'
              }`}
            >
              {/* Card Top */}
              <div className="flex items-start gap-3.5">
                {/* Icon Box */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUnlocked
                      ? 'bg-[#FFC679]/20 dark:bg-[#FFC679]/15 border-[#FFC679]'
                      : 'bg-[#E5E3DB] dark:bg-[#222121] border-[#CECCC5] dark:border-[#363535]'
                  }`}
                >
                  {getAchievementIcon(item.icon, isUnlocked)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-nunito font-black text-sm sm:text-base text-black dark:text-white truncate">
                      {item.title}
                    </h3>
                    <span className="font-nunito font-black text-xs text-[#FFC679] shrink-0 bg-[#19444A] px-2 py-0.5 rounded-full">
                      +{item.xpReward} XP
                    </span>
                  </div>

                  <p className="font-roboto text-xs text-[#595955] dark:text-[#A4A3A3] mt-1 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom / Progress */}
              <div className="mt-4 pt-3 border-t border-[#CECCC5]/60 dark:border-[#363535]/60">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-xs font-nunito font-extrabold text-[#4CA471]">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#4CA471]" />
                      Unlocked!
                    </span>
                    {item.unlockedAt && (
                      <span className="text-[11px] text-[#595955] dark:text-[#A4A3A3] font-normal">
                        {item.unlockedAt}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-nunito font-bold text-[#595955] dark:text-[#A4A3A3]">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {target > 1 ? `Progress: ${currentProgress} / ${target}` : 'Locked'}
                      </span>
                      {target > 1 && <span>{progressPercent}%</span>}
                    </div>
                    {target > 1 && (
                      <div className="w-full bg-[#E5E3DB] dark:bg-[#2A2929] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#4CA471] h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
