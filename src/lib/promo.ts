// The "new arrival" advert: a popup shown once per visit on the public site
// (NewArrivalPopup) plus a "New" badge on the vehicle's fleet card.
//
// To advertise a different car, set `vehicleId` to its id from
// /kifaruadmin/fleet. Set it to null to switch the advert off. If the
// vehicle is deleted or hidden, the popup simply doesn't show.
export const NEW_ARRIVAL = {
  // Toyota Land Cruiser Prado TXL, added 27 Nov 2026.
  vehicleId: "8a02cd3c-8412-4d81-bcf1-9a9d0760f15f" as string | null,
  // After this date the popup and badge stop showing on their own.
  showUntil: "2027-01-31",
};

export function isNewArrival(vehicleId: string): boolean {
  return NEW_ARRIVAL.vehicleId === vehicleId && isNewArrivalActive();
}

export function isNewArrivalActive(now: Date = new Date()): boolean {
  if (!NEW_ARRIVAL.vehicleId) return false;
  return now <= new Date(`${NEW_ARRIVAL.showUntil}T23:59:59+03:00`);
}
