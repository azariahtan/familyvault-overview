import { useState } from "react";
import { Bell } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMembers } from "@/hooks/useMembers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function ReminderButton({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [open, setOpen] = useState(false);
  const [what, setWhat] = useState("");
  const [who, setWho] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [repeat, setRepeat] = useState("none");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: members = [] } = useMembers();
  const qc = useQueryClient();

  async function save() {
    if (!what || !date) return toast.error("What and date are required");
    setSaving(true);
    const remindAt = new Date(`${date}T${time}:00`).toISOString();
    const { error } = await supabase.from("reminders").insert({
      entity_type: entityType,
      entity_id: entityId,
      what,
      who: who || null,
      remind_at: remindAt,
      repeat,
      note: note || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Reminder set");
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["reminders"] });
    setOpen(false);
    setWhat(""); setWho(""); setDate(""); setTime("09:00"); setRepeat("none"); setNote("");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Bell className="mr-1 h-3.5 w-3.5" /> Set Reminder
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Set Reminder</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3 pb-6">
          <div className="space-y-1.5">
            <Label className="text-xs">What</Label>
            <Input value={what} onChange={(e) => setWhat(e.target.value)} placeholder="e.g. Reprice loan" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Who</Label>
            <select value={who} onChange={(e) => setWho(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">— Anyone —</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Repeat</Label>
            <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="none">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Reminder"}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
