// Public-site feature switches. Flip to true to turn a feature back on —
// the admin upload fields and stored data are untouched while it's off.

// Engine sound when hovering a vehicle card (plus the on/off toggle above
// the fleet).
export const ENGINE_SOUND_ENABLED = false;

// Vehicle videos: hover-autoplay on fleet cards and the video slide in the
// gallery on /fleet/[id].
export const VEHICLE_VIDEO_ENABLED = false;

// Kifaru Liquor site. When set, customers who answer "Yes" to extras at
// checkout get a link to it, carrying ?kifaru_booking=<booking id> so the
// drinks order can be joined to the car booking. Unset = no liquor link.
export const LIQUOR_SITE_URL = process.env.NEXT_PUBLIC_LIQUOR_SITE_URL?.trim() || null;

export function liquorSiteLink(bookingId?: string) {
  if (!LIQUOR_SITE_URL) return null;
  try {
    const url = new URL(LIQUOR_SITE_URL);
    if (bookingId) url.searchParams.set("kifaru_booking", bookingId);
    return url.toString();
  } catch {
    return null;
  }
}
