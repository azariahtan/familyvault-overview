import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useToday } from "@/lib/today";

type Props = { properties: any[]; loans: any[]; insurance: any[] };

export function LifetimeChart({ properties, loans, insurance }: Props) {
  const { today } = useToday();
  const startYear = today.getFullYear();

  const data = useMemo(() => {
    const years: { year: number; inflow: number; outflow: number; net: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const y = startYear + i;
      let inflow = 0;
      let outflow = 0;
      // properties: rent in / costs+mortgage out (assume mortgage stops at fixed_rate_end + 25y; simplify forever for now)
      for (const p of properties) {
        if (p.monthly_rent) inflow += Number(p.monthly_rent) * 12;
        if (p.monthly_costs) outflow += Number(p.monthly_costs) * 12;
        if (p.monthly_payment) outflow += Number(p.monthly_payment) * 12;
      }
      // loans
      for (const l of loans) {
        if (!l.monthly_payment) continue;
        if (l.reprice_date && new Date(l.reprice_date).getFullYear() < y - 5) continue;
        outflow += Number(l.monthly_payment) * 12;
      }
      // insurance
      for (const ins of insurance) {
        const start = ins.start_date ? new Date(ins.start_date).getFullYear() : startYear;
        const end = ins.end_date ? new Date(ins.end_date).getFullYear() : startYear + 40;
        if (y >= start && y <= end && ins.premium) {
          const f = (ins.frequency || "annual").toLowerCase();
          const mult = f.includes("month") ? 12 : f.includes("semi") ? 2 : f.includes("quart") ? 4 : 1;
          outflow += Number(ins.premium) * mult;
        }
        if (ins.payout_year && Number(ins.payout_year) === y && ins.expected_payout) {
          inflow += Number(ins.expected_payout);
        }
      }
      years.push({ year: y, inflow: Math.round(inflow), outflow: Math.round(outflow), net: Math.round(inflow - outflow) });
    }
    return years;
  }, [properties, loans, insurance, startYear]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="year" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(v: any) => `$${Number(v).toLocaleString()}`}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="outflow" name="Out" stroke="oklch(0.60 0.22 25)" fill="oklch(0.60 0.22 25 / 0.25)" />
          <Area type="monotone" dataKey="inflow" name="In" stroke="oklch(0.62 0.13 155)" fill="oklch(0.62 0.13 155 / 0.25)" />
          <Line type="monotone" dataKey="net" name="Net" stroke="oklch(0.30 0.04 60)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
