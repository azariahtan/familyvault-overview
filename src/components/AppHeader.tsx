import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertsSheet } from "@/components/AlertsSheet";
import { addDays, differenceInDays, parseISO } from "date-fns";

export function AppHeader({ desktopMode = false }: { desktopMode?: boolean }) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const qc = useQueryClient();

  // Fetch family name
  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  const familyName = settings?.family_name ?? "FamilyVault";

  // Compute alert count from all tabs
  const { data: alertCount = 0 } = useQuery({
    queryKey: ["alert_count"],
    queryFn: async () => {
      const today = new Date();
      const in90 = addDays(today, 90);

      const [properties, loans, insurance, savings] = await Promise.all([
        supabase.from("properties").select("status, fixed_rate_end").neq("status", "settled"),
        supabase.from("loans").select("status, reprice_date").neq("status", "settled"),
        supabase.from("insurance_policies").select("status, next_due_date").neq("status", "settled"),
        supabase.from("savings_accounts").select("status, maturity_date").neq("status", "settled"),
      ]);

      let count = 0;

      // Count urgent/review records
      const allRecords = [
        ...(properties.data ?? []),
        ...(loans.data ?? []),
        ...(insurance.data ?? []),
        ...(savings.data ?? []),
      ];
      count += allRecords.filter((r: any) => r.status === "urgent" || r.status === "review").length;

      // Count upcoming date alerts (not already counted above)
      for (const p of (properties.data ?? [])) {
        if (p.fixed_rate_end && p.status === "settled") {
          const d = parseISO(p.fixed_rate_end);
          if (d <= in90) count++;
        }
      }
      for (const l of (loans.data ?? [])) {
        if (l.reprice_date && l.status === "settled") {
          const d = parseISO(l.reprice_date);
          if (d <= in90) count++;
        }
      }
      for (const i of (insurance.data ?? [])) {
        if (i.next_due_date && i.status === "settled") {
          const d = parseISO(i.next_due_date);
          const days = differenceInDays(d, today);
          if (days >= 0 && days <= 30) count++;
        }
      }

      return count;
    },
    // Refetch every 30 seconds as fallback
    refetchInterval: 30_000,
  });

  // Realtime subscription → instant bell update when any record changes
  useEffect(() => {
    const tables = ["properties", "loans", "insurance_policies", "savings_accounts", "investments", "health_conditions", "other_assets"];
    const channels = tables.map((table) =>
      supabase
        .channel(`realtime_${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, () => {
          qc.invalidateQueries({ queryKey: ["alert_count"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        })
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [qc]);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <span className="text-sm font-bold">{familyName}</span>
      <button
        onClick={() => setAlertsOpen(true)}
        className="relative cursor-pointer rounded-full p-2 hover:bg-accent"
        aria-label="Alerts"
      >
        <Bell className="h-5 w-5" />
        {alertCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-urgent text-[9px] font-bold text-white">
            {alertCount > 99 ? "99+" : alertCount}
          </span>
        )}
      </button>
      <AlertsSheet open={alertsOpen} onOpenChange={setAlertsOpen} />
    </header>
  );
}
