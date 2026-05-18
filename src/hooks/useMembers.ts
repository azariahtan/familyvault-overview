import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Member = {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  sort_order: number;
  emoji: string | null;
};

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Member[];
    },
  });
}
