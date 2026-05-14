import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — FamilyVault" }] }),
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });
  const [familyName, setFamilyName] = useState("");
  const [simDate, setSimDate] = useState("");

  const save = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await supabase.from("app_settings").update(patch).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app_settings"] });
      toast.success("Saved");
    },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold">Family</h2>
        <label className="block text-xs font-medium text-muted-foreground">Family name</label>
        <input
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          defaultValue={settings?.family_name ?? ""}
          onChange={(e) => setFamilyName(e.target.value)}
        />
        <button
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          onClick={() => save.mutate({ family_name: familyName || settings?.family_name })}
        >
          Save
        </button>
      </section>

      <section className="rounded-2xl border border-review/40 bg-review-soft/30 p-4">
        <h2 className="mb-1 text-sm font-bold">Test Mode</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Simulate today's date. The whole app behaves as if today were the date you pick — useful for testing reminders.
        </p>
        <input
          type="date"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          defaultValue={settings?.simulated_date ?? ""}
          onChange={(e) => setSimDate(e.target.value)}
        />
        <div className="mt-3 flex gap-2">
          <button
            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            onClick={() => save.mutate({ simulated_date: simDate || null })}
          >
            Apply
          </button>
          <button
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
            onClick={() => save.mutate({ simulated_date: null })}
          >
            Clear
          </button>
        </div>
      </section>
    </div>
  );
}
