'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { LandingScreen } from '@/components/screens/LandingScreen';
import { CategoryScreen } from '@/components/screens/CategoryScreen';
import { TopicScreen } from '@/components/screens/TopicScreen';
import { DifficultyScreen } from '@/components/screens/DifficultyScreen';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { QuestionScreen } from '@/components/screens/QuestionScreen';
import { AnswerRevealScreen } from '@/components/screens/AnswerRevealScreen';
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';
import { FinalResultsScreen } from '@/components/screens/FinalResultsScreen';

export default function HomePage() {
  const { currentView, room } = useGame();

  if (currentView === 'game' && room) {
    switch (room.status) {
      case 'QUESTION':
        return <QuestionScreen />;
      case 'REVEAL':
        return <AnswerRevealScreen />;
      case 'LEADERBOARD':
        return <LeaderboardScreen />;
      case 'FINAL_RESULTS':
      case 'FINISHED':
        return <FinalResultsScreen />;
      default:
        return <LobbyScreen />;
    }
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
