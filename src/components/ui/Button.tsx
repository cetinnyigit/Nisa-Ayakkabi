import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "text";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-label-caps text-label-caps uppercase " +
  "transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background";

const variants: Record<Variant, string> = {
  // Solid mocha — ana CTA
  primary: "bg-tertiary text-on-tertiary rounded-lg hover:bg-on-tertiary-fixed-variant",
  // 1px altın çerçeveli ghost
  ghost:
    "border border-primary-container text-primary rounded-lg hover:bg-primary-fixed/40 " +
    "hover:border-primary",
  // Çerçevesiz bağlantı butonu
  text: "text-tertiary hover:text-primary",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
  lg: "px-8 py-4",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

type LinkProps = CommonProps & { href: string };

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps | LinkProps) {
  const classes = cn(
    base,
    variants[variant],
    variant === "text" ? "" : sizes[size],
    fullWidth && "w-full",
    className
  );

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link href={rest.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

export default Button;
