import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToday } from "@/lib/today";
import { fmtMoney, fmtDate } from "@/lib/format";
import { MemberFilterBar } from "@/components/MemberFilterBar";
import { MemberTag } from "@/components/MemberTag";
import { StatusBadge } from "@/components/StatusToggle";
import { useAppStore } from "@/lib/store";
import { addDays, isAfter, isBefore, parseISO } from "date-fns";
import { LifetimeChart } from "@/components/LifetimeChart";
import { ChevronRight, Building2, Shield, Landmark, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Home — FamilyVault" }] }),
});

function Dashboard() {
  const { today } = useToday();
  const memberFilter = useAppStore((s) => s.memberFilter);

  const { data } = useQuery({
    queryKey: ["dashboard", memberFilter],
    queryFn: async () => {
      const filter = (q: any) =>
        memberFilter === "all" ? q : q.eq("member_id", memberFilter);

      const [props, loans, insurance, invs] = await Promise.all([
        filter(supabase.from("properties").select("*")),
        filter(supabase.from("loans").select("*")),
        filter(supabase.from("insurance_policies").select("*")),
        filter(supabase.from("investments").select("*")),
      ]);
      return {
        properties: props.data ?? [],
        loans: loans.data ?? [],
        insurance: insurance.data ?? [],
        investments: invs.data ?? [],
      };
    },
  });

  const properties = data?.properties ?? [];
  const loans = data?.loans ?? [];
  const insurance = data?.insurance ?? [];

  const totalPropertyValue = properties.reduce((s, p: any) => s + (Number(p.current_value) || 0), 0);
  const monthlyIn = properties.reduce((s, p: any) => s + (Number(p.monthly_rent) || 0), 0);
  const monthlyOut =
    properties.reduce((s, p: any) => s + (Number(p.monthly_costs) || 0) + (Number(p.monthly_payment) || 0), 0) +
    loans.reduce((s, l: any) => s + (Number(l.monthly_payment) || 0), 0);
  const netCashFlow = monthlyIn - monthlyOut;

  // Upcoming payments (next 30d): insurance.next_due_date + property.fixed_rate_end + loan.reprice_date
  const horizon = addDays(today, 30);
  type Upcoming = { date: string; label: string; amount?: number | null; member_id?: string | null; href: string };
  const upcoming: Upcoming[] = [];
  for (const p of insurance as any[]) {
    if (p.next_due_date && isAfter(parseISO(p.next_due_date), today) && isBefore(parseISO(p.next_due_date), horizon)) {
      upcoming.push({ date: p.next_due_date, label: p.name, amount: p.premium, member_id: p.member_id, href: "/insurance" });
    }
  }
  for (const p of properties as any[]) {
    if (p.fixed_rate_end && isAfter(parseISO(p.fixed_rate_end), today) && isBefore(parseISO(p.fixed_rate_end), horizon)) {
      upcoming.push({ date: p.fixed_rate_end, label: `${p.name} — fixed rate ends`, amount: null, member_id: p.member_id, href: "/property" });
    }
  }
  upcoming.sort((a, b) => a.date.localeCompare(b.date));

  // Priority + Review across all tabs
  const all: Array<{ kind: string; row: any; href: string; icon: any }> = [
    ...properties.map((r: any) => ({ kind: "Property", row: r, href: "/property", icon: Building2 })),
    ...loans.map((r: any) => ({ kind: "Loan", row: r, href: "/loans", icon: Landmark })),
    ...insurance.map((r: any) => ({ kind: "Insurance", row: r, href: "/insurance", icon: Shield })),
    ...(data?.investments ?? []).map((r: any) => ({ kind: "Invest", row: r, href: "/investments", icon: TrendingUp })),
  ];
  const urgent = all.filter((x) => x.row.status === "urgent");
  const review = all.filter((x) => x.row.status === "review");

  // Today banner
  const dueToday = upcoming.find((u) => u.date === today.toISOString().slice(0, 10));

  return (
    <div className="space-y-5">
      {dueToday && (
        <Link to={dueToday.href as any} className="block rounded-2xl bg-review p-4 text-review-foreground">
          <div className="text-xs font-semibold uppercase">Due today</div>
          <div className="mt-1 text-base font-bold">{dueToday.label} {dueToday.amount ? `· ${fmtMoney(dueToday.amount)}` : ""}</div>
        </Link>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Property Value" value={fmtMoney(totalPropertyValue)} />
        <Kpi label="Net Monthly CF" value={fmtMoney(netCashFlow)} accent={netCashFlow >= 0 ? "good" : "bad"} />
        <Kpi label="Insurance Policies" value={String(insurance.length)} />
        <Kpi label="Active Alerts" value={String(urgent.length)} accent={urgent.length > 0 ? "bad" : "neutral"} />
      </div>

      <MemberFilterBar />

      {/* Upcoming payments */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Upcoming · next 30 days</h2>
          <span className="text-xs text-muted-foreground">{upcoming.length} item{upcoming.length === 1 ? "" : "s"}</span>
        </div>
        {upcoming.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing due soon ✓</p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.slice(0, 8).map((u, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground">{fmtDate(u.date)}</span>
                <span className="flex-1 truncate">{u.label}</span>
                <MemberTag memberId={u.member_id} />
                {u.amount != null && <span className="font-semibold">{fmtMoney(u.amount)}</span>}
                <Link to={u.href as any} className="text-primary"><ChevronRight className="h-4 w-4" /></Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Cash flow visual */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold">Monthly Cash Flow</h2>
        <CashFlowBars inflow={monthlyIn} outflow={monthlyOut} />
        <div className="mt-3 text-center">
          <div className="text-xs text-muted-foreground">Net</div>
          <div className={`text-2xl font-bold ${netCashFlow >= 0 ? "text-settled" : "text-urgent"}`}>
            {fmtMoney(netCashFlow)}
          </div>
        </div>
      </section>

      {/* Priority */}
      {urgent.length > 0 && (
        <PrioritySection title="Needs Attention" items={urgent} />
      )}
      {review.length > 0 && (
        <PrioritySection title="Review Needed" items={review} muted />
      )}

      {/* Lifetime chart */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-1 text-sm font-bold">Lifetime Cash Flow</h2>
        <p className="mb-3 text-xs text-muted-foreground">Projected next 40 years across all records.</p>
        <LifetimeChart properties={properties} loans={loans} insurance={insurance} />
      </section>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: "good" | "bad" | "neutral" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-bold ${accent === "good" ? "text-settled" : accent === "bad" ? "text-urgent" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function CashFlowBars({ inflow, outflow }: { inflow: number; outflow: number }) {
  const max = Math.max(inflow, outflow, 1);
  return (
    <div className="space-y-2">
      <div>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Inflows</span><span className="font-semibold">{fmtMoney(inflow)}</span></div>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-settled" style={{ width: `${(inflow / max) * 100}%` }} /></div>
      </div>
      <div>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Outflows</span><span className="font-semibold">{fmtMoney(outflow)}</span></div>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-urgent" style={{ width: `${(outflow / max) * 100}%` }} /></div>
      </div>
    </div>
  );
}

function PrioritySection({ title, items, muted }: { title: string; items: any[]; muted?: boolean }) {
  return (
    <section className={`rounded-2xl border p-4 ${muted ? "border-review/40 bg-review-soft/40" : "border-urgent/40 bg-urgent-soft/30"}`}>
      <h2 className="mb-3 text-sm font-bold">{title}</h2>
      <ul className="space-y-2">
        {items.slice(0, 8).map(({ kind, row, href, icon: Icon }, i) => (
          <li key={i}>
            <Link to={href as any} className="flex items-start gap-3 rounded-xl bg-card/80 p-3 hover:bg-card">
              <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">{kind}</span>
                  <span className="text-sm font-semibold truncate">{row.name || row.bank}</span>
                  <MemberTag memberId={row.member_id} />
                </div>
                {row.action && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.action}</p>}
              </div>
              <StatusBadge status={row.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
