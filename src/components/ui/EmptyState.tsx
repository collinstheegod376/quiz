'use client';

import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[#CECCC5] dark:border-[#363535] bg-[#E5E3DB]/30 dark:bg-[#1E1D1D]/40">
      <div className="w-16 h-16 rounded-2xl bg-[#B9843E]/10 dark:bg-[#B9843E]/15 flex items-center justify-center text-[#B9843E] dark:text-[#FFC679] mb-4 ring-8 ring-[#B9843E]/5">
        <Icon className="w-8 h-8" strokeWidth={1.75} />
      </div>
      <h3 className="text-lg font-nunito font-black text-black dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm font-roboto text-[#595955] dark:text-[#A4A3A3] max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
