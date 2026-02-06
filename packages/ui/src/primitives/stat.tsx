import React from "react";

import { SlidingNumber } from "@foundry/ui/primitives/sliding-number";

export interface StatProps {
  label: string;
  value?: string | number | null;
  title?: string; // optional title for tooltip
  className?: string;
  animateNumber?: boolean;
}

export function formatCount(value?: string | number | null) {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
}

export function formatDate(value?: string | number | null) {
  if (!value) return "—";
  try {
    let d: Date;
    if (typeof value === "object" && value !== null && typeof (value as any).getTime === "function") {
      d = value as Date;
    } else {
      d = new Date(String(value));
    }
  // Use a stable locale to avoid SSR/CSR mismatches caused by differing server/client locales
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
  } catch {
    return String(value);
  }
}

export function Stat({ label, value, title, className = "", animateNumber = false }: StatProps) {
  let display = typeof value === "number" || /\d/.test(String(value ?? "")) ? formatCount(value) : String(value ?? "—");
  // If the label contains 'Updated' we try date formatting
  if (/updated/i.test(label)) display = formatDate(value) as string;

  const numericValue = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9.-]+/g, ""));
  const shouldAnimate = animateNumber && typeof value !== "undefined" && value !== null && Number.isFinite(numericValue);

  return (
    <div className={`inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm ${className}`} title={title}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <strong className="font-medium">
        {shouldAnimate ? <SlidingNumber number={numericValue} thousandSeparator="," /> : display}
      </strong>
    </div>
  );
}

export default Stat;
