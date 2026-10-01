import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://anizuki.sbs';

  return {
    rules: [
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: [
          '/',
          '/entertainment',
          '/leaderboard',
          '/category/',
          '/topic/',
          '/share/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/account/',
          '/game/',
          '/lobby/',
          '/room/',
          '/session/',
          '/scratch/',
        ],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/account/',
          '/game/',
          '/lobby/',
          '/room/',
          '/session/',
          '/scratch/',
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'],
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/account/',
          '/game/',
          '/lobby/',
          '/room/',
          '/session/',
          '/scratch/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
