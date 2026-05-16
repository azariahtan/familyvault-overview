import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleSection({
  icon,
  title,
  defaultOpen = false,
  count,
  children,
}: {
  icon?: ReactNode;
  title: string;
  defaultOpen?: boolean;
  count?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-border/60 bg-background/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
          {count != null && count > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {count}
            </span>
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-border/40 px-3 py-3">{children}</div>}
    </section>
  );
}
