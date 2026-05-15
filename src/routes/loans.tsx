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
import { HashHighlight } from "@/components/HashHighlight";

export const Route = createFileRoute("/loans")({
  component: LoansPage,
  head: () => ({ meta: [{ title: "Loans — FamilyVault" }] }),
});

function LoansPage() {
  const memberFilter = useAppStore((s) => s.memberFilter);
  const status = useStatusMutation("loans", "loans");
  const del = useDeleteMutation("loans", "loans");

  const { data: loans = [] } = useQuery({
    queryKey: ["loans", memberFilter],
    queryFn: async () => {
      let q = supabase.from("loans").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
      <MemberFilterBar />
      <div className="space-y-3">
        {sortByStatus(loans).map((l: any) => (
          <HashHighlight key={l.id} id={`record-${l.id}`}>
          <RecordCard
            title={`${l.bank} · ${l.purpose ?? ""}`}
            subtitle={l.rate_label || (l.rate ? `${l.rate}%` : "")}
            memberId={l.member_id}
            status={l.status}
            onStatusChange={(s) => status.mutate({ id: l.id, status: s })}
            action={l.action}
            onDelete={() => del.mutate(l.id)}
            rightMeta={
              <div className="text-right text-xs">
                <div className="font-bold">{fmtMoney(l.balance)}</div>
                {l.monthly_payment && <div className="text-muted-foreground">{fmtMoney(l.monthly_payment)}/mo</div>}
              </div>
            }
          >
            <Section title="Loan details">
              <FieldRow label="Balance" value={fmtMoney(l.balance)} />
              <FieldRow label="Rate" value={l.rate_label || fmtPct(l.rate)} />
              <FieldRow label="Monthly payment" value={fmtMoney(l.monthly_payment)} />
              <FieldRow label="Reprice date" value={fmtDate(l.reprice_date)} />
            </Section>
          </RecordCard>
          </HashHighlight>
        ))}
      </div>
      <AddRecordFab configKey="loans" />

    </div>
  );
}
