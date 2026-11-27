"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Fuel, Settings2, X } from "lucide-react";

export type NewArrival = {
  id: string;
  title: string;
  imageUrl: string;
  priceAmount: string | null;
  priceUnit: string | null;
  fuelType: string;
  transmission: string;
};

// Shown once per browser session, so moving around the site (or reloading)
// doesn't keep throwing it in people's faces.
const storageKey = (id: string) => `kifaru:new-arrival-seen:${id}`;
const OPEN_DELAY_MS = 700;

// Spring for the car "landing": fast in, a small overshoot, then settles.
const landingSpring = { type: "spring", stiffness: 140, damping: 14, mass: 0.9 } as const;

export function NewArrivalPopup({ vehicle }: { vehicle: NewArrival }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // People already looking at this car's page don't need the advert.
  const onOwnPage = pathname?.startsWith(`/fleet/${vehicle.id}`);

  useEffect(() => {
    if (onOwnPage) return;
    try {
      if (sessionStorage.getItem(storageKey(vehicle.id))) return;
    } catch {
      // Storage blocked (private mode etc.) — show it anyway.
    }
    const timer = window.setTimeout(() => {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
    // Only decide on first load, not on every client-side navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(storageKey(vehicle.id), "1");
    } catch {}
    returnFocusRef.current?.focus?.();
  }, [vehicle.id]);

  // Esc to close, keep Tab inside the dialog, and stop the page scrolling behind it.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const specs = [
    { label: vehicle.fuelType, Icon: Fuel },
    { label: vehicle.transmission, Icon: Settings2 },
  ].filter((s) => s.label);

  // Timeline (seconds): backdrop 0 → panel 0.1 → car flies in 0.25 → lands
  // ~0.9 → NEW stamp slams 0.95 → text and buttons follow.
  const t = (seconds: number) => (reduceMotion ? 0 : seconds);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="new-arrival"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-arrival-title"
            aria-describedby="new-arrival-desc"
            className="relative w-full max-w-[460px] overflow-hidden rounded-3xl border-2 border-gold-400/70 bg-charcoal-950 text-white shadow-[0_0_60px_-10px_rgba(201,162,39,0.55)]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, delay: t(0.1), ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-burgundy-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
            >
              <X size={18} />
            </button>

            {/* Stage: spotlight, spinning rays and speed streaks behind the car. */}
            <div className="relative aspect-[5/4] overflow-hidden bg-[radial-gradient(ellipse_at_center,_#64162b_0%,_#250710_55%,_#0d0c0b_100%)]">
              {!reduceMotion ? (
                <motion.div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2 opacity-25 [background:repeating-conic-gradient(from_0deg,_rgba(212,185,106,0.55)_0deg_6deg,_transparent_6deg_24deg)] [mask-image:radial-gradient(circle,_black_20%,_transparent_65%)]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                />
              ) : null}

              {!reduceMotion
                ? [18, 34, 52, 68, 82].map((top, i) => (
                    <motion.span
                      key={top}
                      aria-hidden="true"
                      className="absolute right-0 h-[2px] rounded-full bg-gradient-to-l from-transparent via-gold-400 to-transparent"
                      style={{ top: `${top}%`, width: `${40 + (i % 3) * 15}%` }}
                      initial={{ x: "120%", opacity: 0 }}
                      animate={{ x: "-260%", opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 0.75, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                    />
                  ))
                : null}

              {/* The car flies in from the right, tilted and blurred, then lands with a bounce. */}
              <motion.div
                className="absolute inset-[9%] overflow-hidden rounded-2xl border border-gold-400/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)]"
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { x: "140%", rotate: 8, skewX: -14, filter: "blur(8px)", opacity: 1 }
                }
                animate={{ x: 0, rotate: -2, skewX: 0, filter: "blur(0px)", opacity: 1 }}
                transition={reduceMotion ? { duration: 0.3 } : { ...landingSpring, delay: 0.25 }}
              >
                <Image
                  src={vehicle.imageUrl}
                  alt={vehicle.title}
                  fill
                  priority
                  sizes="(max-width: 500px) 90vw, 420px"
                  className="object-cover"
                />
                {/* Shine sweep once it lands. */}
                {!reduceMotion ? (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ left: "-40%" }}
                    animate={{ left: "140%" }}
                    transition={{ duration: 0.8, delay: 1.15, ease: "easeInOut" }}
                  />
                ) : null}
              </motion.div>

              {/* NEW stamp slams down on top of the car. */}
              <motion.div
                aria-hidden="true"
                className="absolute left-[5%] top-[5%] z-10"
                initial={reduceMotion ? { opacity: 0 } : { scale: 3.2, rotate: -40, opacity: 0 }}
                animate={{ scale: 1, rotate: -14, opacity: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0.3 }
                    : { type: "spring", stiffness: 420, damping: 16, delay: 0.95 }
                }
              >
                {!reduceMotion ? (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-gold-400"
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 1.9], opacity: [0.9, 0] }}
                    transition={{ duration: 1.4, delay: 1.1, repeat: Infinity, repeatDelay: 0.6 }}
                  />
                ) : null}
                <span className="relative flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full border-[3px] border-gold-400 bg-burgundy-600 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.7)] ring-4 ring-burgundy-600/40 sm:h-[96px] sm:w-[96px]">
                  <span className="font-display text-[1.7rem] font-bold leading-none tracking-wide sm:text-3xl">NEW</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-300">
                    arrival
                  </span>
                </span>
              </motion.div>
            </div>

            <div className="px-6 pb-6 pt-5 text-center">
              <motion.p
                className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: t(1.15), duration: 0.35 }}
              >
                Just landed in the Kifaru fleet
              </motion.p>
              <motion.h2
                id="new-arrival-title"
                className="mt-2 font-display text-[1.7rem] leading-tight sm:text-3xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: t(1.25), duration: 0.4 }}
              >
                {vehicle.title}
              </motion.h2>
              <motion.p
                id="new-arrival-desc"
                className="mt-2 text-sm text-charcoal-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: t(1.35), duration: 0.4 }}
              >
                Fresh, spotless and ready for the road. Be among the first to drive it.
              </motion.p>

              <motion.div
                className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: t(1.45), duration: 0.35 }}
              >
                {vehicle.priceAmount ? (
                  <p className="font-display text-2xl text-white">
                    {vehicle.priceAmount}
                    {vehicle.priceUnit ? (
                      <span className="ml-1 font-sans text-sm text-charcoal-300">{vehicle.priceUnit}</span>
                    ) : null}
                  </p>
                ) : null}
                {specs.map(({ label, Icon }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 text-sm text-charcoal-300">
                    <Icon size={15} className="text-gold-400" />
                    {label}
                  </span>
                ))}
              </motion.div>

              <motion.div
                className="mt-5 flex flex-col gap-2.5 sm:flex-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: t(1.55), duration: 0.35 }}
              >
                <Link
                  href={`/fleet/${vehicle.id}#book`}
                  onClick={close}
                  className="inline-flex flex-1 items-center justify-center rounded-full border-2 border-gold-400/70 bg-burgundy-600 px-5 py-3 text-sm font-medium text-white shadow-[0_0_14px_-3px_rgba(201,162,39,0.55)] transition-colors hover:bg-burgundy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                >
                  Book it now
                </Link>
                <Link
                  href={`/fleet/${vehicle.id}`}
                  onClick={close}
                  className="inline-flex flex-1 items-center justify-center rounded-full border-2 border-gold-400/60 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-burgundy-400 hover:text-burgundy-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                >
                  See all photos
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
