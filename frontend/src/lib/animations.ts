/**
 * Animation utilities — Framer Motion presets
 * Keep animations subtle, fast (150–250ms), and non-intrusive.
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Shared transitions ─────────────────────────────────────────────────────

const smooth: Transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] };
const spring: Transition = { type: 'spring', stiffness: 400, damping: 25 };

// ─── Fade ────────────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: smooth },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export const fadeInNoY: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smooth },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ─── Scale ───────────────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: smooth },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

// ─── Slide ───────────────────────────────────────────────────────────────────

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: smooth },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: smooth },
  exit: { opacity: 0, x: 16, transition: { duration: 0.15 } },
};

// ─── Stagger container ──────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: smooth },
};

// ─── Hover / tap micro-interactions ─────────────────────────────────────────

export const hoverLift = {
  whileHover: { y: -2, transition: spring },
  whileTap: { y: 0, scale: 0.98, transition: spring },
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: spring },
  whileTap: { scale: 0.98, transition: spring },
};

// ─── Page transition ────────────────────────────────────────────────────────

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ─── Modal / overlay ────────────────────────────────────────────────────────

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } },
};
