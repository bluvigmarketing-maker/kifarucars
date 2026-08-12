"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Synthesizes a short "engine rev" sound with the Web Audio API — no audio
 * asset/licensing needed. A single AudioContext is shared across every card
 * so hovering quickly between vehicles doesn't spawn dozens of contexts.
 */
let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtor) return null;
  if (!sharedContext) sharedContext = new AudioCtor();
  return sharedContext;
}

if (typeof window !== "undefined") {
  // Browsers block audio until a real user gesture; this resumes the
  // context on the page's first click/keypress so hover sound works after.
  const resume = () => {
    getContext()
      ?.resume()
      .catch(() => {});
  };
  window.addEventListener("pointerdown", resume, { once: true });
  window.addEventListener("keydown", resume, { once: true });
}

export function useEngineSound(enabled: boolean) {
  const fadeOutRef = useRef<() => void>(() => {});

  const play = useCallback(() => {
    if (!enabled) return;
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.7;

    osc.frequency.setValueAtTime(70, now);
    osc.frequency.linearRampToValueAtTime(190, now + 0.22);
    osc.frequency.linearRampToValueAtTime(110, now + 0.55);

    filter.frequency.setValueAtTime(500, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 0.22);
    filter.frequency.linearRampToValueAtTime(700, now + 0.55);

    osc.connect(filter);
    filter.connect(master);

    const sub = ctx.createOscillator();
    sub.type = "square";
    sub.frequency.setValueAtTime(45, now);
    sub.frequency.linearRampToValueAtTime(95, now + 0.22);
    sub.frequency.linearRampToValueAtTime(60, now + 0.55);
    const subGain = ctx.createGain();
    subGain.gain.value = 0.35;
    sub.connect(subGain);
    subGain.connect(master);

    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.16, now + 0.06);
    master.gain.linearRampToValueAtTime(0.11, now + 0.3);
    master.gain.linearRampToValueAtTime(0, now + 0.65);

    osc.start(now);
    sub.start(now);
    osc.stop(now + 0.7);
    sub.stop(now + 0.7);

    fadeOutRef.current = () => {
      const t = ctx.currentTime;
      try {
        master.gain.cancelScheduledValues(t);
        master.gain.setTargetAtTime(0, t, 0.05);
      } catch {
        // context may already be closed
      }
    };
  }, [enabled]);

  const stop = useCallback(() => {
    fadeOutRef.current();
  }, []);

  useEffect(() => () => fadeOutRef.current(), []);

  return { play, stop };
}
