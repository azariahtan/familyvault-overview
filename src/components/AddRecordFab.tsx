import { useState } from "react";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMembers } from "@/hooks/useMembers";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recordConfigs, type FieldDef } from "@/lib/recordConfigs";

export function AddRecordFab({ configKey }: { configKey: keyof typeof recordConfigs }) {
  const cfg = recordConfigs[configKey];
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, any>>(() => initialValues(cfg.fields));
  const { data: members = [] } = useMembers();
  const qc = useQueryClient();

  function setVal(k: string, v: any) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {};
      for (const f of cfg.fields) {
        const v = values[f.key];
        if (v === "" || v === undefined || v === null) continue;
        payload[f.key] = f.type === "number" ? Number(v) : v;
      }
      for (const f of cfg.fields) {
        if (f.required && (payload[f.key] === undefined || payload[f.key] === "")) {
          toast.error(`${f.label} is required`);
          setSubmitting(false);
          return;
        }
      }
      const { error } = await supabase.from(cfg.table as any).insert(payload as any);
      if (error) throw error;
      toast.success(`${cfg.label} added`);
      qc.invalidateQueries({ queryKey: [cfg.queryKey] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setValues(initialValues(cfg.fields));
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Could not save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label={`Add ${cfg.label}`}
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition active:scale-95 hover:bg-primary/90"
          style={{ background: "var(--aza)" }}
        >
          <Plus className="h-7 w-7" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add {cfg.label}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 pb-6">
          {cfg.fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="text-xs">
                {f.label}
                {f.required && <span className="text-urgent"> *</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setVal(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={2}
                />
              ) : f.type === "select" ? (
                <select
                  id={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setVal(f.key, e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select…</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "member" ? (
                <select
                  id={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setVal(f.key, e.target.value || null)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">{f.required ? "Select person…" : "— None —"}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={f.key}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  step={f.type === "number" ? "any" : undefined}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setVal(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Saving…" : `Add ${cfg.label}`}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function initialValues(fields: FieldDef[]) {
  const v: Record<string, any> = {};
  for (const f of fields) if (f.default !== undefined) v[f.key] = f.default;
  return v;
}
