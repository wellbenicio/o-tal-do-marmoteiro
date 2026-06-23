import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

export function buttonClassName(variant: "primary" | "secondary" | "ghost" = "primary") {
  return clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-marmoteiro-amber focus:ring-offset-2 focus:ring-offset-black disabled:pointer-events-none disabled:opacity-55",
    {
      "orange-cta border border-marmoteiro-yellow/80 text-white shadow-amber hover:brightness-110":
        variant === "primary",
      "border border-marmoteiro-amber/40 bg-marmoteiro-panel text-marmoteiro-text hover:border-marmoteiro-amber":
        variant === "secondary",
      "text-marmoteiro-text hover:text-marmoteiro-amber": variant === "ghost"
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
