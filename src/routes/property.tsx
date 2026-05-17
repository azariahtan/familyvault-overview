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
import { useEditRecord } from "@/components/EditRecordButton";
import { PROPERTY_PURPOSE_LABEL } from "@/lib/options";

export const Route = createFileRoute("/property")({
  component: PropertyPage,
  head: () => ({ meta: [{ title: "Property — FamilyVault" }] }),
});

function PropertyPage() {
  const memberFilter = useAppStore((s) => s.memberFilter);
  const status = useStatusMutation("properties", "properties");
  const del = useDeleteMutation("properties", "properties");

  const { data: properties = [] } = useQuery({
    queryKey: ["properties", memberFilter],
    queryFn: async () => {
      let q = supabase.from("properties").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const investments = properties.filter((p: any) => p.purpose !== "own_home");
  const homes = properties.filter((p: any) => p.purpose === "own_home");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Property</h1>
      <MemberFilterBar />

      <div className="space-y-3">
        {sortByStatus(investments).map((p: any) => (
          <PropertyRow
            key={p.id}
            p={p}
            onStatus={(s) => status.mutate({ id: p.id, status: s })}
            onDelete={() => del.mutate(p.id)}
          />
        ))}
      </div>

      {homes.length > 0 && (
        <details className="rounded-2xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">My Homes ▾</summary>
          <div className="mt-3 space-y-3">
            {homes.map((p: any) => (
              <PropertyRow
                key={p.id}
                p={p}
                onStatus={(s) => status.mutate({ id: p.id, status: s })}
                onDelete={() => del.mutate(p.id)}
              />
            ))}
          </div>
        </details>
      )}
      <AddRecordFab configKey="properties" />
    </div>
  );
}

function PropertyRow({ p, onStatus, onDelete }: { p: any; onStatus: (s: any) => void; onDelete: () => void }) {
  const edit = useEditRecord("properties", p);
  return (
    <HashHighlight id={`record-${p.id}`}>
      <RecordCard
        title={p.name}
        subtitle={`${PROPERTY_PURPOSE_LABEL[p.purpose] ?? "Other"} · ${p.currency}`}
        memberId={p.member_id}
        status={p.status}
        onStatusChange={onStatus}
        action={p.strategy}
        onEdit={edit.open}
        onDelete={onDelete}
        rightMeta={
          <div className="text-right text-xs">
            <div className="font-bold">{fmtMoney(p.current_value, p.currency)}</div>
            {p.monthly_rent && <div className="text-muted-foreground">{fmtMoney(p.monthly_rent, p.currency)}/mo</div>}
          </div>
        }
      >
        <Section title="Financials">
          <FieldRow label="Purchase price" value={fmtMoney(p.purchase_price, p.currency)} />
          <FieldRow label="Current value" value={fmtMoney(p.current_value, p.currency)} />
          <FieldRow label="Capital gain" value={fmtMoney((p.current_value || 0) - (p.purchase_price || 0), p.currency)} />
          <FieldRow label="Mortgage" value={p.mortgage_bank ? `${p.mortgage_bank} · ${fmtMoney(p.mortgage_balance, p.currency)}` : "—"} />
          <FieldRow label="Monthly payment" value={fmtMoney(p.monthly_payment, p.currency)} />
          <FieldRow label="Interest rate" value={fmtPct(p.interest_rate)} />
          <FieldRow label="Fixed rate ends" value={fmtDate(p.fixed_rate_end)} />
          <FieldRow label="Monthly rent" value={fmtMoney(p.monthly_rent, p.currency)} />
          <FieldRow label="Monthly costs" value={fmtMoney(p.monthly_costs, p.currency)} />
          <FieldRow
            label="Loan vs Value %"
            value={p.current_value && p.mortgage_balance ? fmtPct((p.mortgage_balance / p.current_value) * 100) : "—"}
          />
          <FieldRow
            label="Gross yield %"
            value={p.current_value && p.monthly_rent ? fmtPct(((p.monthly_rent * 12) / p.current_value) * 100) : "—"}
          />
        </Section>
      </RecordCard>
      {edit.element}
    </HashHighlight>
  );
}
