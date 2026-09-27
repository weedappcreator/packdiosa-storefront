"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
}

export function SplitText({
  text,
  className = "",
  as: Tag = "h2",
  delay = 0,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const words = el.querySelectorAll(".split-word");

    const ctx = gsap.context(() => {
      gsap.from(words, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [delay]);

  return (
    <Tag
      ref={
        ref as React.RefObject<
          HTMLElement &
            HTMLHeadingElement &
            HTMLParagraphElement &
            HTMLSpanElement
        >
      }
      className={className}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} className="split-word inline-block mr-[0.3em]">
          {word}
        </span>
      ))}
    </Tag>
  );
}
