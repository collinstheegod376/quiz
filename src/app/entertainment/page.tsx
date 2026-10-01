import type { Metadata } from 'next';
import { EntertainmentScreen } from '@/components/screens/EntertainmentScreen';

export const metadata: Metadata = {
  title: 'Entertainment Quizzes — AniZuki',
  description:
    'Play 1000s of free entertainment quizzes, or create your own. Challenge your friends on any device. Stream friendly.',
  alternates: {
    canonical: 'https://anizuki.sbs/entertainment',
  },
  openGraph: {
    title: 'Entertainment Quizzes — AniZuki',
    description:
      'Play 1000s of free entertainment quizzes, or create your own. Challenge your friends on any device.',
    url: 'https://anizuki.sbs/entertainment',
    siteName: 'AniZuki',
    images: [
      {
        url: '/images/topics/one-piece.jpg',
        width: 1200,
        height: 630,
        alt: 'AniZuki Entertainment Quizzes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Entertainment Quizzes — AniZuki',
    description:
      'Explore hundreds of anime, series, and pop-culture trivia battles on AniZuki.',
    images: ['/images/topics/one-piece.jpg'],
  },
};

export default function EntertainmentPage() {
  return <EntertainmentScreen />;
}
