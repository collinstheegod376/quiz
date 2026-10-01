'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';

function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const { setSelectedTopicId, setCurrentView } = useGame();

  useEffect(() => {
    const topic = searchParams.get('topic');
    const mode = searchParams.get('mode');
    if (topic) {
      setSelectedTopicId(topic);
      if (mode === 'create') {
        setCurrentView('difficulty');
      } else {
        setCurrentView('difficulty');
      }
    }
  }, [searchParams, setSelectedTopicId, setCurrentView]);

  return null;
}

export default function HomePage() {
  const { currentView, room, currentPlayer, isMatchFinished } = useGame();

  const renderContent = () => {
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
      case 'leaderboard':
        return <LeaderboardScreen />;
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
  };

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      {renderContent()}
    </>
  );
}
