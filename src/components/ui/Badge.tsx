import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border border-marmoteiro-gold/45 bg-marmoteiro-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-marmoteiro-wine",
        className
      )}
      {...props}
    />
  );
}
