import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Anizuki — Real-Time Anime Trivia & Quiz Arena',
    short_name: 'Anizuki',
    description:
      'The ultimate human robo anime quiz arena built on Next.js. Real-time multiplayer trivia battles, live leaderboards, and instant PIN play.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDF4',
    theme_color: '#FFFDF4',
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
