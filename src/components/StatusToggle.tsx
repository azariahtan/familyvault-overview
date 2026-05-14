import { cn } from "@/lib/utils";

export type Status = "urgent" | "review" | "settled";

const config: Record<Status, { label: string; cls: string; dot: string }> = {
  urgent:  { label: "Urgent",  cls: "status-urgent",  dot: "🔴" },
  review:  { label: "Review",  cls: "status-review",  dot: "🟡" },
  settled: { label: "Settled", cls: "status-settled", dot: "🟢" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        c.cls,
        className,
      )}
    >
      <span className="text-[8px]">{c.dot}</span> {c.label}
    </span>
  );
}

export function StatusToggle({
  value,
  onChange,
}: {
  value: Status;
  onChange: (s: Status) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-muted p-0.5 text-[11px] font-semibold">
      {(["urgent", "review", "settled"] as Status[]).map((s) => {
        const c = config[s];
        const active = value === s;
        return (
          <button
            key={s}
            onClick={(e) => {
              e.stopPropagation();
              onChange(s);
            }}
            className={cn(
              "rounded-full px-2.5 py-1 transition",
              active ? c.cls : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c.dot} {c.label}
          </button>
        );
      })}
    </div>
  );
}
