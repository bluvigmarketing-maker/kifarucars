import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { NewArrivalPopup, type NewArrival } from "@/components/site/NewArrivalPopup";
import { getVehicleForDetail } from "@/lib/data";
import { NEW_ARRIVAL, isNewArrivalActive } from "@/lib/promo";
import { formatPrice, vehicleTitle } from "@/lib/vehicle-display";

// The car advertised by the "new arrival" popup — null when the advert is
// off, expired, or the car has been hidden/deleted.
async function getNewArrival(): Promise<NewArrival | null> {
  if (!NEW_ARRIVAL.vehicleId || !isNewArrivalActive()) return null;
  const vehicle = await getVehicleForDetail(NEW_ARRIVAL.vehicleId).catch(() => null);
  if (!vehicle) return null;
  const price = formatPrice(vehicle);
  return {
    id: vehicle.id,
    title: vehicleTitle(vehicle),
    imageUrl: vehicle.image_url,
    priceAmount: price?.amount ?? null,
    priceUnit: price?.unit ?? null,
    fuelType: vehicle.fuel_type ?? "",
    transmission: vehicle.transmission ?? "",
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const newArrival = await getNewArrival();

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      {newArrival ? <NewArrivalPopup vehicle={newArrival} /> : null}
    </>
  );
}
