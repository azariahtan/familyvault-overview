
-- Loans: add notes + amortization fields
ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS original_amount numeric,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS term_years numeric;

-- Reminders (used across the app)
CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  what text NOT NULL,
  who uuid,
  remind_at timestamptz NOT NULL,
  repeat text,
  note text,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS open_all ON public.reminders;
CREATE POLICY open_all ON public.reminders FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS reminders_entity_idx ON public.reminders(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS reminders_remind_at_idx ON public.reminders(remind_at);

-- Storage policies for vault-docs (idempotent)
DO $$ BEGIN
  CREATE POLICY "vault-docs read"  ON storage.objects FOR SELECT USING (bucket_id = 'vault-docs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "vault-docs write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vault-docs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "vault-docs update" ON storage.objects FOR UPDATE USING (bucket_id = 'vault-docs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "vault-docs delete" ON storage.objects FOR DELETE USING (bucket_id = 'vault-docs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
