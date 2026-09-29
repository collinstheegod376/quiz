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
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
  activeSpeakers: Set<string>;
  peersInVoice: Set<string>;
  audioLevel: number; // 0 to 100 for local mic visualizer
  joinVoice: () => Promise<void>;
  leaveVoice: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  isPlayerSpeaking: (playerId: string) => boolean;
  isPlayerInVoice: (playerId: string) => boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { room, currentPlayer } = useGame();

  const [isVoiceJoined, setIsVoiceJoined] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMicPermissionError, setHasMicPermissionError] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState<Set<string>>(new Set());
  const [peersInVoice, setPeersInVoice] = useState<Set<string>>(new Set());
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio & WebRTC references
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Channels
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const realtimeChannelRef = useRef<any>(null);
  const localBroadcastRef = useRef<BroadcastChannel | null>(null);

  // Keep ref to state for async event handlers
  const isMicMutedRef = useRef(isMicMuted);
  const isDeafenedRef = useRef(isDeafened);
  const isVoiceJoinedRef = useRef(isVoiceJoined);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    isDeafenedRef.current = isDeafened;
  }, [isDeafened]);

  useEffect(() => {
    isVoiceJoinedRef.current = isVoiceJoined;
  }, [isVoiceJoined]);

  // ─── Broadcast Signaling Helper ──────────────────────────────────────────
  const broadcastSignal = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      const fullPayload = {
        ...payload,
        fromPlayerId: currentPlayer?.id,
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
    [currentPlayer?.id]
  );

  // ─── Create or Get Peer Connection ───────────────────────────────────────
  const getOrCreatePeerConnection = useCallback(
    (targetPeerId: string): RTCPeerConnection => {
      const existing = peerConnectionsRef.current.get(targetPeerId);
      if (existing && existing.connectionState !== 'closed') {
        return existing;
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);

      // Add local audio tracks to the peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // ICE Candidate generation
      pc.onicecandidate = (event) => {
        if (event.candidate && currentPlayer) {
          broadcastSignal('voice-signal', {
            toPlayerId: targetPeerId,
            signal: {
              type: 'candidate',
              candidate: event.candidate.toJSON(),
            },
          });
        }
      };

      // Handle receiving remote audio track
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        let audioEl = remoteAudioElementsRef.current.get(targetPeerId);

        if (!audioEl) {
          audioEl = new Audio();
          audioEl.autoplay = true;
          audioEl.volume = isDeafenedRef.current ? 0 : 1;
          remoteAudioElementsRef.current.set(targetPeerId, audioEl);
        }

        audioEl.srcObject = remoteStream;
        audioEl.play().catch(() => {
          // User interaction policy safe catch
        });

        // Add to voice roster
        setPeersInVoice((prev) => new Set([...prev, targetPeerId]));
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed'
        ) {
          setPeersInVoice((prev) => {
            const next = new Set(prev);
            next.delete(targetPeerId);
            return next;
          });
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
    [broadcastSignal, currentPlayer]
  );

  // ─── Initiate Connection to Peer ─────────────────────────────────────────
  const initiateCallToPeer = useCallback(
    async (targetPeerId: string) => {
      try {
        const pc = getOrCreatePeerConnection(targetPeerId);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
        });
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
      }
    },
    [broadcastSignal, getOrCreatePeerConnection]
  );

  // ─── Handle Incoming Voice Signal ────────────────────────────────────────
  const handleIncomingSignal = useCallback(
    async (data: {
      fromPlayerId: string;
      toPlayerId?: string;
      signal: VoiceSignal;
    }) => {
      if (!currentPlayer || !isVoiceJoinedRef.current) return;
      if (data.fromPlayerId === currentPlayer.id) return;
      if (data.toPlayerId && data.toPlayerId !== currentPlayer.id) return;

      const peerId = data.fromPlayerId;
      const { signal } = data;

      try {
        if (signal.type === 'offer' && signal.sdp) {
          const pc = getOrCreatePeerConnection(peerId);
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

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
            setPeersInVoice((prev) => new Set([...prev, peerId]));
          }
        } else if (signal.type === 'candidate' && signal.candidate) {
          const pc = peerConnectionsRef.current.get(peerId);
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.warn('Error handling incoming voice signal:', err);
      }
    },
    [broadcastSignal, currentPlayer, getOrCreatePeerConnection]
  );

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

    // 1. Setup Local Broadcast Channel (instant multi-tab)
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

    const handleSignalDispatch = (evtName: string, payload: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = payload as any;
      if (!data || data.fromPlayerId === currentPlayer.id) return;

      if (evtName === 'voice-signal') {
        handleIncomingSignal(data);
      } else if (evtName === 'voice-joined') {
        const peerId = data.fromPlayerId;
        setPeersInVoice((prev) => new Set([...prev, peerId]));

        // Deterministic offerer: If my ID is smaller, initiate the offer
        if (isVoiceJoinedRef.current && currentPlayer.id < peerId) {
          initiateCallToPeer(peerId);
        }
      } else if (evtName === 'voice-left') {
        const peerId = data.fromPlayerId;
        const pc = peerConnectionsRef.current.get(peerId);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(peerId);
        }
        const audioEl = remoteAudioElementsRef.current.get(peerId);
        if (audioEl) {
          audioEl.srcObject = null;
          remoteAudioElementsRef.current.delete(peerId);
        }
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
      }
    };

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
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (localBroadcastRef.current) {
        localBroadcastRef.current.close();
        localBroadcastRef.current = null;
      }
    };
  }, [room?.code, currentPlayer?.id, handleIncomingSignal, initiateCallToPeer]);

  // ─── Setup Local Microphone & Volume Meter ───────────────────────────────
  const startAudioAnalyzer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
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

      const checkVolume = () => {
        if (!analyserRef.current || !isVoiceJoinedRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

        const isSpeakingNow = normalized > 14 && !isMicMutedRef.current;

        if (isSpeakingNow) {
          silenceCounter = 0;
          if (!wasSpeaking && currentPlayer) {
            wasSpeaking = true;
            setActiveSpeakers((prev) => new Set([...prev, currentPlayer.id]));
            broadcastSignal('voice-speaking', { isSpeaking: true });
          }
        } else {
          silenceCounter++;
          if (silenceCounter > 8 && wasSpeaking && currentPlayer) {
            wasSpeaking = false;
            setActiveSpeakers((prev) => {
              const next = new Set(prev);
              next.delete(currentPlayer.id);
              return next;
            });
            broadcastSignal('voice-speaking', { isSpeaking: false });
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Web Audio analyzer not supported:', e);
    }
  };

  // ─── Join Voice Chat ─────────────────────────────────────────────────────
  const joinVoice = async () => {
    if (!room || !currentPlayer || isVoiceJoined) return;
    setIsConnecting(true);
    setHasMicPermissionError(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      localStreamRef.current = stream;
      setIsVoiceJoined(true);
      setIsMicMuted(false);
      sound.playClick();

      // Start volume monitor
      startAudioAnalyzer(stream);

      // Broadcast join to existing peers
      broadcastSignal('voice-joined', {
        playerName: currentPlayer.displayName,
      });

      // Initiate calls to existing peers in room if our ID is lower
      room.players.forEach((p) => {
        if (p.id !== currentPlayer.id && currentPlayer.id < p.id) {
          initiateCallToPeer(p.id);
        }
      });
    } catch (err) {
      console.error('Failed to access microphone:', err);
      setHasMicPermissionError(true);
    } finally {
      setIsConnecting(false);
    }
  };

  // ─── Leave Voice Chat ────────────────────────────────────────────────────
  const leaveVoice = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    // Clear remote audios
    remoteAudioElementsRef.current.forEach((el) => {
      el.srcObject = null;
    });
    remoteAudioElementsRef.current.clear();

    if (currentPlayer) {
      broadcastSignal('voice-left', {});
    }

    setIsVoiceJoined(false);
    setIsMicMuted(false);
    setIsDeafened(false);
    setAudioLevel(0);
    setActiveSpeakers(new Set());
    setPeersInVoice(new Set());
    sound.playClick();
  };

  // ─── Toggle Mute ─────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const next = !isMicMuted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setIsMicMuted(next);
    sound.playClick();

    if (next && currentPlayer) {
      setActiveSpeakers((prev) => {
        const set = new Set(prev);
        set.delete(currentPlayer.id);
        return set;
      });
      broadcastSignal('voice-speaking', { isSpeaking: false });
    }
  };

  // ─── Toggle Deafen ───────────────────────────────────────────────────────
  const toggleDeafen = () => {
    const next = !isDeafened;
    setIsDeafened(next);
    sound.playClick();

    remoteAudioElementsRef.current.forEach((audioEl) => {
      audioEl.volume = next ? 0 : 1;
    });
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

  return (
    <VoiceContext.Provider
      value={{
        isVoiceJoined,
        isMicMuted,
        isDeafened,
        isConnecting,
        hasMicPermissionError,
        activeSpeakers,
        peersInVoice,
        audioLevel,
        joinVoice,
        leaveVoice,
        toggleMute,
        toggleDeafen,
        isPlayerSpeaking,
        isPlayerInVoice,
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
