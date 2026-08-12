import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "border-2 border-gold-400/70 shadow-[0_0_14px_-3px_rgba(201,162,39,0.55)] bg-burgundy-600 text-white hover:bg-burgundy-700 focus-visible:outline-burgundy-600",
  secondary:
    "border-2 border-gold-400/70 shadow-[0_0_14px_-3px_rgba(201,162,39,0.55)] bg-charcoal-900 text-white hover:bg-charcoal-800 focus-visible:outline-charcoal-900",
  outline:
    "border-2 border-gold-500/75 shadow-[0_0_14px_-3px_rgba(201,162,39,0.4)] text-charcoal-900 hover:border-burgundy-600 hover:text-burgundy-700 dark:border-gold-400/60 dark:text-charcoal-50 dark:hover:border-burgundy-400 dark:hover:text-burgundy-400",
  ghost: "text-charcoal-900 hover:text-burgundy-700 dark:text-charcoal-50 dark:hover:text-burgundy-400",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href">)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as { href: string } & Omit<
      React.ComponentProps<typeof Link>,
      "href"
    >;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
