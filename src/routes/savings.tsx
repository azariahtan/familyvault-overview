import { AddRecordFab } from "@/components/AddRecordFab";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";
import { MemberFilterBar } from "@/components/MemberFilterBar";
import { RecordCard, FieldRow, Section } from "@/components/RecordCard";
import { useStatusMutation, useDeleteMutation } from "@/lib/mutations";
import { sortByStatus } from "@/lib/sort";
import { fmtMoney, fmtDate, fmtPct } from "@/lib/format";

export const Route = createFileRoute("/savings")({
  component: SavingsPage,
  head: () => ({ meta: [{ title: "Savings — FamilyVault" }] }),
});

function SavingsPage() {
  const memberFilter = useAppStore((s) => s.memberFilter);
  const status = useStatusMutation("savings_accounts", "savings");
  const del = useDeleteMutation("savings_accounts", "savings");

  const { data: items = [] } = useQuery({
    queryKey: ["savings", memberFilter],
    queryFn: async () => {
      let q = supabase.from("savings_accounts").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const groups = Array.from(new Set(items.map((i: any) => i.group_name)));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Savings</h1>
      <MemberFilterBar />
      {groups.map((g) => (
        <section key={g}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{g}</h2>
          <div className="space-y-3">
            {sortByStatus(items.filter((i: any) => i.group_name === g)).map((a: any) => (
              <RecordCard
                key={a.id}
                title={`${a.institution} · ${a.account_type ?? ""}`}
                subtitle={a.note}
                memberId={a.member_id}
                status={a.status}
                onStatusChange={(s) => status.mutate({ id: a.id, status: s })}
                action={a.note}
                onDelete={() => del.mutate(a.id)}
                rightMeta={
                  <div className="text-right text-xs">
                    <div className="font-bold">{fmtMoney(a.balance)}</div>
                    {a.interest_rate != null && <div className="text-muted-foreground">{fmtPct(a.interest_rate)}</div>}
                  </div>
                }
              >
                <Section title="Account">
                  <FieldRow label="Balance" value={fmtMoney(a.balance)} />
                  <FieldRow label="Interest rate" value={fmtPct(a.interest_rate)} />
                  <FieldRow label="Maturity" value={fmtDate(a.maturity_date)} />
                  <FieldRow label="Last updated" value={fmtDate(a.last_updated)} />
                </Section>
              </RecordCard>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
