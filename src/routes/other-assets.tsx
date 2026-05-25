import { AddRecordFab } from "@/components/AddRecordFab";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";
import { MemberFilterBar } from "@/components/MemberFilterBar";
import { RecordCard, FieldRow, Section } from "@/components/RecordCard";
import { useStatusMutation, useDeleteMutation } from "@/lib/mutations";
import { sortByStatus } from "@/lib/sort";
import { fmtMoney, fmtDate } from "@/lib/format";
import { HashHighlight } from "@/components/HashHighlight";
import { useEditRecord } from "@/components/EditRecordButton";
import { differenceInDays, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { NotesLog } from "@/components/NotesLog";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { MemberTag } from "@/components/MemberTag";

export const Route = createFileRoute("/other-assets")({
  component: OtherAssetsPage,
  head: () => ({ meta: [{ title: "Other Assets — FamilyVault" }] }),
});

const OTHER_ASSET_CATEGORIES = [
  "Gold / Silver",
  "Car",
  "Jewellery",
  "Art / Collectibles",
  "Other",
];

function staleDays(lastUpdated: string | null | undefined) {
  if (!lastUpdated) return null;
  try { return differenceInDays(new Date(), parseISO(lastUpdated)); } catch { return null; }
}

function UpdateValueInline({ id, current }: { id: string; current: number | null | undefined }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(current?.toString() ?? "");
  const qc = useQueryClient();

  async function save() {
    const num = Number(val.replace(/,/g, ""));
    if (isNaN(num)) { toast.error("Enter a valid number"); return; }
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("other_assets" as any).update({ estimated_value: num, last_updated: today }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Value updated");
      qc.invalidateQueries({ queryKey: ["other_assets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setEditing(false);
    }
  }

  if (!editing) {
    return (
      <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs"
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
        Update
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Input type="text" inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} className="h-7 w-28 text-xs" autoFocus />
      <Button type="button" size="sm" className="h-7 px-2 text-xs" onClick={save}>Save</Button>
      <Button type="button" size="sm" variant="ghost" className="h-7 px-1.5 text-xs" onClick={() => setEditing(false)}>✕</Button>
    </div>
  );
}

function OtherAssetsPage() {
  const memberFilter = useAppStore((s) => s.memberFilter);
  const status = useStatusMutation("other_assets" as any, "other_assets");
  const del = useDeleteMutation("other_assets" as any, "other_assets");

  const { data: items = [] } = useQuery({
    queryKey: ["other_assets", memberFilter],
    queryFn: async () => {
      let q = supabase.from("other_assets" as any).select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const groups = OTHER_ASSET_CATEGORIES.filter((cat) =>
    items.some((i: any) => i.category === cat)
  );
  const totalValue = items.reduce((s: number, i: any) => s + (Number(i.estimated_value) || 0), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Other Assets</h1>
      {items.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"} · Total est. {fmtMoney(totalValue)}
        </p>
      )}
      <MemberFilterBar />

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No assets yet. Tap + to add gold, cars, jewellery and more.</p>
        </div>
      )}

      {groups.map((cat) => (
        <section key={cat}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{cat}</h2>
          <div className="space-y-3">
            {sortByStatus(items.filter((i: any) => i.category === cat)).map((a: any) => (
              <AssetRow
                key={a.id}
                a={a}
                onStatus={(s) => status.mutate({ id: a.id, status: s })}
                onDelete={() => del.mutate(a.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Items with no matching category group */}
      {items.filter((i: any) => !OTHER_ASSET_CATEGORIES.includes(i.category)).length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Other</h2>
          <div className="space-y-3">
            {sortByStatus(items.filter((i: any) => !OTHER_ASSET_CATEGORIES.includes(i.category))).map((a: any) => (
              <AssetRow
                key={a.id}
                a={a}
                onStatus={(s) => status.mutate({ id: a.id, status: s })}
                onDelete={() => del.mutate(a.id)}
              />
            ))}
          </div>
        </section>
      )}

      <AddRecordFab configKey="other_assets" />
    </div>
  );
}

function AssetRow({ a, onStatus, onDelete }: { a: any; onStatus: (s: any) => void; onDelete: () => void }) {
  const edit = useEditRecord("other_assets", a);
  const stale = staleDays(a.last_updated);
  const isStale = stale != null && stale >= 30;

  return (
    <>
      <HashHighlight id={`record-${a.id}`}>
        <RecordCard
          title={a.name}
          subtitle={a.category}
          memberId={a.member_id}
          status={a.status}
          onStatusChange={onStatus}
          action={a.action}
          onEdit={edit.open}
          onDelete={onDelete}
          rightMeta={
            <div className="text-right text-xs">
              <div className="font-bold">{fmtMoney(a.estimated_value)}</div>
              <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                {isStale && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "hsl(38 95% 55%)" }} aria-label="Value is stale" />
                )}
                <span>{a.last_updated ? `Updated: ${fmtDate(a.last_updated)}` : "Never updated"}</span>
              </div>
            </div>
          }
        >
          <Section title="Details">
            <FieldRow label="Category" value={a.category} />
            <FieldRow label="Est. value" value={fmtMoney(a.estimated_value)} />
            <FieldRow label="Last updated" value={fmtDate(a.last_updated)} />
            {a.action_member_id && (
              <FieldRow label="Action by" value={<MemberTag memberId={a.action_member_id} />} />
            )}
          </Section>
          {a.notes && (
            <Section title="Notes">
              <p className="text-sm text-foreground/80">{a.notes}</p>
            </Section>
          )}
          <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-border/60 px-3 py-2">
            <div className="text-xs">
              {isStale ? (
                <span className="font-medium" style={{ color: "hsl(38 95% 35%)" }}>● Update value</span>
              ) : (
                <span className="text-muted-foreground">Update value</span>
              )}
            </div>
            <UpdateValueInline id={a.id} current={a.estimated_value} />
          </div>
        </RecordCard>
      </HashHighlight>
      {edit.element}
    </>
  );
}
