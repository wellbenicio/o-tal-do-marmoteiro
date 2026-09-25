import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Badge({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md bg-marmoteiro-amber px-3 py-1 text-xs font-black uppercase tracking-[0.04em] text-black",
        className,
      )}
      {...props}
    />
  );
}
