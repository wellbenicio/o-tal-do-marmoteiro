import { ArrowUpRight, ArrowDownRight, ArrowRight, Inbox } from "lucide-react";
import { money } from "@/lib/demo-bookings";
export function MgBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "orange" | "blue" | "red";
}) {
  return (
    <span className={`mg-badge mg-badge-${tone}`}>
      <i />
      {children}
    </span>
  );
}
export function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <span className={`mg-avatar ${small ? "small" : ""}`}>
      {name
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0])
        .join("")}
    </span>
  );
}
export function Kpi({
  label,
  value,
  detail,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <article className={`mg-kpi ${accent ? "accent" : ""}`}>
      <div>
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="mg-empty">
      <Inbox size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function SectionTitle({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mg-section-title">
      <div>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {action}
    </div>
  );
}
export function downloadFile(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function FlowChart({
  values,
  labels,
  compact = false,
}: {
  values: number[];
  labels: string[];
  compact?: boolean;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className={`mg-chart ${compact ? "compact" : ""}`}>
      <div className="mg-chart-labels">
        <span>{money(max)}</span>
        <span>{money(Math.round(max / 2))}</span>
        <span>R$ 0</span>
      </div>
      <div className="mg-chart-plot">
        <div className="mg-chart-grid">
          <i />
          <i />
          <i />
        </div>
        <div className="mg-chart-bars">
          {values.map((value, i) => (
            <div key={i}>
              <span className="mg-bar-tooltip">
                {labels[i]} · {money(value)}
              </span>
              <div
                className="mg-bar"
                style={{
                  height: `${Math.max(value ? 3 : 0, (value / max) * 100)}%`,
                }}
                title={`${labels[i]}: ${money(value)}`}
                aria-label={`${labels[i]}: ${money(value)}`}
              />
              <small>{labels[i]}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export const MovementIcon = ({ incoming }: { incoming: boolean }) =>
  incoming ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />;
export const SmallArrow = () => <ArrowRight size={14} />;
