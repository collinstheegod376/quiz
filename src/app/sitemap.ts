import { MetadataRoute } from 'next';
import { TOPICS } from '@/data/topics';
import { CATEGORIES } from '@/data/categories';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://anizuki.sbs';

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/entertainment`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic category routes
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic topic routes
  const topicRoutes: MetadataRoute.Sitemap = TOPICS.map((topic) => ({
    url: `${baseUrl}/topic/${topic.slug || topic.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...topicRoutes];
}
