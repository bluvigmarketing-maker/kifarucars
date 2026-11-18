"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

// A hand-drawn golden arrow with a note, sitting to the left of a button
// and pointing at it. Draws itself in when scrolled into view, then keeps
// a gentle pulse/nudge towards the button. Static for reduced-motion users.
export function PointerArrow({ label, className }: { label: string; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute right-full top-1/2 mr-1 flex -translate-y-[85%] flex-col items-end text-gold-500 sm:mr-2 dark:text-gold-400",
        className
      )}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.6, x: -12 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <span className="mb-0.5 max-w-[5.5rem] text-center font-display text-sm italic leading-tight sm:max-w-none sm:whitespace-nowrap sm:text-base">
        {label}
      </span>

      <motion.svg
        viewBox="0 0 100 60"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-16 drop-shadow-[0_0_6px_rgba(201,162,39,0.55)] sm:w-24"
        animate={reduceMotion ? undefined : { x: [0, 6, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <motion.path
          d="M5 10 C 30 55, 65 55, 92 38"
          initial={reduceMotion ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        />
        <motion.path
          d="M80 38.5 L92 38 L86.4 48.6"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.2, delay: 0.8 }}
        />
      </motion.svg>
    </motion.div>
  );
}
