import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up — AniZuki Anime Quiz Arena',
  description: 'Create a free AniZuki account to unlock competitive tiers, achievements, and real-time multiplayer battles.',
  alternates: {
    canonical: 'https://anizuki.sbs/signup',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
