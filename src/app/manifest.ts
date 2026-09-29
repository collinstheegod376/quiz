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
        src: '/images/topics/gojo-vs-sukuna.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/images/topics/gojo-vs-sukuna.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
