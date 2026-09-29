'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0B0C10] text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md p-8 rounded-3xl bg-[#12141C] border border-slate-800 text-center space-y-4">
          <h2 className="text-2xl font-black">Critical Arena Error</h2>
          <p className="text-xs text-slate-400">{error?.message || 'Application encountered an unexpected error.'}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
