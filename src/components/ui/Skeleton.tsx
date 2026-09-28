import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80',
        className
      )}
      {...props}
    />
  );
}

export function TopicCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 space-y-3">
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
    </div>
  );
}

export function QuestionSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
