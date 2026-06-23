import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={clsx("mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
