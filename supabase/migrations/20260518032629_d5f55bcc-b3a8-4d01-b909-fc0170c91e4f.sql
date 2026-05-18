
-- Members: add emoji avatar
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS emoji text NOT NULL DEFAULT '👤';

-- Set defaults requested: Aza=🌟, Leslie=👨, Chay=👩
UPDATE public.members SET emoji = '🌟' WHERE lower(name) LIKE 'aza%';
UPDATE public.members SET emoji = '👨' WHERE lower(name) LIKE 'leslie%';
UPDATE public.members SET emoji = '👩' WHERE lower(name) LIKE 'chay%';

-- Properties: split action from strategy; add address, purchase date, rate type, itemized costs
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS action_note text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS purchase_date date,
  ADD COLUMN IF NOT EXISTS rate_type text,
  ADD COLUMN IF NOT EXISTS cost_management numeric,
  ADD COLUMN IF NOT EXISTS cost_property_tax numeric,
  ADD COLUMN IF NOT EXISTS cost_fire_insurance numeric,
  ADD COLUMN IF NOT EXISTS cost_maintenance numeric,
  ADD COLUMN IF NOT EXISTS cost_other numeric,
  ADD COLUMN IF NOT EXISTS cost_other_label text;

-- Storage: ensure vault-docs bucket is public and add a permissive read policy
UPDATE storage.buckets SET public = true WHERE id = 'vault-docs';

DO $$ BEGIN
  CREATE POLICY "vault-docs public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'vault-docs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "vault-docs public write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'vault-docs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "vault-docs public delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'vault-docs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "inventory-photos public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'inventory-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
