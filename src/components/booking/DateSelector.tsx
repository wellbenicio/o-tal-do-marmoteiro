import { Input } from "@/components/ui/Input";
import { toDateInputValue } from "@/lib/format";

export function DateSelector({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm font-medium">
      Data
      <Input
        min={toDateInputValue()}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
