'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Home, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black font-display text-white">
          404 — Sector Uncharted
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The arena duel or coordinates you were searching for does not exist in the Quiz Arena network.
        </p>
      </div>

      <Link href="/">
        <Button variant="arena" size="lg">
          <Home className="w-4 h-4 mr-2" />
          Return to Arena Home
        </Button>
      </Link>
    </div>
  );
}
