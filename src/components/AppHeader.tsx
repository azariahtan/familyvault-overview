import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToday } from "@/lib/today";

export function AppHeader() {
  const { simulated, today } = useToday();
  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });
  const { data: alertCount = 0 } = useQuery({
    queryKey: ["alert-count"],
    queryFn: async () => {
      const tables = ["properties", "loans", "insurance_policies", "investments", "health_conditions"];
      let count = 0;
      for (const t of tables) {
        const { count: c } = await supabase.from(t as any).select("*", { count: "exact", head: true }).eq("status", "urgent");
        count += c ?? 0;
      }
      return count;
    },
    refetchInterval: 30_000,
  });

  return (
    <>
      {simulated && (
        <div className="bg-review px-4 py-2 text-center text-xs font-semibold text-review-foreground">
          ⚠ Test Mode: Simulating {today.toDateString()}
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">FamilyVault</div>
            <h1 className="text-lg font-bold tracking-tight">{settings?.family_name ?? "Our Family"}</h1>
          </div>
          <Link to="/" className="relative rounded-full p-2 hover:bg-accent" aria-label="Alerts">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-urgent px-1 text-[9px] font-bold text-urgent-foreground">
                {alertCount}
              </span>
            )}
          </Link>
        </div>
      </header>
    </>
  );
}
