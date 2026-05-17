import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMembers } from "@/hooks/useMembers";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recordConfigs, type FieldDef, type SelectOption } from "@/lib/recordConfigs";
import { MoneyInput } from "./MoneyInput";
import { addDays, parseISO } from "date-fns";

export function RecordFormSheet({
  configKey,
  open,
  onOpenChange,
  initial,
  recordId,
}: {
  configKey: keyof typeof recordConfigs;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Record<string, any>;
  recordId?: string;
}) {
  const cfg = recordConfigs[configKey];
  const isEdit = !!recordId;
  const [values, setValues] = useState<Record<string, any>>(() => seed(cfg.fields, initial));
  const [submitting, setSubmitting] = useState(false);
  const { data: members = [] } = useMembers();
  const qc = useQueryClient();

  useEffect(() => {
    if (open) setValues(seed(cfg.fields, initial));
  }, [open, initial, cfg]);

  function setVal(k: string, v: any) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {};
      for (const f of cfg.fields) {
        let v = values[f.key];
        if (v === "" || v === undefined) {
          if (isEdit) payload[f.key] = null;
          continue;
        }
        if (v === null) {
          if (isEdit) payload[f.key] = null;
          continue;
        }
        if (f.type === "number" || f.money) {
          const raw = String(v).replace(/,/g, "");
          v = raw === "" ? null : Number(raw);
        }
        payload[f.key] = v;
      }

      // Savings: infer group_name from maturity_date when missing
      if (cfg.table === "savings_accounts" && !payload.group_name) {
        payload.group_name = payload.maturity_date ? "Fixed Deposits" : "Bank Accounts";
      }

      for (const f of cfg.fields) {
        if (f.required && (payload[f.key] === undefined || payload[f.key] === "" || payload[f.key] === null)) {
          toast.error(`${f.label} is required`);
          setSubmitting(false);
          return;
        }
      }

      let savedId = recordId;
      if (isEdit) {
        const { error } = await supabase.from(cfg.table as any).update(payload).eq("id", recordId!);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from(cfg.table as any).insert(payload).select("id").single();
        if (error) throw error;
        savedId = (data as any)?.id;
      }

      // Auto-create FD maturity reminder (30 days before)
      if (cfg.table === "savings_accounts" && payload.maturity_date && savedId) {
        try {
          const remindAt = addDays(parseISO(payload.maturity_date), -30);
          await supabase.from("reminders").insert({
            entity_type: "savings",
            entity_id: savedId,
            what: `FD Maturing — ${payload.institution ?? ""} ${payload.balance ? "$" + Number(payload.balance).toLocaleString() : ""} matures on ${payload.maturity_date}. Decide reinvestment.`,
            remind_at: remindAt.toISOString(),
          });
        } catch { /* non-fatal */ }
      }

      toast.success(isEdit ? "Saved" : `${cfg.label} added`);
      qc.invalidateQueries({ queryKey: [cfg.queryKey] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Could not save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl px-4 pb-2 pt-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" />
        <SheetHeader>
          <SheetTitle className="text-base">{isEdit ? `Edit ${cfg.label}` : `Add ${cfg.label}`}</SheetTitle>
        </SheetHeader>
        <form onSubmit={submit} className="mt-4 space-y-3 pb-4">
          {cfg.fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="text-xs">
                {f.label}
                {f.required && <span className="text-urgent"> *</span>}
              </Label>
              <FieldInput
                f={f}
                value={values[f.key]}
                onChange={(v) => setVal(f.key, v)}
                members={members}
                currency={(f.currencyFrom && values[f.currencyFrom]) || "SGD"}
              />
            </div>
          ))}
          <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function optValue(o: SelectOption) {
  return typeof o === "string" ? o : o.value;
}
function optLabel(o: SelectOption) {
  return typeof o === "string" ? o : o.label;
}

function FieldInput({
  f, value, onChange, members, currency,
}: {
  f: FieldDef;
  value: any;
  onChange: (v: any) => void;
  members: any[];
  currency: string;
}) {
  if (f.type === "textarea") {
    return <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} rows={3} />;
  }
  if (f.type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm transition focus:border-primary focus:outline-none"
      >
        <option value="">Select…</option>
        {f.options?.map((o) => (
          <option key={optValue(o)} value={optValue(o)}>{optLabel(o)}</option>
        ))}
      </select>
    );
  }
  if (f.type === "member") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
      >
        <option value="">{f.required ? "Select person…" : "— None —"}</option>
        {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
    );
  }
  if (f.money) {
    return <MoneyInput value={value} onChange={onChange} currency={currency} placeholder={f.placeholder} />;
  }
  if (f.type === "number") {
    return <Input inputMode="decimal" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />;
  }
  if (f.type === "date") {
    return <Input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
  return <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />;
}

function seed(fields: FieldDef[], initial?: Record<string, any>) {
  const v: Record<string, any> = {};
  for (const f of fields) {
    const init = initial?.[f.key];
    if (init !== undefined && init !== null) v[f.key] = init;
    else if (f.default !== undefined) v[f.key] = f.default;
    else v[f.key] = "";
  }
  return v;
}
