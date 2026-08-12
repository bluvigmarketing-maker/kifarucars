import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-widest text-burgundy-600">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "mt-2 font-display text-3xl text-charcoal-950 sm:text-4xl",
          "text-balance"
        )}
      >
        {title}
      </h2>
    </div>
  );
}
