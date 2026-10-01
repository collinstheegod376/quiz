'use client';

import React from 'react';
import { useVoice } from '@/context/VoiceContext';
import { useGame } from '@/context/GameContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  PhoneOff,
  Radio,
  AlertCircle,
  Users,
} from 'lucide-react';

export function VoiceControlsBar() {
  const {
    isVoiceJoined,
    isMicMuted,
    isDeafened,
    isConnecting,
    hasMicPermissionError,
    isQuestionAutoMuted,
    audioLevel,
    joinVoice,
    leaveVoice,
    toggleMute,
    toggleDeafen,
    peersInVoice,
  } = useVoice();

  const { room, currentPlayer } = useGame();

  if (!room || !currentPlayer) return null;

  const totalInVoice = (isVoiceJoined ? 1 : 0) + peersInVoice.size;

  return (
    <div className="w-full border border-[#CECCC5] dark:border-[#363535] bg-[#FFFDF4] dark:bg-[#100F0F] rounded-2xl overflow-hidden transition-all shadow-sm">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-[#CECCC5] dark:border-[#363535] flex items-center justify-between bg-[#E5E3DB]/40 dark:bg-[#1E1D1D]/50">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isVoiceJoined
                ? 'bg-[#4CA471]/20 text-[#4CA471]'
                : 'bg-[#B9843E]/15 text-[#B9843E]'
            }`}
          >
            <Radio className={`w-4 h-4 ${isVoiceJoined ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-nunito font-black text-sm text-[#000000] dark:text-[#FEFEFD] tracking-tight">
                Lobby Voice Comms
              </h4>
              {isVoiceJoined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4CA471]/15 border border-[#4CA471]/30 font-nunito font-extrabold text-[11px] text-[#4CA471]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4CA471] animate-ping" />
                  Live
                </span>
              )}
            </div>
            <p className="font-roboto text-[11px] font-bold text-[#595955] dark:text-[#A4A3A3]">
              Sub-100ms real-time audio with rivals
            </p>
          </div>
        </div>

        {/* Voice Count Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] border border-[#CECCC5] dark:border-[#363535] text-[11px] font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3]">
          <Users className="w-3.5 h-3.5 text-[#B9843E]" />
          <span>
            {totalInVoice} {totalInVoice === 1 ? 'speaker' : 'speakers'}
          </span>
        </div>
      </div>

      {/* Body / Controls */}
      <div className="p-4 sm:p-5">
        {hasMicPermissionError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-nunito font-bold">
              Microphone access blocked. Please enable microphone permission in your browser URL bar.
            </span>
          </div>
        )}

        {/* Accessibility live region for voice status */}
        <div className="sr-only" aria-live="polite">
          {isVoiceJoined
            ? `Connected to voice chat with ${totalInVoice} speaker${totalInVoice === 1 ? '' : 's'}`
            : 'Voice chat disconnected'}
        </div>

        {!isVoiceJoined ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#595955] dark:text-[#A4A3A3] font-roboto">
              Join the lobby voice chat to talk strategy, banter, and celebrate victories directly.
            </div>

            <button
              type="button"
              onClick={joinVoice}
              disabled={isConnecting}
              aria-label="Connect to voice chat"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4CA471] hover:bg-[#439364] active:scale-95 text-white font-nunito font-black text-xs sm:text-sm rounded-full transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
            >
              {isConnecting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting Mic…</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Connect Voice</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual audio visualizer bar */}
            <div className="flex items-center gap-3">
              <span className="font-nunito text-[11px] font-extrabold uppercase text-[#595955] dark:text-[#A4A3A3] shrink-0">
                Mic Input
              </span>
              <div className="flex-1 h-2 rounded-full bg-[#E5E3DB] dark:bg-[#2A2929] overflow-hidden p-0.5 border border-[#CECCC5] dark:border-[#363535]">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    isQuestionAutoMuted || isMicMuted
                      ? 'bg-red-500 w-0'
                      : audioLevel > 20
                      ? 'bg-[#4CA471]'
                      : 'bg-[#B9843E]'
                  }`}
                  style={{ width: isQuestionAutoMuted || isMicMuted ? '0%' : `${Math.min(100, audioLevel * 1.5)}%` }}
                />
              </div>
              <span className="font-mono text-[10px] font-bold text-[#595955] dark:text-[#A4A3A3] w-20 text-right">
                {isQuestionAutoMuted ? 'GAME MUTE' : isMicMuted ? 'MUTED' : `${audioLevel}%`}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-2">
                {/* Mute Button */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-pressed={isMicMuted}
                  aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-nunito font-extrabold text-xs transition-all cursor-pointer border ${
                    isMicMuted
                      ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-sm'
                      : 'bg-[#E5E3DB] dark:bg-[#2A2929] hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white border-[#CECCC5] dark:border-[#363535]'
                  }`}
                  title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMicMuted ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-white" />
                      <span>Mic Muted</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-[#4CA471]" />
                      <span>Mic On</span>
                    </>
                  )}
                </button>

                {/* Deafen Button */}
                <button
                  type="button"
                  onClick={toggleDeafen}
                  aria-pressed={isDeafened}
                  aria-label={isDeafened ? 'Undeafen audio' : 'Deafen audio'}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-nunito font-extrabold text-xs transition-all cursor-pointer border ${
                    isDeafened
                      ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 shadow-sm'
                      : 'bg-[#E5E3DB] dark:bg-[#2A2929] hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white border-[#CECCC5] dark:border-[#363535]'
                  }`}
                  title={isDeafened ? 'Undeafen (Hear Rivals)' : 'Deafen (Mute Others)'}
                >
                  {isDeafened ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-white" />
                      <span>Deafened</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#23616A] dark:text-[#6FEEFF]" />
                      <span>Audio On</span>
                    </>
                  )}
                </button>
              </div>

              {/* Leave Voice Button */}
              <button
                type="button"
                onClick={leaveVoice}
                aria-label="Disconnect from voice chat"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-nunito font-bold text-xs bg-[#FF94AB]/15 hover:bg-[#FF94AB]/25 text-red-600 dark:text-red-400 border border-[#FF94AB]/40 transition-colors cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
