import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

export function buttonClassName(variant: "primary" | "secondary" | "ghost" = "primary") {
  return clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-marmoteiro-gold focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-55",
    {
      "bg-marmoteiro-wine text-white shadow-soft hover:bg-marmoteiro-rose": variant === "primary",
      "border border-marmoteiro-wine/25 bg-marmoteiro-paper text-marmoteiro-ink hover:border-marmoteiro-wine/50":
        variant === "secondary",
      "text-marmoteiro-wine hover:bg-marmoteiro-wine/10": variant === "ghost"
    }
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return <button className={clsx(buttonClassName(variant), className)} {...props} />;
}
