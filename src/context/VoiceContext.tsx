'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useGame } from './GameContext';
import { supabase } from '@/lib/supabase';
import { sound } from '@/lib/sound';

interface VoiceSignal {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface VoiceContextType {
  isVoiceJoined: boolean;
  isMicMuted: boolean;
  isDeafened: boolean;
  isConnecting: boolean;
  hasMicPermissionError: boolean;
  micErrorMessage: string | null;
  voiceError: string | null;
  isQuestionAutoMuted: boolean;
  activeSpeakers: Set<string>;
  peersInVoice: Set<string>;
  mutedPeers: Set<string>;
  audioLevel: number; // 0 to 100 for local mic visualizer
  joinVoice: () => Promise<void>;
  leaveVoice: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  isPlayerSpeaking: (playerId: string) => boolean;
  isPlayerInVoice: (playerId: string) => boolean;
  isPlayerMuted: (playerId: string) => boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// Helper to configure ICE servers dynamically with TURNS (TLS) and custom env credentials
const getIceServers = (): RTCIceServer[] => {
  const customTurnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  const customTurnUser = process.env.NEXT_PUBLIC_TURN_USER;
  const customTurnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

  const servers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ];

  if (customTurnUrl && customTurnUser && customTurnCredential) {
    servers.push({
      urls: customTurnUrl,
      username: customTurnUser,
      credential: customTurnCredential,
    });
  } else {
    // Open Relay Project with both TLS TURNS and standard TURN relays
    servers.push(
      {
        urls: 'turns:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      }
    );
  }

  return servers;
};

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { room, currentPlayer } = useGame();

  const [isVoiceJoined, setIsVoiceJoined] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMicPermissionError, setHasMicPermissionError] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [activeSpeakers, setActiveSpeakers] = useState<Set<string>>(new Set());
  const [peersInVoice, setPeersInVoice] = useState<Set<string>>(new Set());
  const [mutedPeers, setMutedPeers] = useState<Set<string>>(new Set());
  const [audioLevel, setAudioLevel] = useState(0);
  const [isQuestionAutoMuted, setIsQuestionAutoMuted] = useState(false);

  // Audio & WebRTC references
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // Perfect Negotiation state trackers per peer
  const makingOfferRef = useRef<Map<string, boolean>>(new Map());
  const ignoreOfferRef = useRef<Map<string, boolean>>(new Map());

  // Mute state override flag during question phase
  const manualMuteOverrideRef = useRef<boolean>(false);
  const wasMutedBeforeQuestionRef = useRef<boolean>(false);

  // Channels
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const realtimeChannelRef = useRef<any>(null);
  const localBroadcastRef = useRef<BroadcastChannel | null>(null);

  // Keep refs to state for async event handlers
  const isMicMutedRef = useRef(isMicMuted);
  const isDeafenedRef = useRef(isDeafened);
  const isVoiceJoinedRef = useRef(isVoiceJoined);
  const currentPlayerRef = useRef(currentPlayer);
  const lastKnownPlayerIdRef = useRef<string | null>(currentPlayer?.id || null);
  const roomRef = useRef(room);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    isDeafenedRef.current = isDeafened;
  }, [isDeafened]);

  useEffect(() => {
    isVoiceJoinedRef.current = isVoiceJoined;
  }, [isVoiceJoined]);

  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
    if (currentPlayer?.id) {
      lastKnownPlayerIdRef.current = currentPlayer.id;
    }
  }, [currentPlayer]);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // ─── Broadcast Signaling Helper ──────────────────────────────────────────
  const broadcastSignal = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      const activeId = payload.fromPlayerId || currentPlayerRef.current?.id || lastKnownPlayerIdRef.current;
      const fullPayload = {
        ...payload,
        fromPlayerId: activeId,
        timestamp: Date.now(),
      };

      // 1. Supabase Realtime channel broadcast (multi-device)
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event,
          payload: fullPayload,
        });
      }

      // 2. Browser BroadcastChannel fallback (same machine / multi-tab)
      if (localBroadcastRef.current) {
        localBroadcastRef.current.postMessage({
          event,
          payload: fullPayload,
        });
      }
    },
    []
  );

  // ─── Clean Up A Specific Peer Connection & Remote Audio ─────────────────
  const cleanUpPeer = useCallback((peerId: string) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }

    const audioEl = remoteAudioElementsRef.current.get(peerId);
    if (audioEl) {
      try {
        audioEl.pause();
        audioEl.srcObject = null;
        if (audioEl.parentNode) {
          audioEl.parentNode.removeChild(audioEl);
        }
      } catch {
        // Safe DOM removal
      }
      remoteAudioElementsRef.current.delete(peerId);
    }

    pendingCandidatesRef.current.delete(peerId);
    makingOfferRef.current.delete(peerId);
    ignoreOfferRef.current.delete(peerId);

    setPeersInVoice((prev) => {
      const next = new Set(prev);
      next.delete(peerId);
      return next;
    });
    setActiveSpeakers((prev) => {
      const next = new Set(prev);
      next.delete(peerId);
      return next;
    });
    setMutedPeers((prev) => {
      const next = new Set(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  // ─── Create or Get Peer Connection (with Perfect Negotiation) ─────────────
  const getOrCreatePeerConnection = useCallback(
    (targetPeerId: string): RTCPeerConnection => {
      const existing = peerConnectionsRef.current.get(targetPeerId);
      if (existing && existing.connectionState !== 'closed' && existing.connectionState !== 'failed') {
        return existing;
      }

      if (existing) {
        cleanUpPeer(targetPeerId);
      }

      const pc = new RTCPeerConnection({
        iceServers: getIceServers(),
        iceCandidatePoolSize: 6,
      });

      // Bind local audio track if present
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // ICE Candidate dispatch
      pc.onicecandidate = (event) => {
        if (event.candidate && (currentPlayerRef.current || lastKnownPlayerIdRef.current)) {
          broadcastSignal('voice-signal', {
            toPlayerId: targetPeerId,
            signal: {
              type: 'candidate',
              candidate: event.candidate.toJSON(),
            },
          });
        }
      };

      // Remote track arrival (Safari/iOS compatible DOM attachment)
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0] || new MediaStream([event.track]);
        let audioEl = remoteAudioElementsRef.current.get(targetPeerId);

        if (!audioEl) {
          audioEl = new Audio();
          audioEl.autoplay = true;
          // Required for iOS Safari WebKit inline audio playback
          audioEl.setAttribute('playsinline', 'true');
          audioEl.setAttribute('webkit-playsinline', 'true');
          audioEl.style.display = 'none';

          if (typeof document !== 'undefined' && document.body) {
            document.body.appendChild(audioEl);
          }

          audioEl.volume = isDeafenedRef.current ? 0 : 1;
          remoteAudioElementsRef.current.set(targetPeerId, audioEl);
        }

        audioEl.srcObject = remoteStream;
        audioEl.play().catch((playErr) => {
          console.warn('[Voice] Remote audio play policy deferred:', playErr);
        });

        setPeersInVoice((prev) => new Set([...prev, targetPeerId]));
      };

      // Peer Connection state tracking & auto-recovery
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === 'failed') {
          console.warn(`[WebRTC] Connection failed with ${targetPeerId}, attempting ICE restart`);
          try {
            pc.restartIce();
          } catch {
            cleanUpPeer(targetPeerId);
          }
        } else if (state === 'closed' || state === 'disconnected') {
          if (state === 'closed') {
            cleanUpPeer(targetPeerId);
          }
          setActiveSpeakers((prev) => {
            const next = new Set(prev);
            next.delete(targetPeerId);
            return next;
          });
        }
      };

      peerConnectionsRef.current.set(targetPeerId, pc);
      return pc;
    },
    [broadcastSignal, cleanUpPeer]
  );

  // ─── Initiate Call to Peer (SDP Offer) ────────────────────────────────────
  const initiateCallToPeer = useCallback(
    async (targetPeerId: string) => {
      try {
        const pc = getOrCreatePeerConnection(targetPeerId);
        makingOfferRef.current.set(targetPeerId, true);

        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
        });

        // Safeguard state before setting local description
        if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
          return;
        }

        await pc.setLocalDescription(offer);

        broadcastSignal('voice-signal', {
          toPlayerId: targetPeerId,
          signal: {
            type: 'offer',
            sdp: offer,
          },
        });
      } catch (err) {
        console.warn('Failed to initiate voice call to peer:', targetPeerId, err);
      } finally {
        makingOfferRef.current.set(targetPeerId, false);
      }
    },
    [broadcastSignal, getOrCreatePeerConnection]
  );

  // ─── Handle Incoming Voice Signal (Perfect Negotiation Pattern) ───────────
  const handleIncomingSignal = useCallback(
    async (data: {
      fromPlayerId: string;
      toPlayerId?: string;
      signal: VoiceSignal;
    }) => {
      const activePlayer = currentPlayerRef.current;
      if (!activePlayer || !isVoiceJoinedRef.current) return;
      if (data.fromPlayerId === activePlayer.id) return;
      if (data.toPlayerId && data.toPlayerId !== activePlayer.id) return;

      // Security check: Drop signals from unknown players not registered in room
      const activeRoom = roomRef.current;
      if (activeRoom && !activeRoom.players.some((p) => p.id === data.fromPlayerId)) {
        console.warn('[Voice Security] Ignored signal from unauthorized sender:', data.fromPlayerId);
        return;
      }

      const peerId = data.fromPlayerId;
      const { signal } = data;

      try {
        if (signal.type === 'offer' && signal.sdp) {
          const pc = getOrCreatePeerConnection(peerId);

          // Perfect Negotiation: Polite peer has lexicographically larger ID
          const isPolite = activePlayer.id > peerId;
          const isOfferCollision =
            makingOfferRef.current.get(peerId) || pc.signalingState !== 'stable';

          ignoreOfferRef.current.set(peerId, !isPolite && isOfferCollision);

          if (ignoreOfferRef.current.get(peerId)) {
            console.log('[WebRTC] Impolite peer ignored colliding offer from', peerId);
            return;
          }

          if (isOfferCollision && isPolite) {
            console.log('[WebRTC] Polite peer rolling back colliding local offer for', peerId);
            await pc.setLocalDescription({ type: 'rollback' });
          }

          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          // Drain buffered candidates
          const queued = pendingCandidatesRef.current.get(peerId);
          if (queued && queued.length > 0) {
            for (const cand of queued) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
            pendingCandidatesRef.current.delete(peerId);
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          broadcastSignal('voice-signal', {
            toPlayerId: peerId,
            signal: {
              type: 'answer',
              sdp: answer,
            },
          });

          setPeersInVoice((prev) => new Set([...prev, peerId]));
        } else if (signal.type === 'answer' && signal.sdp) {
          const pc = peerConnectionsRef.current.get(peerId);
          if (pc && pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

            // Drain buffered candidates
            const queued = pendingCandidatesRef.current.get(peerId);
            if (queued && queued.length > 0) {
              for (const cand of queued) {
                await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
              }
              pendingCandidatesRef.current.delete(peerId);
            }

            setPeersInVoice((prev) => new Set([...prev, peerId]));
          }
        } else if (signal.type === 'candidate' && signal.candidate) {
          const pc = peerConnectionsRef.current.get(peerId);
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
          } else {
            // Buffer candidate until remote description is ready
            const list = pendingCandidatesRef.current.get(peerId) || [];
            list.push(signal.candidate);
            pendingCandidatesRef.current.set(peerId, list);
          }
        }
      } catch (err) {
        console.warn('Error handling incoming voice signal:', err);
      }
    },
    [broadcastSignal, getOrCreatePeerConnection]
  );

  // ─── Leave Voice Chat (Full teardown) ─────────────────────────────────────
  const leaveVoice = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch {
        // Safe close
      }
      audioContextRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Safe stop
        }
      });
      localStreamRef.current = null;
    }

    // Close all peer connections cleanly
    peerConnectionsRef.current.forEach((pc) => {
      try {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        pc.close();
      } catch {
        // Safe close
      }
    });
    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();
    makingOfferRef.current.clear();
    ignoreOfferRef.current.clear();

    // Clean up DOM audio elements
    remoteAudioElementsRef.current.forEach((el) => {
      try {
        el.pause();
        el.srcObject = null;
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      } catch {
        // Safe removal
      }
    });
    remoteAudioElementsRef.current.clear();

    const senderId = currentPlayerRef.current?.id || lastKnownPlayerIdRef.current;
    if (senderId) {
      broadcastSignal('voice-left', { fromPlayerId: senderId });
    }

    setIsVoiceJoined(false);
    setIsMicMuted(false);
    setIsDeafened(false);
    setIsQuestionAutoMuted(false);
    setAudioLevel(0);
    setActiveSpeakers(new Set());
    setPeersInVoice(new Set());
    setMutedPeers(new Set());
    setVoiceError(null);
    manualMuteOverrideRef.current = false;
    sound.playClick();
  }, [broadcastSignal]);

  // ─── Subscribe to Voice Channel for Room ─────────────────────────────────
  useEffect(() => {
    if (!room || !currentPlayer) {
      if (isVoiceJoinedRef.current) {
        leaveVoice();
      }
      return;
    }

    const roomCode = room.code;
    const channelName = `voice-arena-${roomCode}`;

    const handleSignalDispatch = (evtName: string, payload: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = payload as any;
      const myId = currentPlayerRef.current?.id || lastKnownPlayerIdRef.current;
      if (!data || data.fromPlayerId === myId) return;

      // Drop signals from players not in current room roster
      if (roomRef.current && !roomRef.current.players.some((p) => p.id === data.fromPlayerId)) {
        return;
      }

      if (evtName === 'voice-signal') {
        handleIncomingSignal(data);
      } else if (evtName === 'voice-joined') {
        const peerId = data.fromPlayerId;
        setPeersInVoice((prev) => new Set([...prev, peerId]));

        // If I am joined in voice and my ID is smaller, initiate the offer
        if (isVoiceJoinedRef.current && myId && myId < peerId) {
          initiateCallToPeer(peerId);
        } else if (isVoiceJoinedRef.current && myId && myId > peerId) {
          // Acknowledge my presence to the new joiner so they know I'm in voice
          broadcastSignal('voice-joined', {
            playerName: currentPlayerRef.current?.displayName || 'Player',
          });
        }
      } else if (evtName === 'voice-left') {
        const peerId = data.fromPlayerId;
        cleanUpPeer(peerId);
      } else if (evtName === 'voice-speaking') {
        const { fromPlayerId, isSpeaking } = data;
        setActiveSpeakers((prev) => {
          const next = new Set(prev);
          if (isSpeaking) {
            next.add(fromPlayerId);
          } else {
            next.delete(fromPlayerId);
          }
          return next;
        });
      } else if (evtName === 'voice-muted') {
        const { fromPlayerId, isMuted } = data;
        setMutedPeers((prev) => {
          const next = new Set(prev);
          if (isMuted) {
            next.add(fromPlayerId);
          } else {
            next.delete(fromPlayerId);
          }
          return next;
        });
      }
    };

    // 1. Setup Local Broadcast Channel (instant multi-tab fallback)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel(channelName);
      bc.onmessage = (event) => {
        const { event: evtName, payload } = event.data;
        handleSignalDispatch(evtName, payload);
      };
      localBroadcastRef.current = bc;
    }

    // 2. Setup Supabase Realtime Broadcast (remote devices)
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false, ack: false },
      },
    });

    channel
      .on('broadcast', { event: 'voice-signal' }, ({ payload }) => {
        handleSignalDispatch('voice-signal', payload);
      })
      .on('broadcast', { event: 'voice-joined' }, ({ payload }) => {
        handleSignalDispatch('voice-joined', payload);
      })
      .on('broadcast', { event: 'voice-left' }, ({ payload }) => {
        handleSignalDispatch('voice-left', payload);
      })
      .on('broadcast', { event: 'voice-speaking' }, ({ payload }) => {
        handleSignalDispatch('voice-speaking', payload);
      })
      .on('broadcast', { event: 'voice-muted' }, ({ payload }) => {
        handleSignalDispatch('voice-muted', payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && isVoiceJoinedRef.current) {
          // Re-announce presence on channel reconnection
          broadcastSignal('voice-joined', {
            playerName: currentPlayerRef.current?.displayName || 'Player',
          });
        }
      });

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (localBroadcastRef.current) {
        localBroadcastRef.current.close();
        localBroadcastRef.current = null;
      }
    };
  }, [
    room?.code,
    currentPlayer?.id,
    handleIncomingSignal,
    initiateCallToPeer,
    leaveVoice,
    cleanUpPeer,
    broadcastSignal,
  ]);

  // ─── Setup Local Microphone & Volume Meter ───────────────────────────────
  const startAudioAnalyzer = async (stream: MediaStream) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let wasSpeaking = false;
      let silenceCounter = 0;
      let lastLevel = 0;

      const checkVolume = () => {
        if (!analyserRef.current || !isVoiceJoinedRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        // Render optimization: Only update state when there's a significant change
        if (Math.abs(normalized - lastLevel) >= 3 || (normalized === 0 && lastLevel !== 0)) {
          lastLevel = normalized;
          setAudioLevel(normalized);
        }

        const isSpeakingNow = normalized > 14 && !isMicMutedRef.current && !isQuestionAutoMuted;

        if (isSpeakingNow) {
          silenceCounter = 0;
          if (!wasSpeaking && currentPlayerRef.current) {
            wasSpeaking = true;
            setActiveSpeakers((prev) => new Set([...prev, currentPlayerRef.current!.id]));
            broadcastSignal('voice-speaking', { isSpeaking: true });
          }
        } else {
          silenceCounter++;
          if (silenceCounter > 8 && wasSpeaking && currentPlayerRef.current) {
            wasSpeaking = false;
            setActiveSpeakers((prev) => {
              const next = new Set(prev);
              next.delete(currentPlayerRef.current!.id);
              return next;
            });
            broadcastSignal('voice-speaking', { isSpeaking: false });
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Web Audio analyzer initialization notice:', e);
    }
  };

  // ─── Join Voice Chat ─────────────────────────────────────────────────────
  const joinVoice = async () => {
    if (!room || !currentPlayer || isVoiceJoined) return;
    setIsConnecting(true);
    setHasMicPermissionError(false);
    setMicErrorMessage(null);
    setVoiceError(null);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setMicErrorMessage('WebRTC voice chat requires a secure browser context (HTTPS or localhost).');
        setHasMicPermissionError(true);
        return;
      }

      // Voice-optimized audio constraints (mono, 48kHz, echo cancellation)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
        },
        video: false,
      });

      localStreamRef.current = stream;

      // Handle hardware unplug mid-call
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.onended = () => {
          console.warn('[Voice] Local microphone hardware disconnected');
          setMicErrorMessage('Microphone disconnected or hardware unplugged.');
          setHasMicPermissionError(true);
          leaveVoice();
        };
      }

      setIsVoiceJoined(true);
      setIsMicMuted(false);
      manualMuteOverrideRef.current = false;
      sound.playClick();

      // Start volume monitor & resume AudioContext inside user gesture
      await startAudioAnalyzer(stream);

      // Broadcast join to existing peers
      broadcastSignal('voice-joined', {
        playerName: currentPlayer.displayName,
      });
    } catch (err: unknown) {
      console.error('Failed to access microphone:', err);
      const errorObj = err as Error;
      if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
        setMicErrorMessage('Microphone access blocked. Please enable microphone permission in your browser URL bar.');
      } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
        setMicErrorMessage('No microphone detected. Please connect a headset or microphone.');
      } else if (errorObj.name === 'NotReadableError' || errorObj.name === 'TrackStartError') {
        setMicErrorMessage('Microphone is in use by another application.');
      } else {
        setMicErrorMessage('Unable to access microphone: ' + (errorObj.message || 'Unknown error'));
      }
      setHasMicPermissionError(true);
    } finally {
      setIsConnecting(false);
    }
  };

  // ─── Lifecycle & Cleanup Listeners (Unload, Navigation, Device Change) ────
  useEffect(() => {
    const handlePageUnload = () => {
      if (isVoiceJoinedRef.current) {
        const senderId = currentPlayerRef.current?.id || lastKnownPlayerIdRef.current;
        if (senderId) {
          broadcastSignal('voice-left', { fromPlayerId: senderId });
        }
      }
    };

    window.addEventListener('beforeunload', handlePageUnload);
    window.addEventListener('pagehide', handlePageUnload);

    const handleDeviceChange = async () => {
      if (isVoiceJoinedRef.current && localStreamRef.current) {
        console.log('[Voice] Device change detected');
      }
    };

    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    }

    return () => {
      window.removeEventListener('beforeunload', handlePageUnload);
      window.removeEventListener('pagehide', handlePageUnload);
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
      if (isVoiceJoinedRef.current) {
        leaveVoice();
      }
    };
  }, [broadcastSignal, leaveVoice]);

  // Auto-leave voice when room closes, user leaves room, or user logs out
  useEffect(() => {
    if ((!room || !currentPlayer) && isVoiceJoinedRef.current) {
      leaveVoice();
    }
  }, [room, currentPlayer, leaveVoice]);

  // ─── Synchronize Mic Mute with Question Reading Phase ─────────────────────
  // Auto-suppress mic only during active question answering (exempt early finishers on Waiting Screen)
  useEffect(() => {
    if (!isVoiceJoined) return;

    const isPlayerStillAnswering =
      room?.status === 'QUESTION' &&
      !currentPlayer?.isFinished &&
      currentPlayer?.status !== 'finished';

    if (isPlayerStillAnswering && !manualMuteOverrideRef.current) {
      wasMutedBeforeQuestionRef.current = isMicMutedRef.current;
      setIsQuestionAutoMuted(true);
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      if (currentPlayer) {
        broadcastSignal('voice-speaking', { isSpeaking: false });
      }
    } else if (!isPlayerStillAnswering) {
      setIsQuestionAutoMuted(false);
      // Restore mic hardware state to whatever it was before the question
      if (localStreamRef.current && !wasMutedBeforeQuestionRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !isMicMutedRef.current;
        });
      }
    }
  }, [room?.status, currentPlayer?.isFinished, currentPlayer?.status, isVoiceJoined, broadcastSignal, currentPlayer]);

  // ─── Toggle Mute ─────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const next = !isMicMuted;

    // Record manual override if user deliberately changes mute during a question
    if (isQuestionAutoMuted) {
      manualMuteOverrideRef.current = true;
      setIsQuestionAutoMuted(false);
    }

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });

    setIsMicMuted(next);
    sound.playClick();

    const myId = currentPlayer?.id || lastKnownPlayerIdRef.current;
    if (next && myId) {
      setActiveSpeakers((prev) => {
        const set = new Set(prev);
        set.delete(myId);
        return set;
      });
      broadcastSignal('voice-speaking', { isSpeaking: false });
    }

    // Broadcast mute state sync to peers
    broadcastSignal('voice-muted', { isMuted: next });
  };

  // ─── Toggle Deafen (Auto-mutes local mic when deafened) ───────────────────
  const toggleDeafen = () => {
    const nextDeafen = !isDeafened;
    setIsDeafened(nextDeafen);
    sound.playClick();

    remoteAudioElementsRef.current.forEach((audioEl) => {
      audioEl.volume = nextDeafen ? 0 : 1;
    });

    // Gaming standard (Discord convention): auto-mute self when deafened
    if (nextDeafen && !isMicMuted) {
      toggleMute();
    }
  };

  // ─── Helper Queries ──────────────────────────────────────────────────────
  const isPlayerSpeaking = (playerId: string) => {
    return activeSpeakers.has(playerId);
  };

  const isPlayerInVoice = (playerId: string) => {
    if (currentPlayer && playerId === currentPlayer.id) {
      return isVoiceJoined;
    }
    return peersInVoice.has(playerId);
  };

  const isPlayerMuted = (playerId: string) => {
    if (currentPlayer && playerId === currentPlayer.id) {
      return isMicMuted;
    }
    return mutedPeers.has(playerId);
  };

  return (
    <VoiceContext.Provider
      value={{
        isVoiceJoined,
        isMicMuted,
        isDeafened,
        isConnecting,
        hasMicPermissionError,
        micErrorMessage,
        voiceError,
        isQuestionAutoMuted,
        activeSpeakers,
        peersInVoice,
        mutedPeers,
        audioLevel,
        joinVoice,
        leaveVoice,
        toggleMute,
        toggleDeafen,
        isPlayerSpeaking,
        isPlayerInVoice,
        isPlayerMuted,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
