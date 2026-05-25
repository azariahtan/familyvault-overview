import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMembers } from "@/hooks/useMembers";
import { Pencil, Check, X } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — FamilyVault" }] }),
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data: members = [] } = useMembers();

  // ── App Settings ─────────────────────────────────────────────
  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [familyName, setFamilyName] = useState("");
  const [testDate, setTestDate] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      setFamilyName(settings.family_name ?? "");
      setTestDate(settings.test_mode_date ?? settings.simulated_date ?? "");
    }
  }, [settings]);

  async function saveSettings() {
    if (!familyName.trim()) { toast.error("Family name cannot be empty"); return; }
    setSavingSettings(true);
    try {
      if (settings?.id) {
        // Update existing row
        const { error } = await supabase
          .from("app_settings")
          .update({ family_name: familyName.trim(), test_mode_date: testDate || null, updated_at: new Date().toISOString() })
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        // Insert first row
        const { error } = await supabase
          .from("app_settings")
          .insert({ family_name: familyName.trim(), test_mode_date: testDate || null });
        if (error) throw error;
      }
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["app_settings"] });
    } catch (err: any) {
      toast.error(err.message || "Could not save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  // ── Member editing ────────────────────────────────────────────
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [memberDraft, setMemberDraft] = useState<{ name: string; emoji: string; color: string }>({ name: "", emoji: "", color: "" });

  function startEdit(m: any) {
    setEditingMember(m.id);
    setMemberDraft({ name: m.name, emoji: m.emoji ?? "", color: m.color ?? "#888888" });
  }

  async function saveMember(id: string) {
    if (!memberDraft.name.trim()) { toast.error("Name required"); return; }
    const { error } = await supabase.from("members").update({
      name: memberDraft.name.trim(),
      emoji: memberDraft.emoji,
      color: memberDraft.color,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Member updated");
    qc.invalidateQueries({ queryKey: ["members"] });
    setEditingMember(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {/* Family Name */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Family Name</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Family name (shown in header)</Label>
            <Input
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. The Tan Family"
            />
          </div>
          <Button onClick={saveSettings} disabled={savingSettings} className="w-full">
            {savingSettings ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </section>

      {/* Test Mode */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Test Mode</h2>
        <p className="mb-3 text-xs text-muted-foreground">Simulate a future date to test alerts and reminders. Leave blank to use today.</p>
        <div className="flex gap-2">
          <Input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="flex-1"
          />
          {testDate && (
            <Button variant="outline" size="sm" onClick={() => setTestDate("")}>Clear</Button>
          )}
        </div>
        {testDate && (
          <p className="mt-2 rounded-lg bg-review-tint px-3 py-2 text-xs font-medium text-review-foreground">
            🟡 Test mode active — simulating {testDate}
          </p>
        )}
        <Button onClick={saveSettings} disabled={savingSettings} className="mt-3 w-full" variant="outline">
          {savingSettings ? "Saving…" : "Save Test Date"}
        </Button>
      </section>

      {/* Members */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Family Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members found. Make sure you ran the database schema SQL.</p>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="rounded-xl border border-border bg-background p-3">
                {editingMember === m.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={memberDraft.emoji}
                        onChange={(e) => setMemberDraft((d) => ({ ...d, emoji: e.target.value }))}
                        placeholder="Emoji"
                        className="w-16 text-center text-lg"
                        maxLength={2}
                      />
                      <Input
                        value={memberDraft.name}
                        onChange={(e) => setMemberDraft((d) => ({ ...d, name: e.target.value }))}
                        placeholder="Name"
                        className="flex-1"
                      />
                      <input
                        type="color"
                        value={memberDraft.color}
                        onChange={(e) => setMemberDraft((d) => ({ ...d, color: e.target.value }))}
                        className="h-9 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
                        title="Pick member colour"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-1" onClick={() => saveMember(m.id)}>
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => setEditingMember(null)}>
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                        style={{ background: m.color + "33" }}
                      >
                        {m.emoji}
                      </span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: m.color }}>{m.name}</p>
                        <p className="text-[11px] text-muted-foreground">{m.color}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">About</h2>
        <p className="text-xs text-muted-foreground">FamilyVault — private family finance tracker.</p>
        <p className="mt-1 text-xs text-muted-foreground">Data stored in your own Supabase project. No ads. No data sharing.</p>
      </section>
    </div>
  );
}
