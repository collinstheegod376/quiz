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
  title: 'Quiz.com — Real-Time Multiplayer Quiz Game',
  description:
    'Playful, competitive 2–4 player real-time multiplayer quiz game inspired by Quiz.com with progressive difficulty tiers and instant zero-delay gameplay.',
  keywords: ['quiz', 'quiz.com', 'multiplayer', 'anime', 'trivia', 'entertainment', 'gaming'],
  authors: [{ name: 'Quiz.com' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0B0C10',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${nunito.variable} ${roboto.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased pb-16 md:pb-0 font-sans">
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
