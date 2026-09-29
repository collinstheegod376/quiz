'use client';

import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { LandingScreen } from '@/components/screens/LandingScreen';
import { CategoryScreen } from '@/components/screens/CategoryScreen';
import { TopicScreen } from '@/components/screens/TopicScreen';
import { DifficultyScreen } from '@/components/screens/DifficultyScreen';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { QuestionScreen } from '@/components/screens/QuestionScreen';
import { AnswerRevealScreen } from '@/components/screens/AnswerRevealScreen';
import { FinalResultsScreen } from '@/components/screens/FinalResultsScreen';

const PROTECTED_VIEWS = ['categories', 'topics', 'difficulty', 'lobby', 'game'];

export default function HomePage() {
  const { currentView, setCurrentView, room, isMatchFinished } = useGame();
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();

  // Hard route guard: bounce unauthenticated users back to landing
  useEffect(() => {
    if (!isAuthenticated && PROTECTED_VIEWS.includes(currentView)) {
      setCurrentView('landing');
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated, currentView, setCurrentView, setIsAuthModalOpen]);

  // Don't render protected content until authenticated
  if (!isAuthenticated && currentView !== 'landing') {
    return <LandingScreen />;
  }

  if (currentView === 'game' && room) {
    if (isMatchFinished || room.status === 'FINAL_RESULTS' || room.status === 'FINISHED') {
      return <FinalResultsScreen />;
    }
    return <QuestionScreen />;
  }

  switch (currentView) {
    case 'categories':
      return <CategoryScreen />;
    case 'topics':
      return <TopicScreen />;
    case 'difficulty':
      return <DifficultyScreen />;
    case 'lobby':
      return <LobbyScreen />;
    case 'landing':
    default:
      return <LandingScreen />;
  }
}
