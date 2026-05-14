import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Folder } from "lucide-react";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
  head: () => ({ meta: [{ title: "Inventory — FamilyVault" }] }),
});

function InventoryPage() {
  const { data: gobag = [] } = useQuery({
    queryKey: ["gobag"],
    queryFn: async () => {
      const { data } = await supabase.from("gobag_items").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data } = await supabase.from("inventory_folders").select("*").is("parent_id", null).order("sort_order");
      return data ?? [];
    },
  });

  const toggleGo = async (id: string, checked: boolean) => {
    await supabase.from("gobag_items").update({ checked }).eq("id", id);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>

      <section className="rounded-2xl border border-urgent/30 bg-urgent-soft/40 p-4">
        <h2 className="mb-3 text-sm font-bold">Go-Bag</h2>
        <ul className="space-y-2">
          {gobag.map((g: any) => (
            <li key={g.id}>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  defaultChecked={g.checked}
                  onChange={(e) => toggleGo(g.id, e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className={g.checked ? "text-muted-foreground line-through" : ""}>{g.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold">Locations</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {folders.map((f: any) => (
            <div key={f.id} className="rounded-2xl border border-border bg-card p-4">
              <Folder className="mb-2 h-6 w-6 text-muted-foreground" />
              <div className="text-sm font-semibold">{f.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
