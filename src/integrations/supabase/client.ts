import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nnvxascipffrxpmbgaoy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udnhhc2NpcGZmcnhwbWJnYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjM1ODgsImV4cCI6MjA5NTAzOTU4OH0.fRnZB_LM9Cu3DixDSo-YG7vx-EUke5gHtWHU5gBmsHc";

export const supabase = createClient(supabaseUrl, supabaseKey);
