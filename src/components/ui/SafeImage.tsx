'use client';

import React, { useState, useEffect } from 'react';

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
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#E5E3DB] text-[#595955] p-2 text-center select-none">
        <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-black font-nunito font-black text-xs mb-1">
          ✦
        </div>
        <span className="text-[11px] font-bold line-clamp-1 text-[#595955]">{alt}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#E5E3DB]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        className={`w-full h-full object-cover ${className}`}
        {...props}
      />
    </div>
  );
}
