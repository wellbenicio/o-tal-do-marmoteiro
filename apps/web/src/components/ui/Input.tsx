import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Input({
  className,
  ...props
}: Readonly<InputHTMLAttributes<HTMLInputElement>>) {
  return (
    <input
      className={clsx(
        "min-h-12 w-full rounded border border-white/70 bg-transparent px-4 py-3 text-base text-white outline-none transition placeholder:text-white/55 focus:border-marmoteiro-amber focus:ring-2 focus:ring-marmoteiro-amber/25",
        className,
      )}
      {...props}
    />
  );
}
