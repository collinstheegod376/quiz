import type { Metadata } from 'next';
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';
import { getLeaderboardSchema, getBreadcrumbSchema } from '@/lib/seo-schema';

export const metadata: Metadata = {
  title: 'Global Anime Trivia Leaderboard & Rankings — AniZuki',
  description:
    'View the top-ranked anime trivia champions, podium winners, and live XP standings. Compete in real-time battles to earn your spot on the AniZuki leaderboard.',
  alternates: {
    canonical: 'https://anizuki.sbs/leaderboard',
  },
  openGraph: {
    title: 'Global Anime Trivia Leaderboard & Rankings — AniZuki',
    description:
      'Live rankings and XP standings for top anime quiz champions worldwide. Battle now on AniZuki!',
    url: 'https://anizuki.sbs/leaderboard',
    siteName: 'AniZuki',
    images: [
      {
        url: '/images/topics/gojo-vs-sukuna.jpg',
        width: 1200,
        height: 630,
        alt: 'AniZuki Global Champions Leaderboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Anime Trivia Leaderboard & Rankings — AniZuki',
    description: 'Check out the top ranked anime trivia masters on AniZuki.',
    images: ['/images/topics/gojo-vs-sukuna.jpg'],
  },
};

export default function LeaderboardPage() {
  const topSeeds = [
    { rank: 1, username: 'GojoSensei_01', score: 18450, winRate: 88 },
    { rank: 2, username: 'Killua_Godspeed', score: 16920, winRate: 84 },
    { rank: 3, username: 'StrawHatLuffy', score: 15300, winRate: 79 },
    { rank: 4, username: 'ZoroLostAgain', score: 14100, winRate: 75 },
    { rank: 5, username: 'LeviAckerman', score: 13850, winRate: 77 },
  ];

  const leaderboardSchema = getLeaderboardSchema(topSeeds);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Global Leaderboard', url: '/leaderboard' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(leaderboardSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LeaderboardScreen />
    </>
  );
}
