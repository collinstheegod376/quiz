'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
  className = '',
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasFailed, setHasFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setHasFailed(false);
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
      }
    }
  }, [currentSrc]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasFailed(true);
    }
  };

  if (hasFailed) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-[#E5E3DB] dark:bg-[#2A2929] text-[#595955] p-2 text-center select-none"
      >
        <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-black font-nunito font-black text-xs mb-1">
          ✦
        </div>
        <span className="text-[11px] font-bold line-clamp-1 text-[#595955]">{alt}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#E5E3DB] dark:bg-[#2A2929]">
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#E5E3DB] animate-pulse pointer-events-none" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        decoding="async"
        onError={handleError}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />
    </div>
  );
}
