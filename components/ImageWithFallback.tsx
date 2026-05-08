"use client";

import { useState } from "react";

interface Props {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImageWithFallback({ src, alt, className = "" }: Props) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`object-cover bg-gray-100 ${className}`}
      onError={() => setError(true)}
    />
  );
}
