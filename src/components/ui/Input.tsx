import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "min-h-10 w-full rounded-sm border border-white/25 bg-transparent px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-marmoteiro-amber focus:ring-2 focus:ring-marmoteiro-amber/25",
        className
      )}
      {...props}
    />
  );
}
