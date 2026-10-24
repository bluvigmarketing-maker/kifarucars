"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Cog, Fuel, Settings2, Users, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEngineSound } from "@/hooks/useEngineSound";
import type { PublicVehicle } from "@/lib/types";
import { vehicleSubtitle, vehicleTitle } from "@/lib/vehicle-display";

export function VehicleCard({
  vehicle,
  soundEnabled,
}: {
  vehicle: PublicVehicle;
  soundEnabled: boolean;
}) {
  const { play, stop } = useEngineSound(soundEnabled, vehicle.hover_sound_url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const title = vehicleTitle(vehicle);
  const subtitle = vehicleSubtitle(vehicle);
  // Every detail is optional — only show the ones that were filled in.
  const specs = [
    { label: vehicle.transmission, Icon: Settings2 },
    { label: vehicle.seats ? `${vehicle.seats} Passengers` : "", Icon: Users },
    { label: vehicle.fuel_type, Icon: Fuel },
    { label: vehicle.engine_capacity, Icon: Cog },
  ].filter((spec) => spec.label);

  const handleHoverStart = () => {
    play();
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) videoRef.current?.play().catch(() => {});
  };

  const handleHoverEnd = () => {
    stop();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-gold-500/60 bg-white shadow-[0_0_20px_-6px_rgba(201,162,39,0.5)] transition-shadow hover:shadow-[0_0_24px_-4px_rgba(201,162,39,0.65)] dark:border-gold-400/50 dark:shadow-[0_0_20px_-6px_rgba(212,185,106,0.4)] dark:bg-charcoal-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-charcoal-50 dark:bg-charcoal-800">
        <Image
          src={vehicle.image_url}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {vehicle.video_url ? (
          <video
            ref={videoRef}
            src={vehicle.video_url}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        ) : null}
        {soundEnabled ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <Volume2 size={12} /> Hover for sound
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {subtitle ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-600 dark:text-burgundy-400">
            {subtitle}
          </p>
        ) : null}
        <h3 className="mt-1 font-display text-xl text-charcoal-950 dark:text-white">{vehicle.name || title}</h3>

        <dl className="mt-4 grid grid-cols-2 gap-y-2.5 text-sm text-charcoal-600 dark:text-charcoal-300">
          {specs.map(({ label, Icon }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={15} className="text-charcoal-400 dark:text-charcoal-500" />
              {label}
            </div>
          ))}
        </dl>

        <div className="mt-auto flex gap-2.5 pt-6">
          <Button href={`/fleet/${vehicle.id}`} variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button href={`/fleet/${vehicle.id}#book`} size="sm" className="flex-1">
            Select This Car
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
