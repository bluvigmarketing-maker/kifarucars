import type { Metadata } from "next";
import { Jost, Fraunces } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Kifaru Car Hire | Corporate & Expat Car Hire, Leasing in Kenya",
    template: "%s | Kifaru Car Hire",
  },
  description:
    "Self-drive and chauffeur-driven car hire and vehicle leasing in Nairobi, Mombasa and Nanyuki. Kifaru Car Hire runs its own fleet for corporates and expats across Kenya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-charcoal-900">
        {children}
      </body>
    </html>
  );
}
