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
          emoji={m.emoji}
        />
      ))}
    </div>
  );
}

function FilterChip({
  active, color, onClick, label, emoji,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  label: string;
  emoji?: string | null;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-accent",
      )}
      style={color && !active ? { borderColor: color + "55", color } : undefined}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
}

export function MemberDot({
  color, label, className, emoji,
}: {
  color: string;
  label?: string;
  className?: string;
  emoji?: string | null;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        className,
      )}
      style={{ borderColor: color + "55", color, background: color + "15" }}
    >
      {emoji ? <span className="text-xs leading-none">{emoji}</span> : <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {label}
    </span>
  );
}
