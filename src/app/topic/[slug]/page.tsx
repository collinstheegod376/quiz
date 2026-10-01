import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { TOPICS } from '@/data/topics';
import { CATEGORIES, DIFFICULTY_LEVELS } from '@/data/categories';
import { SEED_QUESTIONS } from '@/data/questions';
import { getQuizSchema, getBreadcrumbSchema } from '@/lib/seo-schema';
import { ArrowLeft, Play, Swords, ShieldCheck, Trophy, Sparkles, HelpCircle } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOPICS.filter((t) => t.isActive).map((topic) => ({
    slug: topic.slug || topic.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = TOPICS.find((t) => (t.slug || t.id) === slug);

  if (!topic) {
    return {
      title: 'Quiz Topic Not Found — AniZuki',
    };
  }

  const title = `${topic.name} Quiz & Trivia Battles — AniZuki`;
  const description = `${topic.description} Test your knowledge with 10 difficulty tiers and ${topic.questionCount}+ questions. Play solo as guest or battle friends online!`;
  const canonicalUrl = `https://anizuki.sbs/topic/${topic.slug || topic.id}`;
  const ogImageUrl = topic.imageUrl.startsWith('http')
    ? topic.imageUrl
    : `https://anizuki.sbs${topic.imageUrl}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'AniZuki',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${topic.name} Anime Quiz`,
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

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = TOPICS.find((t) => (t.slug || t.id) === slug);

  if (!topic) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.id === topic.categoryId);
  const topicQuestions = SEED_QUESTIONS.filter((q) => q.topicId === topic.id);
  const sampleQuestions = topicQuestions.slice(0, 5);

  const quizSchema = getQuizSchema(topic, sampleQuestions);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: category ? category.name : 'Quizzes', url: category ? `/category/${category.id}` : '/entertainment' },
    { name: topic.name, url: `/topic/${topic.slug || topic.id}` },
  ]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Back button */}
      <div>
        <Link
          href={category ? `/category/${category.id}` : '/entertainment'}
          className="inline-flex items-center gap-1.5 text-xs font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3] hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {category ? category.name : 'Categories'}</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-black dark:border-[#363535] bg-black text-white p-6 sm:p-10 shadow-lg">
        <div className="absolute inset-0 opacity-45">
          <Image
            src={topic.imageUrl}
            alt={topic.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-nunito font-black uppercase tracking-wider">
                {category.name}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-amber-500/80 backdrop-blur-sm text-black text-xs font-nunito font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              10 Difficulty Tiers
            </span>
          </div>

          <h1 className="font-nunito font-black text-3xl sm:text-5xl text-white tracking-tight">
            {topic.name}
          </h1>

          <p className="font-roboto text-sm sm:text-base text-white/90 leading-relaxed">
            {topic.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href={`/?topic=${topic.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-nunito font-black text-sm transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Solo (Guest Friendly)</span>
            </Link>

            <Link
              href={`/?topic=${topic.id}&mode=create`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white font-nunito font-black text-sm transition-all"
            >
              <Swords className="w-4 h-4" />
              <span>Multiplayer Battle</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview & Difficulty Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Roadmap */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E1D1D] rounded-2xl border-2 border-black dark:border-[#363535] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#CECCC5] dark:border-[#363535]">
            <h2 className="font-nunito font-black text-xl text-black dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              10-Tier Difficulty Progression
            </h2>
            <span className="font-nunito font-extrabold text-xs text-[#595955] dark:text-[#A4A3A3]">
              {topic.questionCount} Total Questions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIFFICULTY_LEVELS.map((lvl) => (
              <div
                key={lvl.levelNumber}
                className="p-3 rounded-xl border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-nunito font-black text-xs text-black dark:text-white">
                    Level {lvl.levelNumber}: {lvl.name}
                  </span>
                  <span className={`text-[10px] font-nunito font-extrabold px-2 py-0.5 rounded-full border ${lvl.badgeColor}`}>
                    Tier {lvl.levelNumber}
                  </span>
                </div>
                <p className="font-roboto text-[11px] text-[#595955] dark:text-[#A4A3A3] line-clamp-1">
                  {lvl.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Play & Indexable Feature Callout */}
        <div className="bg-[#FFFDF4] dark:bg-[#1E1D1D] rounded-2xl border-2 border-black dark:border-[#363535] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-nunito font-black text-lg text-black dark:text-white">
              Instant Guest Access
            </h3>
            <p className="font-roboto text-xs text-[#595955] dark:text-[#A4A3A3] leading-relaxed">
              No account required to jump straight into battles! Guests can answer questions, experience WebRTC live voice arenas, and save their match XP anytime by registering.
            </p>
          </div>

          <div className="pt-4 border-t border-[#CECCC5] dark:border-[#363535]">
            <Link
              href={`/?topic=${topic.id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-nunito font-black text-xs hover:opacity-90 transition-opacity"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Level 1 Now</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sample Question Teaser (Google Rich Results & Crawlers Content) */}
      {sampleQuestions.length > 0 && (
        <div className="bg-white dark:bg-[#1E1D1D] rounded-2xl border-2 border-black dark:border-[#363535] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <h2 className="font-nunito font-black text-xl text-black dark:text-white">
              Sample Arena Question Preview
            </h2>
          </div>

          <div className="space-y-4">
            {sampleQuestions.slice(0, 2).map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 rounded-xl border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] space-y-2"
              >
                <div className="font-nunito font-extrabold text-xs text-amber-600 dark:text-amber-400 uppercase">
                  Level {q.levelNumber} Sample Question
                </div>
                <div className="font-nunito font-bold text-sm text-black dark:text-white">
                  {q.questionText}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="text-xs font-nunito p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    A: {q.optionA}
                  </div>
                  <div className="text-xs font-nunito p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    B: {q.optionB}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
