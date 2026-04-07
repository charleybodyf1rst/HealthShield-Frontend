/**
 * Boat Card Animation Variants for Framer Motion
 * Full Immersive Aura Effects with Party Mode Intensity
 */

import { Variants } from "framer-motion";

// Color-specific glow colors for animations
export const auraColors = {
  yellow: {
    primary: "rgba(250, 204, 21, 0.4)",
    secondary: "rgba(250, 204, 21, 0.55)",
    halo: "rgba(253, 224, 71, 0.25)",
    intense: "rgba(250, 204, 21, 0.7)",
    gradient: "from-yellow-400 via-amber-400 to-lime-400",
  },
  pink: {
    primary: "rgba(236, 72, 153, 0.4)",
    secondary: "rgba(236, 72, 153, 0.55)",
    halo: "rgba(244, 114, 182, 0.25)",
    intense: "rgba(236, 72, 153, 0.7)",
    gradient: "from-pink-500 via-rose-400 to-fuchsia-400",
  },
  blue: {
    primary: "rgba(14, 165, 233, 0.4)",
    secondary: "rgba(14, 165, 233, 0.55)",
    halo: "rgba(56, 189, 248, 0.25)",
    intense: "rgba(14, 165, 233, 0.7)",
    gradient: "from-sky-500 via-blue-400 to-cyan-400",
  },
  red: {
    primary: "rgba(239, 68, 68, 0.4)",
    secondary: "rgba(239, 68, 68, 0.55)",
    halo: "rgba(248, 113, 113, 0.25)",
    intense: "rgba(239, 68, 68, 0.7)",
    gradient: "from-red-500 via-rose-500 to-orange-400",
  },
} as const;

export type BoatColor = keyof typeof auraColors;

// Party mode configuration
export const partyModeConfig = {
  pulseSpeed: 1.5, // seconds per cycle
  glowIntensity: 1.4, // multiplier for glow opacity
  scaleAmount: 1.02, // hover scale
  liftHeight: -8, // pixels to lift on hover
  blurRadius: 24, // background blur in px
  springStiffness: 400,
  springDamping: 25,
};

// Base card animation variants
export const boatCardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: partyModeConfig.scaleAmount,
    y: partyModeConfig.liftHeight,
    transition: {
      type: "spring",
      stiffness: partyModeConfig.springStiffness,
      damping: partyModeConfig.springDamping,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: partyModeConfig.springStiffness,
      damping: partyModeConfig.springDamping,
    },
  },
};

// Aura pulse animation - breathing glow effect
export const auraPulseVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 1,
  },
  hover: {
    opacity: [0.6, 0.9, 0.6],
    scale: [1, 1.05, 1],
    transition: {
      duration: partyModeConfig.pulseSpeed,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Background halo expansion animation
export const haloVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  hover: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.15, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Border glow animation
export const borderGlowVariants: Variants = {
  initial: {
    opacity: 0,
  },
  hover: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: partyModeConfig.pulseSpeed,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Capacity badge bounce animation
export const badgeVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: [1, 1.08, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Staggered children animation for features
export const featureContainerVariants: Variants = {
  initial: {},
  hover: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const featureItemVariants: Variants = {
  initial: {
    opacity: 0.8,
    y: 0,
  },
  hover: {
    opacity: 1,
    y: -2,
    transition: {
      duration: 0.3,
    },
  },
};

// Color-specific gradient configurations for UI elements
export const colorGradients = {
  yellow: {
    badge: "bg-gradient-to-r from-yellow-400 via-amber-400 to-lime-400",
    button: "bg-gradient-to-r from-lime-500 to-yellow-400 hover:from-lime-400 hover:to-yellow-300",
    buttonOutline: "border-lime-300 hover:bg-lime-500 hover:border-lime-500 hover:text-white",
    text: "text-gradient-lime",
    icon: "text-lime-500",
    haloClass: "from-yellow-400/40 via-amber-300/25 to-transparent",
    borderClass: "border-yellow-300/50 hover:border-yellow-400",
  },
  pink: {
    badge: "bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-400",
    button: "bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300",
    buttonOutline: "border-pink-300 hover:bg-pink-500 hover:border-pink-500 hover:text-white",
    text: "text-gradient-pink",
    icon: "text-pink-500",
    haloClass: "from-pink-400/40 via-rose-300/25 to-transparent",
    borderClass: "border-pink-300/50 hover:border-pink-400",
  },
  blue: {
    badge: "bg-gradient-to-r from-sky-500 via-blue-400 to-cyan-400",
    button: "bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300",
    buttonOutline: "border-sky-300 hover:bg-sky-500 hover:border-sky-500 hover:text-white",
    text: "text-gradient-blue",
    icon: "text-sky-500",
    haloClass: "from-sky-400/40 via-blue-300/25 to-transparent",
    borderClass: "border-sky-300/50 hover:border-sky-400",
  },
  red: {
    badge: "bg-gradient-to-r from-red-500 via-rose-500 to-orange-400",
    button: "bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-400 hover:to-orange-300",
    buttonOutline: "border-red-300 hover:bg-red-500 hover:border-red-500 hover:text-white",
    text: "text-gradient-red",
    icon: "text-red-500",
    haloClass: "from-red-400/40 via-orange-300/25 to-transparent",
    borderClass: "border-red-300/50 hover:border-red-400",
  },
} as const;

// Get the aura card class based on boat color
export function getAuraCardClass(color: BoatColor): string {
  return `card-boat-aura card-boat-${color}-aura`;
}

// Get color gradient config
export function getColorGradient(color: BoatColor) {
  return colorGradients[color];
}
