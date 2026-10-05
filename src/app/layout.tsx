import type { Metadata } from 'next';
import { Nunito, Roboto } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { GameProvider } from '@/context/GameContext';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ModalsContainer } from '@/components/modals/ModalsContainer';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Anizuki — Real-Time Anime Trivia & Quiz Arena',
  description:
    'Play Anizuki, the ultimate human robo quiz arena built on Next.js. Real-time anime trivia battles, multiplayer lobbies, and instant challenges.',
  keywords: [
    'Anizuki',
    'anime quiz game',
    'human robo quiz',
    'Next.js quiz app',
    'multiplayer anime trivia',
    'real-time trivia arena',
    'One Piece quiz',
    'Jujutsu Kaisen trivia',
    'anime battle quiz',
    'Promised Killua',
  ],
  authors: [{ name: 'Promised Killua', url: 'https://www.promisedkillua.sbs/' }],
  creator: 'Promised Killua',
  metadataBase: new URL('https://anizuki.sbs'),
  openGraph: {
    type: 'website',
    url: 'https://anizuki.sbs',
    title: 'Anizuki — Real-Time Anime Trivia & Quiz Arena',
    description:
      'Experience Anizuki: the next-gen anime quiz arena built with Next.js & Supabase. Designed by Promised Killua.',
    siteName: 'Anizuki',
    images: [
      {
        url: '/images/topics/gojo-vs-sukuna.jpg',
        width: 1200,
        height: 630,
        alt: 'Anizuki Anime Quiz Arena',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anizuki — Real-Time Anime Trivia & Quiz Arena',
    description:
      'The ultimate human robo anime quiz experience powered by Next.js. Created by Promised Killua.',
    creator: '@nerfed_killua',
    images: ['/images/topics/gojo-vs-sukuna.jpg'],
  },
  verification: {
    google: ['googlefa213d5eb4f735fc', '_4C10afDRfjcr611Ibizbwdp9FWKCr3TJ1G870tqnBk'],
    other: {
      'msvalidate.01': 'C8EB11B28A811BCDE8B2D5392D66EC52',
    },
  },
  alternates: {
    canonical: 'https://anizuki.sbs',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFDF4',
};

import { AchievementProvider } from '@/context/AchievementContext';
import { AchievementToast } from '@/components/ui/AchievementToast';
import { VoiceProvider } from '@/context/VoiceContext';
import { getRootJsonLd } from '@/lib/seo-schema';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootSchema = getRootJsonLd();

  return (
    <html lang="en" className={`${nunito.variable} ${roboto.variable}`} suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="googlefa213d5eb4f735fc"
        />
        <meta
          name="google-site-verification"
          content="_4C10afDRfjcr611Ibizbwdp9FWKCr3TJ1G870tqnBk"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootSchema) }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                    anonymize_ip: true,
                  });
                `,
              }}
            />
          </>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('quiz_arena_theme');
                if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased font-sans bg-[#FFFDF4] dark:bg-[#100F0F] text-[#000000] dark:text-[#FEFEFD] transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider>
            <AchievementProvider>
              <GameProvider>
                <VoiceProvider>
                  <Navbar />
                  <main className="flex-1 w-full">{children}</main>
                  <MobileNav />
                  <ModalsContainer />
                  <AchievementToast />
                </VoiceProvider>
              </GameProvider>
            </AchievementProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
