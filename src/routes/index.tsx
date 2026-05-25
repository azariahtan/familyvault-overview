import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";
import { MemberFilterBar } from "@/components/MemberFilterBar";
import { useMembers } from "@/hooks/useMembers";
import { fmtMoney, fmtDate } from "@/lib/format";
import { differenceInDays, isBefore, parseISO, isToday, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, ChevronDown, ChevronUp, Users } from "lucide-react";
import { useState } from "react";
import { MemberTag } from "@/components/MemberTag";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — FamilyVault" }] }),
});

type Status = "urgent" | "review" | "settled";

function statusRank(s: Status) { return s === "urgent" ? 0 : s === "review" ? 1 : 2; }

function DashSection({ title, icon, children, className }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {icon}{title}
      </h2>
      {children}
    </section>
  );
}

function KpiCard({ label, value, href, sub }: { label: string; value: string; href?: string; sub?: string }) {
  const inner = (
    <div className={cn("rounded-xl border border-border bg-card p-3 shadow-sm", href && "cursor-pointer transition hover:border-primary/40 hover:shadow-md")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold leading-tight">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
  if (href) return <Link to={href}>{inner}</Link>;
  return inner;
}

function AlertRow({ icon, label, sub, status }: { icon?: React.ReactNode; label: string; sub?: string; status: Status }) {
  const bg = status === "urgent" ? "bg-urgent-tint border-urgent-border" : "bg-review-tint border-review-border";
  return (
    <div className={cn("rounded-lg border px-3 py-2", bg)}>
      <div className="flex items-center gap-2">
        {icon}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{label}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const memberFilter = useAppStore((s) => s.memberFilter);
  const { data: members = [] } = useMembers();
  const [actionMemberFilter, setActionMemberFilter] = useState<string>("all");
  const [showNetBreakdown, setShowNetBreakdown] = useState(false);

  // ── Fetch all tables ─────────────────────────────────────────────
  const { data: properties = [] } = useQuery({
    queryKey: ["properties", memberFilter],
    queryFn: async () => {
      let q = supabase.from("properties").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data } = await q; return data ?? [];
    },
  });
  const { data: loans = [] } = useQuery({
    queryKey: ["loans", memberFilter],
    queryFn: async () => {
      let q = supabase.from("loans").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data } = await q; return data ?? [];
    },
  });
  const { data: insurance = [] } = useQuery({
    queryKey: ["insurance", memberFilter],
    queryFn: async () => {
      let q = supabase.from("insurance_policies").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data } = await q; return data ?? [];
    },
  });
  const { data: savings = [] } = useQuery({
    queryKey: ["savings", memberFilter],
    queryFn: async () => {
      let q = supabase.from("savings_accounts").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data } = await q; return data ?? [];
    },
  });
  const { data: investments = [] } = useQuery({
    queryKey: ["investments", memberFilter],
    queryFn: async () => {
      let q = supabase.from("investments").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data } = await q; return data ?? [];
    },
  });
  const { data: otherAssets = [] } = useQuery({
    queryKey: ["other_assets", memberFilter],
    queryFn: async () => {
      let q = supabase.from("other_assets" as any).select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data } = await q; return data ?? [];
    },
  });

  const today = new Date();
  const in30 = addDays(today, 30);
  const in90 = addDays(today, 90);

  // ── KPIs ─────────────────────────────────────────────────────────
  const totalPropertyValue = properties.reduce((s: number, p: any) => s + (Number(p.current_value) || 0), 0);
  const totalSavings = savings.reduce((s: number, a: any) => s + (Number(a.balance) || 0), 0);
  const totalInvestments = investments.reduce((s: number, i: any) => s + (Number(i.current_value) || 0), 0);
  const totalOther = otherAssets.reduce((s: number, a: any) => s + (Number(a.estimated_value) || 0), 0);
  const totalAssets = totalPropertyValue + totalSavings + totalInvestments + totalOther;

  const totalMortgages = properties.reduce((s: number, p: any) => s + (Number(p.mortgage_balance) || 0), 0);
  const totalLoans = loans.reduce((s: number, l: any) => s + (Number(l.balance) || 0), 0);
  const totalLiabilities = totalMortgages + totalLoans;
  const netWorth = totalAssets - totalLiabilities;

  // Monthly cash flow
  const monthlyRent = properties.reduce((s: number, p: any) => s + (Number(p.monthly_rent) || 0), 0);
  const monthlyMortgages = properties.reduce((s: number, p: any) => s + (Number(p.monthly_payment) || 0), 0);
  const monthlyOtherCosts = properties.reduce((s: number, p: any) =>
    s + (Number(p.cost_management) || 0) + (Number(p.cost_property_tax) || 0)
    + (Number(p.cost_fire_insurance) || 0) + (Number(p.cost_maintenance) || 0) + (Number(p.cost_other) || 0), 0);
  const monthlyCPFContrib = savings.filter((s: any) => s.account_type?.toLowerCase().includes("cpf")).reduce((s: number, a: any) => s + (Number(a.monthly_contribution) || 0), 0);
  const netMonthly = monthlyRent - monthlyMortgages - monthlyOtherCosts;

  // ── Upcoming alerts (next 30/90 days) ────────────────────────────
  function tryDate(str: string | null | undefined) {
    if (!str) return null;
    try { return parseISO(str); } catch { return null; }
  }

  const upcoming30: { label: string; sub: string; status: Status }[] = [];

  // Insurance due in 30 days
  for (const p of insurance) {
    const d = tryDate(p.next_due_date);
    if (!d) continue;
    const days = differenceInDays(d, today);
    if (days >= 0 && days <= 30) {
      upcoming30.push({
        label: p.name,
        sub: `Premium due ${fmtDate(p.next_due_date)}${p.premium ? ` · ${fmtMoney(p.premium)}` : ""}`,
        status: days <= 7 ? "urgent" : "review",
      });
    }
  }
  // Property rate ends in 90 days
  for (const p of properties) {
    const d = tryDate(p.fixed_rate_end);
    if (!d) continue;
    const days = differenceInDays(d, today);
    if (days >= 0 && days <= 90) {
      upcoming30.push({
        label: p.name,
        sub: `Fixed rate ends ${fmtDate(p.fixed_rate_end)}`,
        status: days <= 30 ? "urgent" : "review",
      });
    }
  }
  // Loan reprice in 90 days
  for (const l of loans) {
    const d = tryDate(l.reprice_date);
    if (!d) continue;
    const days = differenceInDays(d, today);
    if (days >= 0 && days <= 90) {
      upcoming30.push({
        label: `${l.bank} loan`,
        sub: `Reprice date ${fmtDate(l.reprice_date)}`,
        status: days <= 30 ? "urgent" : "review",
      });
    }
  }
  // FD maturity in 90 days
  for (const s of savings) {
    const d = tryDate(s.maturity_date);
    if (!d) continue;
    const days = differenceInDays(d, today);
    if (days >= 0 && days <= 90) {
      upcoming30.push({
        label: `${s.institution} FD`,
        sub: `Matures ${fmtDate(s.maturity_date)}`,
        status: days <= 30 ? "urgent" : "review",
      });
    }
  }

  // Due today
  const dueToday = upcoming30.filter((u) => {
    // Re-check original date strings — only exact today items
    return u.sub.includes(fmtDate(today.toISOString().slice(0, 10)));
  });

  // ── Needs attention (urgent/review) across ALL tabs ───────────────
  // NOTE: includes own_home (no purpose filter)
  const urgentItems = [
    ...properties.filter((p: any) => p.status === "urgent").map((p: any) => ({
      label: p.name, sub: p.action_note || p.purpose, member_id: p.member_id, action_member_id: p.action_member_id, tab: "/property",
    })),
    ...loans.filter((l: any) => l.status === "urgent").map((l: any) => ({
      label: `${l.bank} loan`, sub: l.action, member_id: l.member_id, action_member_id: l.action_member_id, tab: "/loans",
    })),
    ...insurance.filter((i: any) => i.status === "urgent").map((i: any) => ({
      label: i.name, sub: i.action, member_id: i.member_id, action_member_id: i.action_member_id, tab: "/insurance",
    })),
    ...investments.filter((i: any) => i.status === "urgent").map((i: any) => ({
      label: i.name, sub: i.action, member_id: i.member_id, action_member_id: i.action_member_id, tab: "/investments",
    })),
    ...savings.filter((s: any) => s.status === "urgent").map((s: any) => ({
      label: s.institution, sub: s.action, member_id: s.member_id, action_member_id: s.action_member_id, tab: "/savings",
    })),
    ...otherAssets.filter((a: any) => a.status === "urgent").map((a: any) => ({
      label: a.name, sub: a.action, member_id: a.member_id, action_member_id: a.action_member_id, tab: "/other-assets",
    })),
  ];

  const reviewItems = [
    ...properties.filter((p: any) => p.status === "review").map((p: any) => ({
      label: p.name, sub: p.action_note || p.purpose, member_id: p.member_id, action_member_id: p.action_member_id, tab: "/property",
    })),
    ...loans.filter((l: any) => l.status === "review").map((l: any) => ({
      label: `${l.bank} loan`, sub: l.action, member_id: l.member_id, action_member_id: l.action_member_id, tab: "/loans",
    })),
    ...insurance.filter((i: any) => i.status === "review").map((i: any) => ({
      label: i.name, sub: i.action, member_id: i.member_id, action_member_id: i.action_member_id, tab: "/insurance",
    })),
    ...investments.filter((i: any) => i.status === "review").map((i: any) => ({
      label: i.name, sub: i.action, member_id: i.member_id, action_member_id: i.action_member_id, tab: "/investments",
    })),
    ...savings.filter((s: any) => s.status === "review").map((s: any) => ({
      label: s.institution, sub: s.action, member_id: s.member_id, action_member_id: s.action_member_id, tab: "/savings",
    })),
    ...otherAssets.filter((a: any) => a.status === "review").map((a: any) => ({
      label: a.name, sub: a.action, member_id: a.member_id, action_member_id: a.action_member_id, tab: "/other-assets",
    })),
  ];

  // ── Action Items (urgent + review with action text, filterable by assignee) ──
  const allActionItems = [...urgentItems, ...reviewItems].filter((i: any) => i.sub);
  const filteredActionItems = actionMemberFilter === "all"
    ? allActionItems
    : allActionItems.filter((i: any) => i.action_member_id === actionMemberFilter);
  const totalAlerts = urgentItems.length + reviewItems.length;

  return (
    <div className="space-y-4">
      <MemberFilterBar />

      {/* Due Today Banner */}
      {dueToday.length > 0 && (
        <div className="rounded-xl bg-urgent/10 border border-urgent-border px-4 py-3">
          <p className="text-sm font-bold text-urgent">⚠️ {dueToday.length} item{dueToday.length !== 1 ? "s" : ""} due today</p>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-2">
        <KpiCard label="Total Assets" value={fmtMoney(totalAssets)} href="/savings" />
        <KpiCard label="Total Liabilities" value={fmtMoney(totalLiabilities)} href="/loans" />
        <KpiCard label="Net Worth" value={fmtMoney(netWorth)} />
        <KpiCard label="Active Alerts" value={String(totalAlerts)} sub="urgent + review items" />
      </div>

      {/* Monthly Cash Flow */}
      <DashSection title="Monthly Cash Flow">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Rental income</span>
          <span className="font-semibold text-settled">{fmtMoney(monthlyRent)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Mortgage payments</span>
          <span className="font-semibold text-urgent">−{fmtMoney(monthlyMortgages)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Property costs</span>
          <span className="font-semibold text-urgent">−{fmtMoney(monthlyOtherCosts)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-bold">
          <span>Net monthly</span>
          <span className={netMonthly >= 0 ? "text-settled" : "text-urgent"}>{fmtMoney(netMonthly)}</span>
        </div>
      </DashSection>

      {/* Net Worth Breakdown */}
      <DashSection title="Net Worth Breakdown">
        <button
          onClick={() => setShowNetBreakdown((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between text-xs text-muted-foreground"
        >
          <span>{showNetBreakdown ? "Hide breakdown" : "Show breakdown"}</span>
          {showNetBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showNetBreakdown && (
          <div className="mt-3 space-y-1.5 text-sm">
            {[
              { label: "Property values", value: totalPropertyValue },
              { label: "Savings & CPF", value: totalSavings },
              { label: "Investments", value: totalInvestments },
              { label: "Other assets", value: totalOther },
              { label: "Mortgages", value: -totalMortgages },
              { label: "Loans", value: -totalLoans },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-muted-foreground">{r.label}</span>
                <span className={cn("font-medium", r.value < 0 ? "text-urgent" : "text-foreground")}>
                  {r.value < 0 ? "−" : ""}{fmtMoney(Math.abs(r.value))}
                </span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
              <span>Net Worth</span>
              <span className={netWorth >= 0 ? "text-settled" : "text-urgent"}>{fmtMoney(netWorth)}</span>
            </div>
          </div>
        )}
      </DashSection>

      {/* Due in Next 30 Days */}
      {upcoming30.length > 0 && (
        <DashSection title="Due / Expiring Soon" icon={<Clock className="h-3.5 w-3.5" />}>
          <div className="space-y-2">
            {upcoming30.sort((a, b) => statusRank(a.status) - statusRank(b.status)).map((u, i) => (
              <AlertRow key={i} label={u.label} sub={u.sub} status={u.status} />
            ))}
          </div>
        </DashSection>
      )}

      {/* Action Items — filterable by assignee */}
      {allActionItems.length > 0 && (
        <DashSection title="Action Items" icon={<Users className="h-3.5 w-3.5" />}>
          {/* Assignee filter pills */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => setActionMemberFilter("all")}
              className={cn(
                "rounded-full border px-3 py-0.5 text-xs font-semibold transition",
                actionMemberFilter === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              )}
            >
              All
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setActionMemberFilter(m.id)}
                className={cn(
                  "rounded-full border px-3 py-0.5 text-xs font-semibold transition",
                  actionMemberFilter === m.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                )}
                style={actionMemberFilter === m.id ? {} : { borderColor: m.color + "55", color: m.color }}
              >
                {m.emoji} {m.name}
              </button>
            ))}
          </div>

          {filteredActionItems.length === 0 ? (
            <p className="text-xs text-muted-foreground">No actions assigned to this person.</p>
          ) : (
            <div className="space-y-2">
              {filteredActionItems.map((item: any, i: number) => (
                <Link key={i} to={item.tab} className="block">
                  <div className={cn(
                    "rounded-lg border px-3 py-2.5 transition hover:border-primary/40",
                    urgentItems.includes(item) ? "bg-urgent-tint border-urgent-border" : "bg-review-tint border-review-border"
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-tight">{item.label}</p>
                        {item.sub && <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <MemberTag memberId={item.member_id} />
                        {item.action_member_id && item.action_member_id !== item.member_id && (
                          <span className="text-[10px] text-muted-foreground">
                            👤 <MemberTag memberId={item.action_member_id} inline />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashSection>
      )}

      {/* Needs Attention (urgent) */}
      {urgentItems.length > 0 && (
        <DashSection title="Needs Attention" icon={<AlertTriangle className="h-3.5 w-3.5 text-urgent" />}>
          <div className="space-y-2">
            {urgentItems.map((item: any, i: number) => (
              <Link key={i} to={item.tab} className="block">
                <AlertRow label={item.label} sub={item.sub} status="urgent" />
              </Link>
            ))}
          </div>
        </DashSection>
      )}

      {/* Review Needed (amber) */}
      {reviewItems.length > 0 && (
        <DashSection title="Review Needed">
          <div className="space-y-2">
            {reviewItems.map((item: any, i: number) => (
              <Link key={i} to={item.tab} className="block">
                <AlertRow label={item.label} sub={item.sub} status="review" />
              </Link>
            ))}
          </div>
        </DashSection>
      )}
    </div>
  );
}
