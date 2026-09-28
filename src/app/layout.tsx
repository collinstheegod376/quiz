import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { GameProvider } from '@/context/GameContext';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ModalsContainer } from '@/components/modals/ModalsContainer';

export const metadata: Metadata = {
  title: 'QUIZ//ARENA — Real-Time Multiplayer Quiz Game',
  description:
    'Competitive 2–4 player real-time multiplayer quiz game for anime, TV series, movies, chemistry, and physics with 10 progressive difficulty tiers.',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-red-500 selection:text-white pb-16 md:pb-0 bg-[#0B0C10] text-[#F8FAFC]">
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
