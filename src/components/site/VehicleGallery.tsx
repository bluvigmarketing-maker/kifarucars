"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/cn";

type Slide = { type: "image" | "video"; url: string };

export function VehicleGallery({
  images,
  videoUrl,
  alt,
}: {
  images: string[];
  videoUrl?: string | null;
  alt: string;
}) {
  const slides: Slide[] = [
    ...images.map((url): Slide => ({ type: "image", url })),
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : []),
  ];
  const [active, setActive] = useState(0);
  const current = slides[active] ?? slides[0];

  if (!current) return null;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-charcoal-50 dark:bg-charcoal-800">
        {current.type === "video" ? (
          <video src={current.url} controls className="h-full w-full object-cover" />
        ) : (
          <Image src={current.url} alt={alt} fill className="object-cover" priority />
        )}
      </div>

      {slides.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {slides.map((slide, i) => (
            <button
              key={`${slide.type}-${slide.url}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={slide.type === "video" ? "Play video" : `Photo ${i + 1}`}
              className={cn(
                "relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2",
                active === i ? "border-burgundy-600 dark:border-burgundy-400" : "border-transparent"
              )}
            >
              {slide.type === "video" ? (
                <>
                  <video src={slide.url} muted className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={16} className="text-white" fill="currentColor" />
                  </span>
                </>
              ) : (
                <Image src={slide.url} alt="" fill className="object-cover" />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
