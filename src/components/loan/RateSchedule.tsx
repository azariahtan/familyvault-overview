import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const TYPES = ["Fixed", "SORA+", "COF+", "Other"];

export function RateSchedule({ loanId }: { loanId: string }) {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["rate_schedule", loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_rate_schedule")
        .select("*")
        .eq("loan_id", loanId)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function addRow() {
    const nextYear = rows.length + 1;
    const { error } = await supabase.from("loan_rate_schedule").insert({
      loan_id: loanId,
      year_label: `Year ${nextYear}`,
      rate: null,
      rate_type: "Fixed",
      sort_order: nextYear,
    });
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["rate_schedule", loanId] });
  }

  async function update(id: string, patch: any) {
    const { error } = await supabase.from("loan_rate_schedule").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["rate_schedule", loanId] });
  }

  async function del(id: string) {
    await supabase.from("loan_rate_schedule").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["rate_schedule", loanId] });
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {rows.map((r: any) => (
          <div key={r.id} className="grid grid-cols-[1fr_70px_110px_28px] items-center gap-1.5 text-sm">
            <Input
              defaultValue={r.year_label}
              onBlur={(e) => e.target.value !== r.year_label && update(r.id, { year_label: e.target.value })}
              className="h-8"
            />
            <Input
              type="number"
              step="0.01"
              defaultValue={r.rate ?? ""}
              onBlur={(e) => update(r.id, { rate: e.target.value ? Number(e.target.value) : null })}
              className="h-8"
              placeholder="%"
            />
            <select
              value={r.rate_type ?? "Fixed"}
              onChange={(e) => update(r.id, { rate_type: e.target.value })}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button onClick={() => del(r.id)} className="text-urgent">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-xs text-muted-foreground">No rate schedule yet.</p>
        )}
      </div>
      <Button size="sm" variant="outline" onClick={addRow}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Year
      </Button>
    </div>
  );
}
