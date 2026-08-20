import { ThemeToggle } from "@/components/ui/ThemeToggle";

// A private utility surface for a registered client holding a portal link
// — deliberately not the (site) marketing layout (no Header/Footer/
// WhatsAppButton widget).
export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <div className="flex min-h-screen flex-col bg-charcoal-50 dark:bg-charcoal-950">
      <header className="flex items-center justify-between border-b border-charcoal-100 bg-white px-5 py-4 dark:border-charcoal-800 dark:bg-charcoal-900">
        <div>
          <p className="font-display text-lg text-charcoal-950 dark:text-white">Kifaru</p>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Client Portal</p>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex-1 px-5 py-10 sm:py-16">{children}</main>
      <footer className="border-t border-charcoal-100 px-5 py-4 text-center text-xs text-charcoal-400 dark:border-charcoal-800 dark:text-charcoal-500">
        Questions about your lease? Contact Kifaru Car Hire directly.
      </footer>
    </div>
  );
}
