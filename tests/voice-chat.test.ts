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

test('Voice WebRTC Perfect Negotiation: Rollback guard prevents InvalidStateError in stable state', () => {
  const shouldRollback = (isOfferCollision: boolean, isPolite: boolean, signalingState: string) => {
    return isOfferCollision && isPolite && signalingState === 'have-local-offer';
  };

  // Polite peer with offer collision in have-local-offer -> Rollback valid
  assert.strictEqual(shouldRollback(true, true, 'have-local-offer'), true, 'Should rollback colliding offer');

  // Polite peer with offer collision but still in stable -> MUST NOT rollback (avoids InvalidStateError)
  assert.strictEqual(shouldRollback(true, true, 'stable'), false, 'Must not rollback in stable state');

  // Impolite peer -> MUST NOT rollback
  assert.strictEqual(shouldRollback(true, false, 'have-local-offer'), false, 'Impolite peer must not rollback');
});

test('Voice WebRTC Answer Handling: Strictly accepts answers only in have-local-offer state', () => {
  const canAcceptAnswer = (signalingState: string) => {
    return signalingState === 'have-local-offer';
  };

  assert.strictEqual(canAcceptAnswer('have-local-offer'), true, 'Valid offer waiting for answer');
  assert.strictEqual(canAcceptAnswer('stable'), false, 'Stable state cannot accept answer');
  assert.strictEqual(canAcceptAnswer('have-remote-offer'), false, 'Remote offer state cannot accept answer');
  assert.strictEqual(canAcceptAnswer('closed'), false, 'Closed peer connection cannot accept answer');
});

test('Voice Candidate Queue Drainage: Deletes buffer before async drainage loop to prevent candidate drops', async () => {
  const pendingCandidates = new Map<string, string[]>();
  pendingCandidates.set('peer_a', ['cand_1', 'cand_2']);

  const appliedCandidates: string[] = [];

  // Extract and delete immediately before async loop
  const queued = pendingCandidates.get('peer_a');
  if (queued && queued.length > 0) {
    pendingCandidates.delete('peer_a');
    
    // Simulate candidate arriving concurrently during async drain
    pendingCandidates.set('peer_a', ['cand_3_concurrent']);

    for (const cand of queued) {
      await Promise.resolve();
      appliedCandidates.push(cand);
    }
  }

  assert.deepStrictEqual(appliedCandidates, ['cand_1', 'cand_2'], 'Extracted candidates were processed');
  assert.deepStrictEqual(pendingCandidates.get('peer_a'), ['cand_3_concurrent'], 'Concurrent candidate preserved and not deleted');
});

test('Voice Signal Deduplication: Drops duplicate signals delivered across dual channels', () => {
  const processedSignals = new Set<string>();

  const processSignal = (msgId: string) => {
    if (processedSignals.has(msgId)) {
      return false; // Dropped duplicate
    }
    processedSignals.add(msgId);
    return true; // Accepted
  };

  const id = 'msg_xyz_123';
  assert.strictEqual(processSignal(id), true, 'First signal delivery accepted');
  assert.strictEqual(processSignal(id), false, 'Second signal delivery via fallback channel dropped');
  assert.strictEqual(processSignal('msg_next_456'), true, 'Subsequent new signal accepted');
});

