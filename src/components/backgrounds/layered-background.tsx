'use client';

/**
 * LayeredBackground - AI-generated layered background images
 *
 * Displays 6 background images stacked vertically with spacing,
 * creating a parallax-like effect as users scroll down the page.
 */

import { useEffect, useState } from 'react';
import Image from 'next/image';

// All available AI-generated background images
const AI_BACKGROUNDS = [
  '/images/backgrounds/ai-generated/party-deck-sunset.png',
  '/images/backgrounds/ai-generated/lake-swimmers.png',
  '/images/backgrounds/ai-generated/floating-lilypads.png',
  '/images/backgrounds/ai-generated/boat-cove.png',
  '/images/backgrounds/ai-generated/water-slide-fun.png',
  '/images/backgrounds/ai-generated/drone-fleet-view.png',
  '/images/backgrounds/ai-generated/cocktails-deck.png',
  '/images/backgrounds/ai-generated/sunset-silhouette.png',
  '/images/backgrounds/ai-generated/underwater-bubbles.png',
  '/images/backgrounds/ai-generated/lake-reflection.png',
];

interface LayeredBackgroundProps {
  children: React.ReactNode;
  /** Number of images to display (default: 6) */
  imageCount?: number;
  /** Base opacity for images (default: 0.12) */
  opacity?: number;
  /** Enable parallax scroll effect (default: true) */
  parallax?: boolean;
}

export function LayeredBackground({
  children,
  imageCount = 6,
  opacity = 0.35,
  parallax = true,
}: LayeredBackgroundProps) {
  const [scrollY, setScrollY] = useState(0);
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);

  // Shuffle images on mount for variety
  useEffect(() => {
    const shuffled = [...AI_BACKGROUNDS].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled.slice(0, imageCount));
  }, [imageCount]);

  // Track scroll for parallax effect
  useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  // Calculate spacing between images (distribute evenly)
  const getImageStyle = (index: number) => {
    const spacing = 100 / (imageCount + 1);
    const topPosition = spacing * (index + 1);

    // Parallax: each layer moves at different speed
    const parallaxOffset = parallax ? scrollY * (0.1 - index * 0.015) : 0;

    // Alternate left/right positioning for visual interest
    const horizontalOffset = index % 2 === 0 ? '-5%' : '5%';

    // Decreasing opacity as you go down
    const layerOpacity = Math.max(opacity - index * 0.015, 0.05);

    return {
      top: `${topPosition}%`,
      transform: `translateY(${parallaxOffset}px) translateX(${horizontalOffset})`,
      opacity: layerOpacity,
    };
  };

  return (
    <div className="relative min-h-screen">
      {/* Background layer container */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: -1 }}
      >
        {/* Light gradient overlay for text readability - subtle so images show through */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40 z-10" />

        {/* Layered background images */}
        {shuffledImages.map((src, index) => (
          <div
            key={src}
            className="absolute w-[120%] h-[40vh] -left-[10%] will-change-transform"
            style={getImageStyle(index)}
          >
            {/* Individual image with gradient fade */}
            <div className="relative w-full h-full">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="120vw"
                priority={index < 2}
              />
              {/* Subtle fade edges for seamless blending */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
