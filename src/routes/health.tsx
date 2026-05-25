import { AddRecordFab } from "@/components/AddRecordFab";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMembers } from "@/hooks/useMembers";
import { useAppStore } from "@/lib/store";
import { MemberFilterBar } from "@/components/MemberFilterBar";
import { useStatusMutation, useDeleteMutation } from "@/lib/mutations";
import { sortByStatus } from "@/lib/sort";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { NotesEditor } from "@/components/loan/NotesEditor";
import { DocumentsList } from "@/components/loan/DocumentsList";
import { FileText, Paperclip, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useEditRecord } from "@/components/EditRecordButton";
import { StatusToggle, StatusBadge, type Status } from "@/components/StatusToggle";
import { MemberTag } from "@/components/MemberTag";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/health")({
  component: HealthPage,
  head: () => ({ meta: [{ title: "Health — FamilyVault" }] }),
});

const tintBg: Record<Status, string> = {
  urgent: "bg-urgent-tint border-urgent-border",
  review: "bg-review-tint border-review-border",
  settled: "bg-settled-tint border-settled-border",
};

function HealthPage() {
  const memberFilter = useAppStore((s) => s.memberFilter);
  const status = useStatusMutation("health_conditions", "health");
  const del = useDeleteMutation("health_conditions", "health");
  const { data: members = [] } = useMembers();

  const { data: items = [] } = useQuery({
    queryKey: ["health", memberFilter],
    queryFn: async () => {
      let q = supabase.from("health_conditions").select("*");
      if (memberFilter !== "all") q = q.eq("member_id", memberFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Health</h1>
      <MemberFilterBar />
      {members.map((m) => {
        const conditions = items.filter((c: any) => c.member_id === m.id);
        if (conditions.length === 0) return null;
        return (
          <section key={m.id}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: m.color }}>
              {m.emoji} {m.name}
            </h2>
            <div className="space-y-3">
              {sortByStatus(conditions).map((c: any) => (
                <HealthCard
                  key={c.id}
                  c={c}
                  onStatus={(s) => status.mutate({ id: c.id, status: s })}
                  onDelete={() => del.mutate(c.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
      <AddRecordFab configKey="health_conditions" />
    </div>
  );
}

function HealthCard({ c, onStatus, onDelete }: {
  c: any;
  onStatus: (s: Status) => void;
  onDelete: () => void;
}) {
  const edit = useEditRecord("health_conditions", c);
  // Collapsed by default
  const [open, setOpen] = useState(false);

  const supplements: string[] = Array.isArray(c.supplements) ? c.supplements : [];
  const actions: string[] = Array.isArray(c.actions) ? c.actions : [];

  return (
    <>
      <article className={cn("relative rounded-2xl border shadow-sm transition", tintBg[c.status as Status])}>
        {/* Edit / Delete buttons */}
        <div className="absolute right-2 top-2 z-10 flex gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); edit.open(); }}
            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-background/60 hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm("Delete this record?")) onDelete(); }}
            className="cursor-pointer rounded-md p-1 text-urgent hover:bg-urgent/10"
            aria-label="Delete"
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Collapsed header — tap to expand */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full cursor-pointer items-start gap-3 p-4 pr-20 text-left"
        >
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold leading-tight">{c.name}</h3>
              <MemberTag memberId={c.member_id} />
            </div>

            {/* Preview row — supplements and actions shown when collapsed */}
            {!open && (
              <div className="space-y-0.5">
                {supplements.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/70">💊 Take:</span>{" "}
                    {supplements.join(" · ")}
                  </p>
                )}
                {actions.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/70">✅ Do:</span>{" "}
                    {actions.join(" · ")}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 pt-1">
            <StatusBadge status={c.status as Status} />
            <ChevronDown
              className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")}
            />
          </div>
        </button>

        {/* Status toggle bar */}
        <div className="flex items-center justify-between gap-2 border-t border-border/40 px-4 py-2">
          <StatusToggle value={c.status as Status} onChange={onStatus} />
        </div>

        {/* Expanded content */}
        {open && (
          <div className="space-y-4 border-t border-border/40 bg-background/40 p-4">
            {supplements.length > 0 && (
              <section>
                <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Take</h4>
                <div className="flex flex-wrap gap-1.5">
                  {supplements.map((s) => (
                    <span key={s} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">{s}</span>
                  ))}
                </div>
              </section>
            )}
            {actions.length > 0 && (
              <section>
                <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Do</h4>
                <div className="flex flex-wrap gap-1.5">
                  {actions.map((s) => (
                    <span key={s} className="rounded-full bg-settled-soft px-2.5 py-1 text-xs font-medium text-settled">{s}</span>
                  ))}
                </div>
              </section>
            )}
            {c.details && (
              <section>
                <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Details</h4>
                <p className="text-sm text-foreground/80">{c.details}</p>
              </section>
            )}
            <CollapsibleSection icon={<FileText className="h-4 w-4" />} title="Notes">
              <NotesEditor table="health_conditions" queryKey="health" id={c.id} value={c.notes} />
            </CollapsibleSection>
            <CollapsibleSection icon={<Paperclip className="h-4 w-4" />} title="Documents">
              <DocumentsList entityType="health" entityId={c.id} />
            </CollapsibleSection>
          </div>
        )}
      </article>
      {edit.element}
    </>
  );
}
