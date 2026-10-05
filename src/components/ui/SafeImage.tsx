'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
  className = '',
  sizes = '(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px',
  priority = false,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc && fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#E5E3DB] dark:bg-[#1E1D1D] text-[#595955] dark:text-[#A4A3A3] p-2 text-center select-none">
        <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center text-black dark:text-white font-nunito font-black text-xs mb-1">
          ✦
        </div>
        <span className="text-[11px] font-bold line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#E5E3DB] dark:bg-[#1E1D1D]">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={handleError}
        className={`object-cover ${className}`}
      />
    </div>
  );
}
