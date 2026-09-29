'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Quiz Arena App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0C10] text-[#F8FAFC]">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#12141C] border border-slate-800 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black font-display text-white">Something went wrong</h2>
          <p className="text-xs text-slate-400">
            {error?.message || 'An unexpected error occurred in the arena.'}
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Arena
        </button>
      </div>
    </div>
  );
}
