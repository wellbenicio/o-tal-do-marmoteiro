import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-md border border-marmoteiro-wine/15 bg-marmoteiro-paper p-5 shadow-soft",
        className
      )}
      {...props}
    />
  );
}
