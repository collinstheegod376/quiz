import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Voice WebRTC Perfect Negotiation: Deterministic polite peer resolution', () => {
  const playerA = 'player_001_host';
  const playerB = 'player_002_rival';

  // Rule: Polite peer has lexicographically larger ID
  const isPlayerAPolite = playerA > playerB;
  const isPlayerBPolite = playerB > playerA;

  assert.strictEqual(isPlayerAPolite, false, 'Player A (smaller ID) should be the impolite peer');
  assert.strictEqual(isPlayerBPolite, true, 'Player B (larger ID) should be the polite peer');
  assert.notStrictEqual(isPlayerAPolite, isPlayerBPolite, 'Exactly one peer must be polite to break glare collisions');
});

test('Voice Signaling Security: Drops signals from non-room members', () => {
  const roomPlayers = [
    { id: 'p1', displayName: 'Gojo' },
    { id: 'p2', displayName: 'Sukuna' },
  ];

  const validateSender = (senderId: string) => {
    return roomPlayers.some((p) => p.id === senderId);
  };

  assert.strictEqual(validateSender('p1'), true, 'Authorized room player signal accepted');
  assert.strictEqual(validateSender('p2'), true, 'Authorized room player signal accepted');
  assert.strictEqual(validateSender('rogue_external_client'), false, 'External unauthorized sender dropped');
});

test('Voice Auto-Mute: Early finishers on WaitingScreen are exempt from auto-mute', () => {
  const shouldAutoMute = (roomStatus: string, isFinished: boolean) => {
    const isPlayerStillAnswering = roomStatus === 'QUESTION' && !isFinished;
    return isPlayerStillAnswering;
  };

  // Player actively answering on QuestionScreen
  assert.strictEqual(shouldAutoMute('QUESTION', false), true, 'Active question solver is auto-muted');

  // Player finished early on WaitingScreen
  assert.strictEqual(shouldAutoMute('QUESTION', true), false, 'Early finisher on WaitingScreen is unmuted');

  // Lobby or NextRound intermission
  assert.strictEqual(shouldAutoMute('LOBBY', false), false, 'Lobby chat is unmuted');
  assert.strictEqual(shouldAutoMute('NEXT_ROUND', false), false, 'Intermission chat is unmuted');
  assert.strictEqual(shouldAutoMute('FINAL_RESULTS', true), false, 'Final results podium is unmuted');
});

test('Voice Mute State Sync: Muted peers set maintains peer mute status correctly', () => {
  const mutedPeers = new Set<string>();

  const handleMuteSignal = (fromPlayerId: string, isMuted: boolean) => {
    if (isMuted) {
      mutedPeers.add(fromPlayerId);
    } else {
      mutedPeers.delete(fromPlayerId);
    }
  };

  handleMuteSignal('player_123', true);
  assert.strictEqual(mutedPeers.has('player_123'), true, 'Peer marked muted');

  handleMuteSignal('player_123', false);
  assert.strictEqual(mutedPeers.has('player_123'), false, 'Peer unmuted');
});
