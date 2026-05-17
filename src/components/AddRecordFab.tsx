import { useState } from "react";
import { Plus } from "lucide-react";
import { RecordFormSheet } from "./RecordFormSheet";
import { recordConfigs } from "@/lib/recordConfigs";

export function AddRecordFab({ configKey }: { configKey: keyof typeof recordConfigs }) {
  const cfg = recordConfigs[configKey];
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`Add ${cfg.label}`}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-transform duration-150 ease-out active:scale-95"
        style={{ background: "var(--aza)" }}
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>
      <RecordFormSheet configKey={configKey} open={open} onOpenChange={setOpen} />
    </>
  );
}
