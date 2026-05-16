import { differenceInMonths, parseISO } from "date-fns";

/** Standard amortising mortgage payment. */
export function monthlyPayment(principal: number, annualRatePct: number, termYears: number): number {
  if (!principal || !termYears) return 0;
  const n = termYears * 12;
  const r = (annualRatePct || 0) / 100 / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Remaining balance after `monthsElapsed` months of payment `pmt`. */
export function remainingBalance(
  principal: number,
  annualRatePct: number,
  termYears: number,
  monthsElapsed: number,
): number {
  if (!principal || !termYears) return principal || 0;
  const n = termYears * 12;
  const r = (annualRatePct || 0) / 100 / 12;
  const m = Math.min(Math.max(monthsElapsed, 0), n);
  const pmt = monthlyPayment(principal, annualRatePct, termYears);
  if (r === 0) return Math.max(principal - pmt * m, 0);
  return Math.max(
    principal * Math.pow(1 + r, m) - pmt * ((Math.pow(1 + r, m) - 1) / r),
    0,
  );
}

export function monthsSince(dateStr: string | null | undefined, today = new Date()) {
  if (!dateStr) return 0;
  try {
    return Math.max(differenceInMonths(today, parseISO(dateStr)), 0);
  } catch {
    return 0;
  }
}
