import { useMembers } from "@/hooks/useMembers";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MemberFilterBar({ className }: { className?: string }) {
  const { data: members = [] } = useMembers();
  const { memberFilter, setMemberFilter } = useAppStore();

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <FilterChip
        active={memberFilter === "all"}
        onClick={() => setMemberFilter("all")}
        label="All"
      />
      {members.map((m) => (
        <FilterChip
          key={m.id}
          active={memberFilter === m.id}
          color={m.color}
          onClick={() => setMemberFilter(m.id)}
          label={m.short_name || m.name}
        />
      ))}
    </div>
  );
}

function FilterChip({
  active,
  color,
  onClick,
  label,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-accent",
      )}
      style={color && !active ? { borderColor: color + "55", color } : undefined}
    >
      {label}
    </button>
  );
}

export function MemberDot({
  color,
  label,
  className,
}: {
  color: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        className,
      )}
      style={{ borderColor: color + "55", color, background: color + "15" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
