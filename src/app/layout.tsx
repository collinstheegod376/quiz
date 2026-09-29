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
  title: 'AniZuki — Real-Time Anime Quiz Game',
  description:
    'AniZuki is a real-time multiplayer anime quiz game. Challenge friends with One Piece, Naruto, JJK, Demon Slayer trivia and more.',
  keywords: ['anizuki', 'anime quiz', 'multiplayer quiz', 'jujutsu kaisen', 'one piece', 'trivia', 'entertainment'],
  authors: [{ name: 'AniZuki' }],
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
