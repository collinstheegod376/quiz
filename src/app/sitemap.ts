import { MetadataRoute } from 'next';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://anizuki.sbs';
  const now = new Date();

  // 1. Core Landing Pages (priority: 1.0 / 0.9 / 0.8, daily)
  const coreLandingRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/entertainment`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Filter categories to only those containing active topics
  const activeCategories = CATEGORIES.filter((cat) =>
    TOPICS.some((t) => t.categoryId === cat.id && t.isActive)
  );

  // 2. Dynamic Public Quiz Categories (priority: 0.8, weekly)
  const categoryRoutes: MetadataRoute.Sitemap = activeCategories.map((cat) => ({
    url: `${baseUrl}/category/${cat.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Dynamic Public Quiz Topics (priority: 0.8, weekly)
  const topicRoutes: MetadataRoute.Sitemap = TOPICS.filter((t) => t.isActive).map((topic) => ({
    url: `${baseUrl}/topic/${topic.slug || topic.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // NOTE: Low-value dynamic pages (e.g. transient game results, temporary session IDs,
  // active multiplayer lobbies, `/game`, `/lobby`, `/room`, `/settings`) as well as
  // utility authentication forms (`/login`, `/signup`) are strictly EXCLUDED
  // to protect crawl budget and prevent indexing thin/duplicate content.

  return [...coreLandingRoutes, ...categoryRoutes, ...topicRoutes];
}
