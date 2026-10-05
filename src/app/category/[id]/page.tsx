import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';
import { TOPICS } from '@/data/topics';
import { getBreadcrumbSchema } from '@/lib/seo-schema';
import { ArrowLeft, Play, Flame, HelpCircle } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.filter((cat) =>
    TOPICS.some((t) => t.categoryId === cat.id && t.isActive)
  ).map((cat) => ({
    id: cat.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const category = CATEGORIES.find((c) => c.id === id);
  const hasActiveTopics = TOPICS.some((t) => t.categoryId === id && t.isActive);

  if (!category || !hasActiveTopics) {
    return {
      title: 'Category Not Found — AniZuki',
      robots: { index: false, follow: false },
    };
  }

  const displayName = category.name.charAt(0) + category.name.slice(1).toLowerCase();
  const title = `${displayName} Quizzes & Trivia Battles — AniZuki`;
  const description = `Play free ${displayName.toLowerCase()} trivia and quiz battles on AniZuki. Test your lore across 10 difficulty tiers and climb the leaderboard.`;
  const canonicalUrl = `https://anizuki.sbs/category/${category.id}`;

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
          url: category.bannerImage,
          width: 1200,
          height: 630,
          alt: `${category.name} Quizzes`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [category.bannerImage],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const category = CATEGORIES.find((c) => c.id === id);
  const categoryTopics = category
    ? TOPICS.filter((t) => t.categoryId === category.id && t.isActive)
    : [];

  if (!category || categoryTopics.length === 0) {
    notFound();
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/entertainment' },
    { name: category.name, url: `/category/${category.id}` },
  ]);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Quizzes & Trivia`,
    description: category.description,
    url: `https://anizuki.sbs/category/${category.id}`,
    hasPart: categoryTopics.map((topic) => ({
      '@type': 'Quiz',
      name: topic.name,
      url: `https://anizuki.sbs/topic/${topic.slug || topic.id}`,
      description: topic.description,
    })),
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Back button */}
      <div>
        <Link
          href="/entertainment"
          className="inline-flex items-center gap-1.5 text-xs font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3] hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Categories</span>
        </Link>
      </div>

      {/* Category Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-black dark:border-[#363535] bg-black text-white p-6 sm:p-10 shadow-lg">
        <div className="absolute inset-0 opacity-40">
          <Image
            src={category.bannerImage}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-nunito font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {category.tagline}
          </div>
          <h1 className="font-nunito font-black text-3xl sm:text-4xl text-white tracking-tight">
            {category.name}
          </h1>
          <p className="font-roboto text-sm sm:text-base text-white/90 leading-relaxed">
            {category.description}
          </p>
          <div className="pt-2 text-xs font-nunito font-bold text-white/70">
            {categoryTopics.length} Active Trivia Topics Available
          </div>
        </div>
      </div>

      {/* Topic Cards Grid */}
      <div className="space-y-4">
        <h2 className="font-nunito font-black text-xl text-black dark:text-white">
          Explore {category.name} Topics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTopics.map((topic) => (
            <div
              key={topic.id}
              className="group bg-white dark:bg-[#1E1D1D] rounded-2xl border-2 border-black dark:border-[#363535] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-800">
                <Image
                  src={topic.imageUrl}
                  alt={topic.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm text-white font-nunito font-bold text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  {topic.questionCount} Questions
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-nunito font-black text-lg text-black dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {topic.name}
                  </h3>
                  <p className="font-roboto text-xs text-[#595955] dark:text-[#A4A3A3] mt-1 line-clamp-2">
                    {topic.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#CECCC5] dark:border-[#363535] flex items-center justify-between">
                  <Link
                    href={`/topic/${topic.slug || topic.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-nunito font-black text-xs hover:opacity-90 transition-opacity"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Topic</span>
                  </Link>

                  <span className="font-nunito font-bold text-xs text-[#595955] dark:text-[#A4A3A3]">
                    10 Difficulty Tiers
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
