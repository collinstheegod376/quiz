import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://anizuki.sbs';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/scratch/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'],
        allow: ['/', '/llms.txt', '/llms-full.txt'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
