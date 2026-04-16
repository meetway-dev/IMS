/**
 * Animation utilities for smooth transitions and effects
 */

// Fade in animation
export const fadeIn = (delay: number = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

// Slide in from left
export const slideInLeft = (delay: number = 0) => ({
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

// Slide in from right
export const slideInRight = (delay: number = 0) => ({
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

// Scale in animation
export const scaleIn = (delay: number = 0) => ({
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, delay, ease: "easeOut" },
});

// Stagger children animation
export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
};

export const hoverLift = {
  whileHover: { y: -4 },
  whileTap: { y: 0 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
};

// Pulse animation for notifications
export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

// Loading spinner animation
export const spinAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

// Card hover effects
export const cardHover = {
  initial: { boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" },
  whileHover: { 
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.12)",
    y: -4,
  },
  transition: { duration: 0.3, ease: "easeOut" },
};

// Button press animation
export const buttonPress = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
};

// Fade in up for stats
export const statsAnimation = (index: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: index * 0.1, ease: "easeOut" },
});

// Progress bar animation
export const progressBarAnimation = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { duration: 1, ease: "easeInOut" },
};

// Notification slide in
export const notificationSlide = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// Tooltip fade in
export const tooltipAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2, ease: "easeOut" },
};

// Modal backdrop fade
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: "easeInOut" },
};

// Modal content scale in
export const modalContent = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// List item animation
export const listItemAnimation = (index: number) => ({
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, delay: index * 0.05, ease: "easeOut" },
});

// Table row animation
export const tableRowAnimation = (index: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, delay: index * 0.03, ease: "easeOut" },
});

// Chart animation
export const chartAnimation = {
  initial: { opacity: 0, scaleY: 0 },
  animate: { opacity: 1, scaleY: 1 },
  transition: { duration: 0.8, ease: "easeOut" },
};

// Gradient shimmer animation
export const shimmerAnimation = {
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
  backgroundSize: "200% 100%",
  animation: "shimmer 2s infinite",
};

// Keyframes for CSS animations
export const keyframes = {
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `,
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
  `,
  pulseSlow: `
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  slideIn: `
    @keyframes slide-in {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
};

// CSS animation classes
export const animationClasses = {
  shimmer: "animate-shimmer",
  float: "animate-float",
  pulseSlow: "animate-pulse-slow",
  slideIn: "animate-slide-in",
  spin: "animate-spin",
  bounce: "animate-bounce",
  ping: "animate-ping",
};

// Utility to apply animations conditionally
export const applyAnimation = (animation: any, condition: boolean = true) => {
  return condition ? animation : {};
};