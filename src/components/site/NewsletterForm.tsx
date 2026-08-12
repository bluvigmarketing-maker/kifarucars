"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <p className="text-sm text-charcoal-300">Thanks — you&apos;re on the list.</p>;
  }

  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <input
        type="email"
        required
        placeholder="Your email address"
        className="min-w-0 flex-1 rounded-full border border-gold-400/25 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-charcoal-400 focus:border-burgundy-400 focus:outline-none"
      />
      <Button type="submit" size="sm">
        Subscribe
      </Button>
    </form>
  );
}
