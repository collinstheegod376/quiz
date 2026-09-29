'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { LandingScreen } from '@/components/screens/LandingScreen';
import { CategoryScreen } from '@/components/screens/CategoryScreen';
import { TopicScreen } from '@/components/screens/TopicScreen';
import { DifficultyScreen } from '@/components/screens/DifficultyScreen';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { QuestionScreen } from '@/components/screens/QuestionScreen';
import { FinalResultsScreen } from '@/components/screens/FinalResultsScreen';
import { NextRoundScreen } from '@/components/screens/NextRoundScreen';
import { EntertainmentScreen } from '@/components/screens/EntertainmentScreen';
import { AchievementsScreen } from '@/components/screens/AchievementsScreen';

export default function HomePage() {
  const { currentView, room, currentPlayer, isMatchFinished } = useGame();

  if (currentView === 'game') {
    if (!room || !currentPlayer) {
      return <LandingScreen />;
    }
    if (room.status === 'NEXT_ROUND') {
      return <NextRoundScreen />;
    }
    if (isMatchFinished || room.status === 'FINAL_RESULTS' || room.status === 'FINISHED') {
      return <FinalResultsScreen />;
    }
    return <QuestionScreen />;
  }

  switch (currentView) {
    case 'achievements':
      return <AchievementsScreen />;
    case 'entertainment':
      return <EntertainmentScreen />;
    case 'categories':
      return <CategoryScreen />;
    case 'topics':
      return <TopicScreen />;
    case 'difficulty':
      return <DifficultyScreen />;
    case 'lobby':
      if (!room || !currentPlayer) {
        return <LandingScreen />;
      }
      return <LobbyScreen />;
    case 'landing':
    default:
      return <LandingScreen />;
  }
}
