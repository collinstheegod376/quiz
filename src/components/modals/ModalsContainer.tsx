'use client';

import React from 'react';
import { CreateRoomModal } from '../screens/CreateRoomModal';
import { JoinRoomModal } from '../screens/JoinRoomModal';
import { AuthModal } from './AuthModal';
import { SettingsModal } from './SettingsModal';
import { GlobalLeaderboardModal } from './GlobalLeaderboardModal';
import { useGame } from '@/context/GameContext';

export function ModalsContainer() {
  const { isGlobalLeaderboardOpen, setIsGlobalLeaderboardOpen } = useGame();

  return (
    <>
      <CreateRoomModal />
      <JoinRoomModal />
      <AuthModal />
      <SettingsModal />
      <GlobalLeaderboardModal
        isOpen={isGlobalLeaderboardOpen}
        onClose={() => setIsGlobalLeaderboardOpen(false)}
      />
    </>
  );
}
