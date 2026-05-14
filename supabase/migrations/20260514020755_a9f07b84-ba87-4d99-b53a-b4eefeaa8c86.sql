
-- Enums
create type public.record_status as enum ('urgent','review','settled');
create type public.entity_type as enum ('property','loan','insurance','investment','savings','health','inventory');
create type public.property_purpose as enum ('capital_growth','rental_yield','own_home','other');

-- Members
create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  color text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- App settings (single row)
create table public.app_settings (
  id int primary key default 1,
  family_name text not null default 'Our Family',
  simulated_date date,
  currency text not null default 'SGD',
  alert_review_days int not null default 90,
  alert_urgent_days int not null default 30,
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);
insert into public.app_settings (id) values (1);

-- Properties
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  joint_member_ids uuid[] default '{}',
  name text not null,
  purpose public.property_purpose not null default 'capital_growth',
  currency text not null default 'SGD',
  purchase_price numeric,
  current_value numeric,
  mortgage_bank text,
  mortgage_balance numeric,
  monthly_payment numeric,
  interest_rate numeric,
  fixed_rate_end date,
  monthly_rent numeric,
  monthly_costs numeric,
  market_rent numeric,
  strategy text,
  status public.record_status not null default 'review',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_rate_schedule (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  year_label text not null,
  rate numeric,
  rate_type text,
  sort_order int not null default 0
);

-- Loans
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  bank text not null,
  purpose text,
  balance numeric,
  rate numeric,
  rate_label text,
  monthly_payment numeric,
  reprice_date date,
  action text,
  status public.record_status not null default 'review',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.loan_rate_schedule (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  year_label text not null,
  rate numeric,
  rate_type text,
  sort_order int not null default 0
);

-- Insurance
create table public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  category text not null,
  name text not null,
  provider text,
  policy_number text,
  type text,
  premium numeric,
  frequency text,
  payment_method text,
  start_date date,
  end_date date,
  sum_assured numeric,
  next_due_date date,
  expected_payout numeric,
  payout_year int,
  action text,
  status public.record_status not null default 'review',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Investments
create table public.investments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  group_name text not null,
  name text not null,
  cost_basis numeric,
  current_value numeric,
  projected_return_pct numeric,
  strategy text,
  status public.record_status not null default 'review',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Savings
create table public.savings_accounts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  group_name text not null,
  institution text not null,
  account_type text,
  account_number text,
  balance numeric,
  interest_rate numeric,
  maturity_date date,
  note text,
  last_updated date,
  status public.record_status not null default 'settled',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Health
create table public.health_conditions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  name text not null,
  supplements jsonb not null default '[]',
  actions jsonb not null default '[]',
  details text,
  status public.record_status not null default 'review',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Inventory
create table public.inventory_folders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.inventory_folders(id) on delete cascade,
  name text not null,
  photo_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.inventory_folders(id) on delete cascade,
  name text not null,
  category text,
  action text,
  warranty_date date,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gobag_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  checked boolean not null default false,
  sort_order int not null default 0
);

-- Polymorphic shared records
create table public.record_history (
  id uuid primary key default gen_random_uuid(),
  entity_type public.entity_type not null,
  entity_id uuid not null,
  note text not null,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.record_documents (
  id uuid primary key default gen_random_uuid(),
  entity_type public.entity_type not null,
  entity_id uuid not null,
  bucket text not null default 'vault-docs',
  path text not null,
  label text,
  reminder_date date,
  uploaded_at timestamptz not null default now()
);

-- Indices
create index on public.properties(status);
create index on public.loans(status);
create index on public.insurance_policies(status, next_due_date);
create index on public.investments(status);
create index on public.health_conditions(member_id);
create index on public.inventory_items(folder_id);
create index on public.record_history(entity_type, entity_id);
create index on public.record_documents(entity_type, entity_id);

-- RLS: enable on every table; permissive policies for single-household app.
alter table public.members enable row level security;
alter table public.app_settings enable row level security;
alter table public.properties enable row level security;
alter table public.property_rate_schedule enable row level security;
alter table public.loans enable row level security;
alter table public.loan_rate_schedule enable row level security;
alter table public.insurance_policies enable row level security;
alter table public.investments enable row level security;
alter table public.savings_accounts enable row level security;
alter table public.health_conditions enable row level security;
alter table public.inventory_folders enable row level security;
alter table public.inventory_items enable row level security;
alter table public.gobag_items enable row level security;
alter table public.record_history enable row level security;
alter table public.record_documents enable row level security;

do $$
declare
  t text;
  tbls text[] := array[
    'members','app_settings','properties','property_rate_schedule','loans','loan_rate_schedule',
    'insurance_policies','investments','savings_accounts','health_conditions',
    'inventory_folders','inventory_items','gobag_items','record_history','record_documents'
  ];
begin
  foreach t in array tbls loop
    execute format('create policy "open_all" on public.%I for all using (true) with check (true);', t);
  end loop;
end $$;

-- Storage buckets
insert into storage.buckets (id, name, public) values ('vault-docs','vault-docs', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('inventory-photos','inventory-photos', true) on conflict do nothing;

create policy "vault docs read" on storage.objects for select using (bucket_id in ('vault-docs','inventory-photos'));
create policy "vault docs write" on storage.objects for insert with check (bucket_id in ('vault-docs','inventory-photos'));
create policy "vault docs update" on storage.objects for update using (bucket_id in ('vault-docs','inventory-photos'));
create policy "vault docs delete" on storage.objects for delete using (bucket_id in ('vault-docs','inventory-photos'));

-- Realtime
alter publication supabase_realtime add table public.properties;
alter publication supabase_realtime add table public.loans;
alter publication supabase_realtime add table public.insurance_policies;
alter publication supabase_realtime add table public.investments;
alter publication supabase_realtime add table public.savings_accounts;
alter publication supabase_realtime add table public.health_conditions;
alter publication supabase_realtime add table public.inventory_items;
alter publication supabase_realtime add table public.inventory_folders;
alter publication supabase_realtime add table public.gobag_items;
alter publication supabase_realtime add table public.record_history;
alter publication supabase_realtime add table public.record_documents;
alter publication supabase_realtime add table public.members;
alter publication supabase_realtime add table public.app_settings;
