# FamilyVault Build Plan

A mobile-first PWA for tracking a family's finances, insurance, health, property, loans, savings, and inventory at a glance. React + TanStack Start + Lovable Cloud (Supabase).

## Phase 1 — Foundation

1. **Enable Lovable Cloud** for realtime DB, auth, storage.
2. **Design system** (`src/styles.css`): warm neutral background, gold/teal/coral member colors, status tokens (red/amber/green), large touch targets, mobile-first.
3. **Bottom tab bar** (8 tabs, fixed, always visible on all viewports). Header with family name + 🔔 bell with badge.
4. **Member filter bar** component (All / Aza / Leslie / Chay) — global state via Zustand or React context.
5. **Test Mode** global "simulated today" date — amber banner, all date logic reads from this.

## Phase 2 — Data model (Supabase)

Tables (all with `member_id`, `status` enum: urgent/review/settled, `created_at`, `updated_at`):

- `members` (id, name, color, sort_order)
- `properties` (purpose, purchase_price, current_value, mortgage fields, rent, costs, fixed_rate_end, strategy)
- `property_rate_schedule` (property_id, year, rate, type)
- `loans` (bank, purpose, balance, rate, monthly_payment, reprice_date, action)
- `loan_rate_schedule`
- `insurance_policies` (category, name, provider, premium, frequency, payment_method, dates, sum_assured, action, reminder_date)
- `investments` (group, name, cost_basis, current_value, projected_return_pct)
- `savings_accounts` (group, institution, type, balance, rate, last_updated, note)
- `health_conditions` (member_id, name, supplements jsonb, actions jsonb)
- `inventory_folders` (parent_id, name, photo_url)
- `inventory_items` (folder_id, name, category, action, warranty_date, photo_url)
- `gobag_items` (label, checked)
- `record_notes`, `record_history`, `record_documents` — polymorphic (entity_type + entity_id) for shared notes/history/docs/reminders across all tabs
- `settings` (single-row: family_name, simulated_date, alert_thresholds, currency)

Storage bucket: `vault-docs` (PDFs/images), `inventory-photos`.
RLS: open to authed user(s) of the household for v1; auth via magic link.

## Phase 3 — Shared components

- **StatusToggle** (3-button) + auto-promotion when reminder date passes.
- **RecordCard** with collapsed Action / expandable Notes / History / Documents — used by every tab.
- **SummariseButton** (✨) — calls Lovable AI Gateway (Gemini) to condense long text.
- **ReminderPicker** (🔔 inline).
- **DocumentUploader** + list with View/Delete.
- **AlertEngine** — derives 🟡 at 90d, 🔴 at 30d/overdue from all date fields; powers bell badge + Dashboard sections.

## Phase 4 — Tabs (in order)

1. **Home/Dashboard** — Today banner, 4 KPI cards, member filter, Upcoming Payments (30d), Monthly Cash Flow bars, Priority section, Review section, Lifetime Cash Flow chart at bottom. Settled hidden.
2. **Property** — sorted red→green, "My Homes ▾" collapsed at bottom, expanded view with Financials/Auto-calc/Action&AI/Documents/Rate Schedule. Pre-load 7 properties.
3. **Insurance** — empty start, By Category / By Company toggle, search, totals, Projections sub-tab with 2 Recharts charts (lifetime premiums vs returns area chart, annual cost vs income bar chart).
4. **Investments** — empty start, grouped, totals row.
5. **Loans** — pre-load 4 loans, small ✏/🗑 icons, rate schedule, contract upload.
6. **Savings** — pre-load CPF/banks/SRS/FD, "stale balance" indicator (>30 days).
7. **Health** — person selector, chip-style supplements/actions, collapsed Details, document upload. Pre-load conditions for all 3.
8. **Inventory** — folder grid, sub-folders, search-by-item with breadcrumb path, Go-Bag checklist pinned top.

## Phase 5 — Charts & calculations

- **Lifetime Cash Flow** (Recharts ComposedChart): aggregate all premiums (with end dates), loan payments (to end date), property costs as outflows; rent + insurance payouts + CPF RSS + projected investment returns as inflows. 40-year horizon, tooltip showing contributors, toggle inflows/outflows/net, summary table for next 5 years.
- **Insurance Projections**: cumulative premiums vs returns area, annual cost vs income bars.
- **Property auto-calcs**: gross/net yield, LTV, monthly/annual cash flow, capital gain, equity — all derived live.

## Phase 6 — Settings & polish

Settings tab (members CRUD, tab visibility/reorder, alert thresholds, Test Mode date picker, currency, dark/light, CSV export, clear demo data, GitHub export note). Format helpers for SGD/GBP and DD MMM YYYY everywhere. PWA manifest + service worker for "add to home screen". Realtime subscriptions on every table so edits propagate instantly.

## Technical notes

- **Stack**: TanStack Start v1, React 19, Tailwind v4, Recharts, Lucide, Zustand, date-fns, Supabase JS, Lovable AI Gateway for ✨ Summarise.
- **Routing**: file-based under `src/routes/` — `index.tsx` (Home), `property.tsx`, `insurance.tsx`, `insurance.projections.tsx`, `investments.tsx`, `loans.tsx`, `savings.tsx`, `health.tsx`, `inventory.tsx`, `inventory.$folderId.tsx`, `settings.tsx`. Bottom-tab layout in `__root.tsx`.
- **Status sort**: shared util `sortByStatus(items)` → urgent, review, settled.
- **Today source**: `useToday()` hook returns `settings.simulated_date ?? new Date()`.
- **Demo data**: seeded via SQL migration with `is_demo=true` flag so "Clear demo data" works cleanly.
- **AI summarise**: server function calling `LOVABLE_API_KEY` against `google/gemini-2.5-flash`.

## Out of scope for v1 (placeholders only)

- AI doc auto-read (button shows "coming soon").
- AI property/insurance recommendations (button placeholder).
- Multi-household auth (single household, magic link login).
- GitHub export button — Lovable already provides this natively; the button just opens docs.

## Build order

Phase 1 → 2 → 3 → 4 (Home + Property first to validate the shared RecordCard and status flow) → 4 (remaining tabs) → 5 (charts) → 6 (settings + PWA polish).

This will be a multi-turn build. After you approve, I'll start with Phases 1–3 plus Home + Property, then iterate tab by tab.