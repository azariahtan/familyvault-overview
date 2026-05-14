import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseISO } from "date-fns";

export function useToday(): { today: Date; simulated: boolean } {
  const { data } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
    staleTime: 30_000,
  });
  if (data?.simulated_date) return { today: parseISO(data.simulated_date), simulated: true };
  return { today: new Date(), simulated: false };
}

export function statusFromDate(
  date: string | null | undefined,
  today: Date,
  reviewDays = 90,
  urgentDays = 30,
): "urgent" | "review" | "settled" | null {
  if (!date) return null;
  const d = parseISO(date);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  if (diff < urgentDays) return "urgent";
  if (diff < reviewDays) return "review";
  return null;
}
