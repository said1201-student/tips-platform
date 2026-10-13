"use client";

import { useEffect, useState } from "react";

export default function HeroSlideshow({ images, interval = 6000 }) {
  const count = images?.length || 0;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(timer);
  }, [count, interval]);

  if (count === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((img, i) => {
        const Inner = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.image}
            alt={img.title || "Sports background"}
            className="h-full w-full object-cover"
          />
        );
        return (
          <div
            key={img.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {img.link ? (
              <a
                href={img.link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="block h-full w-full"
              >
                {Inner}
              </a>
            ) : (
              Inner
            )}
          </div>
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/50" />

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}