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
    google: '_4C10afDRfjcr611Ibizbwdp9FWKCr3TJ1G870tqnBk',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFFDF4',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Light mode only — no "dark" class
    <html lang="en" className={`${nunito.variable} ${roboto.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased font-sans bg-[#FFFDF4]">
        <AuthProvider>
          <ThemeProvider>
            <GameProvider>
              <Navbar />
              <main className="flex-1 w-full">{children}</main>
              <MobileNav />
              <ModalsContainer />
            </GameProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
