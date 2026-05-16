import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function NotesEditor({
  table,
  queryKey,
  id,
  value,
}: {
  table: string;
  queryKey: string;
  id: string;
  value: string | null | undefined;
}) {
  const [text, setText] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [summarising, setSummarising] = useState(false);
  const qc = useQueryClient();

  useEffect(() => setText(value ?? ""), [value]);

  async function save(next: string) {
    setSaving(true);
    const { error } = await supabase.from(table as any).update({ notes: next }).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: [queryKey] });
  }

  function summarise() {
    setSummarising(true);
    setTimeout(() => {
      const bullets = text
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => `• ${l.replace(/^[•\-\*]\s*/, "")}`)
        .join("\n");
      setText(bullets);
      void save(bullets);
      setSummarising(false);
      toast.success("Summarised to bullet points");
    }, 300);
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text !== (value ?? "") && save(text)}
        rows={6}
        placeholder="Detailed notes, advisor info, background context…"
        className="text-sm"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{saving ? "Saving…" : "Auto-saves on blur"}</span>
        <Button type="button" size="sm" variant="outline" onClick={summarise} disabled={!text || summarising}>
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          {summarising ? "Summarising…" : "Summarise"}
        </Button>
      </div>
    </div>
  );
}
