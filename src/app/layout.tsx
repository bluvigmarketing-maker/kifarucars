import type { Metadata } from "next";
import { Jost, Fraunces } from "next/font/google";
import Script from "next/script";
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
    default: "Kifaru Car Hire | Prado Car Hire & Leasing in Kenya",
    template: "%s | Kifaru Car Hire",
  },
  description:
    "Self-drive and chauffeur-driven Toyota Land Cruiser Prado hire and leasing in Nairobi, Kisumu, Mombasa, Nanyuki and Nakuru. Kifaru Car Hire owns and manages its own Prado fleet for corporates and expats across Kenya.",
};

const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem('kifaru-theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jost.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-charcoal-900 dark:bg-charcoal-950 dark:text-charcoal-50">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        {children}
      </body>
    </html>
  );
}
