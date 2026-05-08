"use client";

import { sanitizeHTML } from "@/lib/sanitize";

interface Props {
  html: string;
  className?: string;
}

export default function SafeHTML({ html, className = "" }: Props) {
  const clean = sanitizeHTML(html);
  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
