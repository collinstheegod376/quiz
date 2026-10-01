'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, Twitter, MessageCircle } from 'lucide-react';

interface Props {
  player: string;
  topicName: string;
  score: string;
  grade: string;
  accuracy: string;
}

export function ShareButtonClient({
  player,
  topicName,
  score,
  grade,
  accuracy,
}: Props) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://anizuki.sbs/share/result`;
  };

  const handleCopy = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    const shareText = `I scored ${score} XP (Grade ${grade}) in ${topicName} with ${accuracy}% accuracy on AniZuki! Can you beat me?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${player}'s AniZuki Score: ${score} XP`,
          text: shareText,
          url,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopy();
    }
  };

  const shareText = encodeURIComponent(
    `I scored ${score} XP (Grade ${grade}) in ${topicName} with ${accuracy}% accuracy on AniZuki! Can you beat me?`
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-nunito font-extrabold text-[#595955] dark:text-[#A4A3A3]">
        <span>Share Your High Score</span>
        {copied && <span className="text-emerald-600 dark:text-emerald-400 font-bold">Link copied to clipboard!</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-nunito font-black text-xs transition-colors shadow-sm cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Card</span>
        </button>

        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(
            typeof window !== 'undefined' ? window.location.href : 'https://anizuki.sbs'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1DA1F2]/15 hover:bg-[#1DA1F2]/25 text-[#1DA1F2] border border-[#1DA1F2]/30 font-nunito font-black text-xs transition-colors cursor-pointer"
        >
          <Twitter className="w-4 h-4" />
          <span>Post on X</span>
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white border border-[#CECCC5] dark:border-[#363535] font-nunito font-black text-xs transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}
