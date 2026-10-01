import type { Metadata } from 'next';
import Link from 'next/link';
import { TOPICS } from '@/data/topics';
import { Trophy, ArrowLeft, Play, Swords, Sparkles, CheckCircle2, Share2, Target, GraduationCap } from 'lucide-react';
import { ShareButtonClient } from './ShareButtonClient';

interface Props {
  searchParams: Promise<{
    player?: string;
    score?: string;
    topic?: string;
    grade?: string;
    accuracy?: string;
    rank?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const player = params.player || 'AniZuki Champion';
  const score = params.score || '1,200';
  const topicId = params.topic || 'anime';
  const grade = params.grade || 'S';
  const accuracy = params.accuracy || '90';

  const matchedTopic = TOPICS.find((t) => t.id === topicId || t.slug === topicId);
  const topicName = matchedTopic ? matchedTopic.name : 'Anime Trivia';

  const title = `${player} achieved ${score} XP (Grade ${grade}) in ${topicName}! — AniZuki`;
  const description = `Can you beat ${player}'s score of ${score} XP with ${accuracy}% accuracy in ${topicName}? Play AniZuki now — real-time anime trivia arena.`;

  const ogImageUrl = `https://anizuki.sbs/api/og?player=${encodeURIComponent(player)}&score=${encodeURIComponent(score)}&topic=${encodeURIComponent(topicName)}&grade=${encodeURIComponent(grade)}&accuracy=${encodeURIComponent(accuracy)}`;

  return {
    title,
    description,
    alternates: {
      canonical: 'https://anizuki.sbs/leaderboard',
    },
    openGraph: {
      type: 'article',
      url: `https://anizuki.sbs/share/result?player=${encodeURIComponent(player)}&score=${encodeURIComponent(score)}&topic=${encodeURIComponent(topicId)}&grade=${encodeURIComponent(grade)}&accuracy=${encodeURIComponent(accuracy)}`,
      title,
      description,
      siteName: 'AniZuki',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${player}'s AniZuki Scorecard`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ShareResultPage({ searchParams }: Props) {
  const params = await searchParams;
  const player = params.player || 'AniZuki Challenger';
  const score = params.score || '1,200';
  const topicId = params.topic || 'one-piece';
  const grade = params.grade || 'A+';
  const accuracy = params.accuracy || '88';
  const rank = params.rank || '1';

  const matchedTopic = TOPICS.find((t) => t.id === topicId || t.slug === topicId);
  const topicName = matchedTopic ? matchedTopic.name : 'Anime Trivia';

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3] hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Arena Home</span>
        </Link>
      </div>

      {/* Main Scorecard Card */}
      <div className="bg-white dark:bg-[#1E1D1D] rounded-3xl border-3 border-black dark:border-[#363535] overflow-hidden shadow-2xl">
        {/* Card Header Band */}
        <div className="bg-[#EBDAC3] dark:bg-[#2A2929] border-b-2 border-black dark:border-[#363535] px-6 sm:px-10 py-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-black/50 border border-black/20 dark:border-white/20 text-xs font-nunito font-black uppercase tracking-wider text-black dark:text-white">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Arena Match Record #{rank}
          </div>
          <h1 className="font-nunito font-black text-2xl sm:text-3xl text-black dark:text-white">
            {player}&apos;s Match Showcase
          </h1>
          <p className="font-roboto font-bold text-xs sm:text-sm text-[#595955] dark:text-[#A4A3A3]">
            Battle in <span className="font-black text-black dark:text-white">{topicName}</span>
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Main XP Display */}
          <div className="text-center space-y-2 py-4 bg-[#FFFDF4] dark:bg-[#100F0F] rounded-2xl border-2 border-dashed border-[#CECCC5] dark:border-[#363535]">
            <span className="font-nunito font-black text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Total Score Achieved
            </span>
            <div className="font-nunito font-black text-5xl sm:text-6xl text-black dark:text-white tracking-tight">
              {Number(score).toLocaleString() || score}{' '}
              <span className="text-2xl sm:text-3xl text-amber-500 font-extrabold">XP</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-nunito font-black text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Match Result
            </div>
          </div>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-xs font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3]">
                <GraduationCap className="w-4 h-4 text-[#23616A]" />
                Academic Grade
              </div>
              <div className="font-nunito font-black text-2xl text-black dark:text-white">
                Grade {grade}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-xs font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3]">
                <Target className="w-4 h-4 text-[#23616A]" />
                Accuracy
              </div>
              <div className="font-nunito font-black text-2xl text-black dark:text-white">
                {accuracy}%
              </div>
            </div>
          </div>

          {/* Social Share Client Component (Web Share API + Copy to Clipboard) */}
          <ShareButtonClient
            player={player}
            topicName={topicName}
            score={score}
            grade={grade}
            accuracy={accuracy}
          />

          {/* Play / Challenge Call To Action */}
          <div className="pt-6 border-t-2 border-[#CECCC5] dark:border-[#363535] flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/?topic=${topicId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-nunito font-black text-sm hover:opacity-90 transition-opacity shadow-md"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Challenge This Score (Play as Guest)</span>
            </Link>

            <Link
              href="/leaderboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-black dark:border-[#363535] bg-transparent text-black dark:text-white font-nunito font-black text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span>View Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
