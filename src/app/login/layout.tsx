import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In — AniZuki Anime Quiz Arena',
  description: 'Log in to your AniZuki account to track your match stats, save XP, and climb the global leaderboards.',
  alternates: {
    canonical: 'https://anizuki.sbs/login',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
