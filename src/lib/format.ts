import { format, parseISO } from "date-fns";

export function fmtMoney(n: number | null | undefined, currency: "SGD" | "GBP" = "SGD") {
  if (n == null || isNaN(Number(n))) return "—";
  const sym = currency === "GBP" ? "£" : "$";
  const abs = Math.abs(Number(n));
  const str =
    abs >= 1_000_000
      ? (Number(n) / 1_000_000).toFixed(2) + "M"
      : Number(n).toLocaleString("en-SG", { maximumFractionDigits: 0 });
  return `${sym}${str}`;
}

export function fmtPct(n: number | null | undefined) {
  if (n == null || isNaN(Number(n))) return "—";
  return `${Number(n).toFixed(2)}%`;
}

export function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  try {
    return format(typeof d === "string" ? parseISO(d) : d, "dd MMM yyyy");
  } catch {
    return String(d);
  }
}

export function fmtMonth(d: string | Date | null | undefined) {
  if (!d) return "—";
  try {
    return format(typeof d === "string" ? parseISO(d) : d, "MMM yyyy");
  } catch {
    return String(d);
  }
}
