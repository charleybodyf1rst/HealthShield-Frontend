"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface DJBananaProps {
  className?: string;
}

export function DJBanana({ className = "" }: DJBananaProps) {
  const [isDancing, setIsDancing] = useState(true); // Start dancing immediately
  const [showDiscoBall, setShowDiscoBall] = useState(false);
  const [partyLights, setPartyLights] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-dance on page load - banana always dances!
  useEffect(() => {
    // Start with subtle dancing, no disco ball until clicked
    setIsDancing(true);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startDJMode = () => {
    if (hasInteracted) return; // Already in full party mode
    setHasInteracted(true);

    // Start the FULL party!
    setShowDiscoBall(true);
    setPartyLights(true);

    // Play DJ sound effect
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/audio/dj-party.mp3");
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(() => {
        // Audio play failed (autoplay policy), continue with visual
        console.log("Audio autoplay blocked - continuing with visual animation");
      });
    }

    // Stop party lights and disco after 12 seconds, but keep dancing
    timeoutRef.current = setTimeout(() => {
      stopDJMode();
    }, 12000);
  };

  const stopDJMode = () => {
    // Keep dancing, just stop the disco ball and lights
    setShowDiscoBall(false);
    setPartyLights(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <>
      {/* Party Lights Overlay */}
      {partyLights && (
        <div className="party-lights-overlay">
          <div className="party-light light-1" />
          <div className="party-light light-2" />
          <div className="party-light light-3" />
          <div className="party-light light-4" />
          <div className="party-light light-5" />
          <div className="party-light light-6" />
        </div>
      )}

      {/* Disco Ball */}
      {showDiscoBall && (
        <div className="disco-ball-container">
          <div className="disco-ball">
            <div className="disco-ball-inner">
              {/* Disco ball facets */}
              {[...Array(60)].map((_, i) => (
                <div
                  key={i}
                  className="facet"
                  style={{
                    transform: `rotateY(${(i % 10) * 36}deg) rotateX(${Math.floor(i / 10) * 30 - 75}deg) translateZ(30px)`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="disco-ball-light" />
        </div>
      )}

      {/* DJ Banana Mascot */}
      <div
        className={`dj-banana-wrapper ${isDancing ? "dancing" : ""} ${className}`}
        onClick={startDJMode}
        title={hasInteracted ? "Party time!" : "Click for full party mode!"}
      >
        {/* 3D Banana with shadow and depth */}
        <div className="banana-3d-container">
          <Image
            src="/images/logo/banana-logo.png"
            alt="DJ Banana - Party Mascot"
            width={150}
            height={150}
            className={`banana-mascot ${isDancing ? "dj-mode" : ""}`}
            priority
          />
          {/* DJ accessories when in full party mode */}
          {hasInteracted && (
            <>
              <div className="dj-headphones" />
              <div className="dj-sunglasses" />
            </>
          )}
        </div>

        {/* Click hint - show until clicked */}
        {!hasInteracted && (
          <div className="click-hint">
            <span>Party Mode!</span>
          </div>
        )}
      </div>

      <style jsx>{`
        /* DJ Banana Wrapper */
        .dj-banana-wrapper {
          position: fixed;
          bottom: 100px;
          right: 30px;
          z-index: 9999;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .dj-banana-wrapper:hover {
          transform: scale(1.15);
        }

        .dj-banana-wrapper.dancing {
          animation: dj-bounce 0.4s ease-in-out infinite;
        }

        /* 3D Banana Container */
        .banana-3d-container {
          position: relative;
          width: 150px;
          height: 150px;
          perspective: 500px;
        }

        .banana-mascot {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 15px 35px rgba(251, 146, 60, 0.5))
                  drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2));
          transition: all 0.3s ease;
          /* 3D effect with transform */
          transform-style: preserve-3d;
        }

        .banana-mascot:hover {
          filter: drop-shadow(0 20px 50px rgba(251, 146, 60, 0.7))
                  drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
        }

        .banana-mascot.dj-mode {
          animation: dj-dance 0.35s ease-in-out infinite;
        }

        /* DJ Accessories */
        .dj-headphones {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 90px;
          height: 25px;
          border: 5px solid #333;
          border-radius: 25px 25px 0 0;
          border-bottom: none;
          opacity: 0.8;
        }

        .dj-sunglasses {
          position: absolute;
          top: 45px;
          left: 50%;
          transform: translateX(-50%);
          width: 65px;
          height: 15px;
          background: linear-gradient(135deg, #333 0%, #666 100%);
          border-radius: 8px;
          opacity: 0.9;
        }

        .dj-sunglasses::before,
        .dj-sunglasses::after {
          content: '';
          position: absolute;
          top: 0;
          width: 26px;
          height: 15px;
          background: linear-gradient(135deg, #1a1a1a, #444);
          border-radius: 8px;
        }

        .dj-sunglasses::before {
          left: 2px;
        }

        .dj-sunglasses::after {
          right: 2px;
        }

        /* Click Hint */
        .click-hint {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
          white-space: nowrap;
          animation: pulse-hint 2s ease-in-out infinite;
          box-shadow: 0 4px 15px rgba(251, 146, 60, 0.4);
        }

        /* Party Lights Overlay */
        .party-lights-overlay {
          position: fixed;
          inset: 0;
          z-index: 998;
          pointer-events: none;
          overflow: hidden;
        }

        .party-light {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          filter: blur(100px);
          animation: party-light-move 2s ease-in-out infinite;
        }

        .light-1 {
          top: 10%;
          left: 10%;
          background: rgba(236, 72, 153, 0.4);
          animation-delay: 0s;
        }
        .light-2 {
          top: 20%;
          right: 15%;
          background: rgba(6, 182, 212, 0.4);
          animation-delay: 0.3s;
        }
        .light-3 {
          bottom: 30%;
          left: 20%;
          background: rgba(251, 146, 60, 0.4);
          animation-delay: 0.6s;
        }
        .light-4 {
          bottom: 20%;
          right: 20%;
          background: rgba(168, 85, 247, 0.4);
          animation-delay: 0.9s;
        }
        .light-5 {
          top: 50%;
          left: 50%;
          background: rgba(34, 211, 238, 0.3);
          animation-delay: 0.4s;
        }
        .light-6 {
          top: 40%;
          right: 40%;
          background: rgba(244, 114, 182, 0.3);
          animation-delay: 0.7s;
        }

        /* Disco Ball */
        .disco-ball-container {
          position: fixed;
          top: 50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999;
        }

        .disco-ball {
          width: 80px;
          height: 80px;
          position: relative;
          animation: disco-spin 4s linear infinite;
        }

        .disco-ball-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
        }

        .facet {
          position: absolute;
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #fff, #ccc, #888);
          left: 50%;
          top: 50%;
          margin: -6px;
          animation: facet-sparkle 0.5s ease-in-out infinite alternate;
        }

        .disco-ball-light {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 100px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.8), transparent);
        }

        /* Animations */
        @keyframes dj-bounce {
          0%, 100% { transform: translateY(0) scale(1.1); }
          50% { transform: translateY(-15px) scale(1.15); }
        }

        @keyframes dj-dance {
          0%, 100% { transform: rotate(-12deg) scale(1.05); }
          25% { transform: rotate(8deg) scale(1.1); }
          50% { transform: rotate(-8deg) scale(1.05); }
          75% { transform: rotate(12deg) scale(1.1); }
        }

        @keyframes pulse-hint {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(0.95); }
        }

        @keyframes party-light-move {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translate(30px, -20px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translate(-20px, 30px) scale(0.9);
            opacity: 0.3;
          }
          75% {
            transform: translate(20px, 10px) scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes disco-spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }

        @keyframes facet-sparkle {
          from {
            background: linear-gradient(135deg, #fff, #ddd, #999);
            box-shadow: 0 0 5px rgba(255,255,255,0.5);
          }
          to {
            background: linear-gradient(135deg, #eee, #aaa, #777);
            box-shadow: 0 0 15px rgba(255,255,255,0.8);
          }
        }
      `}</style>
    </>
  );
}

export default DJBanana;
