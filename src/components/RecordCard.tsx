import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Pencil, Trash2, FileText, Paperclip } from "lucide-react";
import { StatusToggle, StatusBadge, type Status } from "@/components/StatusToggle";
import { MemberTag } from "@/components/MemberTag";

export type RecordCardProps = {
  title: string;
  subtitle?: string;
  memberId?: string | null;
  actionMemberId?: string | null;
  status: Status;
  action?: string | null;
  onStatusChange: (s: Status) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  rightMeta?: ReactNode;
  children?: ReactNode;
  /** Pass true if this record has saved notes */
  hasNotes?: boolean;
  /** Pass true if this record has saved documents */
  hasDocs?: boolean;
  /** If provided, card starts expanded */
  defaultOpen?: boolean;
};

const tintBg: Record<Status, string> = {
  urgent: "bg-urgent-tint border-urgent-border",
  review: "bg-review-tint border-review-border",
  settled: "bg-settled-tint border-settled-border",
};

export function RecordCard({
  title, subtitle, memberId, actionMemberId, status, action, onStatusChange,
  onEdit, onDelete, rightMeta, children, hasNotes, hasDocs, defaultOpen = false,
}: RecordCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className={cn("relative rounded-2xl border shadow-sm transition", tintBg[status])}>
      {/* Edit / Delete */}
      {(onEdit || onDelete) && (
        <div className="absolute right-2 top-2 z-10 flex gap-0.5">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-background/60 hover:text-foreground"
              aria-label="Edit"
            >
              <Pencil className="h-[18px] w-[18px]" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); if (confirm("Delete this record?")) onDelete(); }}
              className="cursor-pointer rounded-md p-1 text-urgent hover:bg-urgent/10"
              aria-label="Delete"
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      )}

      {/* Header — tap to expand/collapse */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-start gap-3 p-4 pr-20 text-left"
      >
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            {memberId && <MemberTag memberId={memberId} />}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {/* Action preview on collapsed card */}
          {!open && action && (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/60">→</span> {action}
            </p>
          )}
          {/* Notes / docs indicator chips */}
          {!open && (hasNotes || hasDocs) && (
            <div className="flex items-center gap-2 pt-0.5">
              {hasNotes && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border/60">
                  <FileText className="h-3 w-3" /> Notes
                </span>
              )}
              {hasDocs && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border/60">
                  <Paperclip className="h-3 w-3" /> Docs
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 pt-1">
          {rightMeta || <StatusBadge status={status} />}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")} />
        </div>
      </button>

      {/* Status toggle bar */}
      <div className="flex items-center justify-between gap-2 border-t border-border/40 px-4 py-2">
        <StatusToggle value={status} onChange={onStatusChange} />
        {actionMemberId && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>→</span>
            <MemberTag memberId={actionMemberId} />
          </span>
        )}
      </div>

      {/* Expanded content */}
      {open && (
        <div className="space-y-3 border-t border-border/40 bg-background/40 p-4">
          {children}
        </div>
      )}
    </article>
  );
}

/** A labelled field row inside an expanded card */
export function FieldRow({ label, value }: { label: string; value?: ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm">
      <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

/** A titled group of FieldRows */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</h4>
      {children}
    </div>
  );
}
