import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-marmoteiro-amber/35 bg-marmoteiro-panel p-5 text-marmoteiro-text shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
