import { AddRecordFab } from "@/components/AddRecordFab";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";
import { MemberFilterBar } from "@/components/MemberFilterBar";
import { RecordCard, FieldRow, Section } from "@/components/RecordCard";
import { useStatusMutation, useDeleteMutation } from "@/lib/mutations";
import { sortByStatus } from "@/lib/sort";
import { fmtMoney, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/insurance")({
  component: InsurancePage,
  head: () => ({ meta: [{ title: "Insurance — FamilyVault" }] }),
});

function InsurancePage() {
  const memberFilter = useAppStore((s) => s.memberFilter);
  const status = useStatusMutation("insurance_policies", "insurance");
  const del = useDeleteMutation("insurance_policies", "insurance");

  const { data: items = [] } = useQuery({
    queryKey: ["insurance", memberFilter],
    queryFn: async () => {
      let q = supabase.from("insurance_policies").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalAnnual = items.reduce((s: number, i: any) => {
    if (!i.premium) return s;
    const f = (i.frequency || "annual").toLowerCase();
    const mult = f.includes("month") ? 12 : f.includes("quart") ? 4 : f.includes("semi") ? 2 : 1;
    return s + Number(i.premium) * mult;
  }, 0);

  const categories = Array.from(new Set(items.map((i: any) => i.category)));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Insurance</h1>
      <p className="text-xs text-muted-foreground">
        {items.length} policies · {fmtMoney(totalAnnual)}/year total
      </p>
      <MemberFilterBar />

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No policies yet. Tap + to add your first.</p>
        </div>
      )}

      {categories.map((cat) => (
        <section key={cat}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{cat}</h2>
          <div className="space-y-3">
            {sortByStatus(items.filter((i: any) => i.category === cat)).map((p: any) => (
              <RecordCard
                key={p.id}
                title={p.name}
                subtitle={p.provider}
                memberId={p.member_id}
                status={p.status}
                onStatusChange={(s) => status.mutate({ id: p.id, status: s })}
                action={p.action}
                onDelete={() => del.mutate(p.id)}
                rightMeta={<div className="text-xs font-bold">{fmtMoney(p.premium)}/{p.frequency || "yr"}</div>}
              >
                <Section title="Policy">
                  <FieldRow label="Policy #" value={p.policy_number} />
                  <FieldRow label="Sum assured" value={fmtMoney(p.sum_assured)} />
                  <FieldRow label="Start" value={fmtDate(p.start_date)} />
                  <FieldRow label="End" value={fmtDate(p.end_date)} />
                  <FieldRow label="Next due" value={fmtDate(p.next_due_date)} />
                </Section>
              </RecordCard>
            ))}
          </div>
        </section>
      ))}
      <AddRecordFab configKey="insurance_policies" />

    </div>
  );
}
