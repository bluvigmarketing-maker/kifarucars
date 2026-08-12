"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Briefcase, Fuel, Settings2, Users, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEngineSound } from "@/hooks/useEngineSound";
import type { Vehicle } from "@/lib/types";

export function VehicleCard({
  vehicle,
  soundEnabled,
}: {
  vehicle: Vehicle;
  soundEnabled: boolean;
}) {
  const { play, stop } = useEngineSound(soundEnabled);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={play}
      onHoverEnd={stop}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-charcoal-100 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-charcoal-800 dark:bg-charcoal-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-charcoal-50 dark:bg-charcoal-800">
        <Image
          src={vehicle.image_url}
          alt={`${vehicle.make} ${vehicle.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {soundEnabled ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <Volume2 size={12} /> Hover for sound
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-600 dark:text-burgundy-400">
          {vehicle.make} &middot; {vehicle.year}
        </p>
        <h3 className="mt-1 font-display text-xl text-charcoal-950 dark:text-white">{vehicle.name}</h3>

        <dl className="mt-4 grid grid-cols-2 gap-y-2.5 text-sm text-charcoal-600 dark:text-charcoal-300">
          <div className="flex items-center gap-1.5">
            <Settings2 size={15} className="text-charcoal-400 dark:text-charcoal-500" />
            {vehicle.transmission}
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={15} className="text-charcoal-400 dark:text-charcoal-500" />
            {vehicle.seats} Passengers
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel size={15} className="text-charcoal-400 dark:text-charcoal-500" />
            {vehicle.fuel_type}
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase size={15} className="text-charcoal-400 dark:text-charcoal-500" />
            {vehicle.luggage_capacity}
          </div>
        </dl>

        <div className="mt-5 flex gap-2.5 pt-1">
          <Button href="#enquiry" variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button href="#enquiry" size="sm" className="flex-1">
            Get A Quote
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
