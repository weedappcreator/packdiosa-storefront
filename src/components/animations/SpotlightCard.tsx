"use client";

import { type MouseEvent, type ReactNode, useRef } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

export function SpotlightCard({
  children,
  className = "",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--spotlight-x", `${x}px`);
    card.style.setProperty("--spotlight-y", `${y}px`);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-lg border border-[#c8aa6e]/15 bg-[#1a2b3c] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(200,170,110,0.08)] ${className}`}
      style={{
        background: `radial-gradient(300px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(200,170,110,0.06), transparent 60%), #1a2b3c`,
      }}
    >
      {children}
    </div>
  );
}
