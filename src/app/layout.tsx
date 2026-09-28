import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { GameProvider } from '@/context/GameContext';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ModalsContainer } from '@/components/modals/ModalsContainer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'QUIZ//ARENA — Real-Time Multiplayer Quiz Game',
  description:
    'Competitive 2–4 player real-time multiplayer quiz game for anime, TV series, movies, chemistry, and physics with 10 progressive difficulty tiers.',
  keywords: ['quiz', 'multiplayer', 'anime', 'trivia', 'real-time', 'competitive'],
  authors: [{ name: 'Quiz Arena' }],
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
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased pb-16 md:pb-0">
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
