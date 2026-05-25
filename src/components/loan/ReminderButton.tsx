import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useMembers } from "@/hooks/useMembers";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function ReminderButton({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) {
  const [open, setOpen] = useState(false);
  const [what, setWhat] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [who, setWho] = useState("");
  const [repeat, setRepeat] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: members = [] } = useMembers();
  const qc = useQueryClient();

  async function save() {
    if (!what.trim()) { toast.error("Please describe what to be reminded about"); return; }
    if (!remindAt) { toast.error("Please set a reminder date"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("reminders").insert({
        entity_type: entityType,
        entity_id: entityId,
        what: what.trim(),
        who: who || null,
        remind_at: new Date(remindAt).toISOString(),
        repeat: repeat || null,
        done: false,
      });
      if (error) throw error;
      toast.success("Reminder set");
      qc.invalidateQueries({ queryKey: ["reminders"] });
      setOpen(false);
      setWhat("");
      setRemindAt("");
      setWho("");
      setRepeat("");
    } catch (err: any) {
      toast.error(err.message || "Could not save reminder");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-3.5 w-3.5" />
        Set reminder
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl px-4 pb-2 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" />
          <SheetHeader>
            <SheetTitle className="text-base">Set Reminder</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 pb-4">
            <div className="space-y-1.5">
              <Label className="text-xs">What to be reminded about *</Label>
              <Input
                value={what}
                onChange={(e) => setWhat(e.target.value)}
                placeholder="e.g. Call UOB about repricing rate"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Remind on *</Label>
              <Input
                type="date"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Who should be reminded</Label>
              <select
                value={who}
                onChange={(e) => setWho(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
              >
                <option value="">— Everyone —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.emoji} {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Repeat</Label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
              >
                <option value="">Once only</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1" disabled={saving} onClick={save}>
                {saving ? "Saving…" : "Save Reminder"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
