"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StickyBottomCtaProps {
  onClick: () => void;
}

export function StickyBottomCta({ onClick }: StickyBottomCtaProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ctaTargets = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href="/agents"]:not([data-sticky-bottom-cta="true"])'),
    );

    if (ctaTargets.length === 0) {
      return;
    }

    const visibleTargets = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleTargets.add(entry.target);
          } else {
            visibleTargets.delete(entry.target);
          }
        });

        setIsVisible(visibleTargets.size === 0);
      },
      {
        threshold: 0.2,
      },
    );

    ctaTargets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 mx-auto w-full max-w-[520px] px-4 sm:px-6">
      <div className="pointer-events-auto rounded-2xl border border-[#b8bdfd] bg-white/90 p-2 backdrop-blur">
        <Link
          href="/agents"
          onClick={onClick}
          data-sticky-bottom-cta="true"
          className="flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#10b981] px-4 text-base font-bold text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 cursor-pointer"
        >
          Go to Plans & Activate
        </Link>
      </div>
    </div>
  );
}
