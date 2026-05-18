import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Building2, Shield, Landmark, TrendingUp, Heart, ChevronRight } from "lucide-react";
import { MemberTag } from "./MemberTag";

const SOURCES = [
  { table: "properties",         href: "/property",    kind: "Property",  icon: Building2,  title: (r: any) => r.name },
  { table: "loans",              href: "/loans",       kind: "Loan",      icon: Landmark,   title: (r: any) => `${r.bank} · ${r.purpose ?? ""}` },
  { table: "insurance_policies", href: "/insurance",   kind: "Insurance", icon: Shield,     title: (r: any) => r.name },
  { table: "investments",        href: "/investments", kind: "Invest",    icon: TrendingUp, title: (r: any) => r.name },
  { table: "health_conditions",  href: "/health",      kind: "Health",    icon: Heart,      title: (r: any) => r.name },
] as const;

export function AlertsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data } = useQuery({
    queryKey: ["alerts-all"],
    enabled: open,
    queryFn: async () => {
      const results = await Promise.all(
        SOURCES.map(async (s) => {
          const { data } = await supabase
            .from(s.table as any)
            .select("*")
            .in("status", ["urgent", "review"]);
          return (data ?? []).map((row: any) => ({ row, src: s }));
        }),
      );
      return results.flat();
    },
  });
  const all = data ?? [];
  const urgent = all.filter((x) => x.row.status === "urgent");
  const review = all.filter((x) => x.row.status === "review");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Alerts</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-5">
          <Group title="🔴 Urgent" items={urgent} empty="No urgent items." onNav={() => onOpenChange(false)} />
          <Group title="🟡 Review Needed" items={review} empty="Nothing to review." onNav={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Group({ title, items, empty, onNav }: { title: string; items: any[]; empty: string; onNav: () => void }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title} <span className="text-foreground">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ row, src }, i) => {
            const Icon = src.icon;
            return (
              <li key={i}>
                <Link
                  to={src.href as any}
                  hash={`record-${row.id}`}
                  onClick={onNav}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3 hover:bg-accent/50"
                >
                  <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">{src.kind}</span>
                      <span className="truncate text-sm font-semibold">{src.title(row)}</span>
                      <MemberTag memberId={row.member_id} />
                    </div>
                    {(row.action_note || row.action || row.strategy) && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {row.action_note || row.action || row.strategy}
                      </p>
                    )}
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                    View <ChevronRight className="h-3 w-3" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function useAlertsSheet() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
