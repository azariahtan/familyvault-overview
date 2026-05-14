import { useState, type ReactNode } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { StatusToggle, type Status } from "./StatusToggle";
import { MemberTag } from "./MemberTag";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  memberId?: string | null;
  status: Status;
  onStatusChange: (s: Status) => void;
  action?: string | null;
  rightMeta?: ReactNode;
  children?: ReactNode; // expanded body
  onEdit?: () => void;
  onDelete?: () => void;
  defaultOpen?: boolean;
  highlight?: boolean;
};

export function RecordCard({
  title,
  subtitle,
  memberId,
  status,
  onStatusChange,
  action,
  rightMeta,
  children,
  onEdit,
  onDelete,
  defaultOpen = false,
  highlight,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <article
      className={cn(
        "group rounded-2xl border bg-card shadow-sm transition",
        status === "urgent" && "border-urgent/50 ring-1 ring-urgent/20",
        status === "review" && "border-review/40",
        status === "settled" && "border-border opacity-90",
        highlight && "ring-2 ring-primary",
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            <MemberTag memberId={memberId} />
          </div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          {action && (
            <p className="line-clamp-2 text-sm text-foreground/90">
              <span className="font-medium text-primary">Action:</span> {action}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {rightMeta}
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")}
          />
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2">
        <StatusToggle value={status} onChange={onStatusChange} />
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this record?")) onDelete();
              }}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-urgent/10 hover:text-urgent"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {open && children && (
        <div className="space-y-4 border-t border-border bg-muted/30 p-4">{children}</div>
      )}
    </article>
  );
}

export function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}
