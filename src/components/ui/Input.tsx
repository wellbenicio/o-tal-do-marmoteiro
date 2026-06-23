import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "min-h-11 w-full rounded-md border border-marmoteiro-wine/20 bg-white px-3 py-2 text-sm text-marmoteiro-ink outline-none transition placeholder:text-marmoteiro-ink/45 focus:border-marmoteiro-gold focus:ring-2 focus:ring-marmoteiro-gold/25",
        className
      )}
      {...props}
    />
  );
}
