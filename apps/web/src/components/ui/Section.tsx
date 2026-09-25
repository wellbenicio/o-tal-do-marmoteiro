import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Section({ className, ...props }: Readonly<HTMLAttributes<HTMLElement>>) {
  return (
    <section
      className={clsx("figma-shell px-5 py-14 sm:px-8", className)}
      {...props}
    />
  );
}
