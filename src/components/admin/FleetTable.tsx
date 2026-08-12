"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteVehicle, toggleVehicleAvailability } from "@/lib/actions/vehicles";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/types";

export function FleetTable({ vehicles }: { vehicles: Vehicle[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-charcoal-100 text-xs uppercase tracking-wide text-charcoal-500">
          <tr>
            <th className="px-5 py-3">Vehicle</th>
            <th className="px-5 py-3">Category</th>
            <th className="px-5 py-3">Seats</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-100">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td className="px-5 py-3.5">
                <p className="font-medium text-charcoal-950">{vehicle.name}</p>
                <p className="text-xs text-charcoal-500">
                  {vehicle.make} &middot; {vehicle.year}
                </p>
              </td>
              <td className="px-5 py-3.5 text-charcoal-700">{vehicle.category}</td>
              <td className="px-5 py-3.5 text-charcoal-700">{vehicle.seats}</td>
              <td className="px-5 py-3.5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => toggleVehicleAvailability(vehicle.id, !vehicle.is_available))
                  }
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    vehicle.is_available
                      ? "bg-green-50 text-green-700"
                      : "bg-charcoal-100 text-charcoal-500"
                  )}
                >
                  {vehicle.is_available ? "Visible" : "Hidden"}
                </button>
              </td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex justify-end gap-1.5">
                  <Link
                    href={`/kifaruadmin/fleet/${vehicle.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-charcoal-50 hover:text-burgundy-700"
                    aria-label={`Edit ${vehicle.name}`}
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    disabled={isPending}
                    aria-label={`Delete ${vehicle.name}`}
                    onClick={() => {
                      if (confirm(`Delete ${vehicle.name}? This can't be undone.`)) {
                        startTransition(() => deleteVehicle(vehicle.id));
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-burgundy-50 hover:text-burgundy-700"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-charcoal-500">
                No vehicles yet — add your first one.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
