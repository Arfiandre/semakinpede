"use client";

import { useEffect, useRef, type ReactNode } from "react";

type AnimationType =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-in"
  | "scale-up"
  | "zoom-in";

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export default function AnimateOnScroll({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  className = "",
  once = true,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.style.transitionDuration = `${duration}ms`;
          el.classList.add("animate-visible");
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove("animate-visible");
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, duration, threshold, once]);

  const baseStyles =
    "opacity-0 will-change-transform transition-all ease-out";

  const animationMap: Record<AnimationType, string> = {
    "fade-up": "translate-y-8",
    "fade-down": "-translate-y-8",
    "fade-left": "translate-x-8",
    "fade-right": "-translate-x-8",
    "fade-in": "",
    "scale-up": "scale-95",
    "zoom-in": "scale-90",
  };

  const hiddenClass = animationMap[animation] || "translate-y-8";

  return (
    <div
      ref={ref}
      className={`${baseStyles} ${hiddenClass} [&.animate-visible]:!opacity-100 [&.animate-visible]:!translate-x-0 [&.animate-visible]:!translate-y-0 [&.animate-visible]:!scale-100 ${className}`}
    >
      {children}
    </div>
  );
}
