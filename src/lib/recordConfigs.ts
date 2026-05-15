export type FieldType = "text" | "number" | "date" | "select" | "textarea" | "member";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  default?: any;
  placeholder?: string;
};

export type RecordConfig = {
  table: string;
  queryKey: string;
  label: string; // for FAB label "Add Property"
  fields: FieldDef[];
};

export const recordConfigs: Record<string, RecordConfig> = {
  properties: {
    table: "properties",
    queryKey: "properties",
    label: "Property",
    fields: [
      { key: "name", label: "Property name", type: "text", required: true, placeholder: "e.g. London Flat" },
      { key: "member_id", label: "Owner", type: "member" },
      {
        key: "purpose",
        label: "Purpose",
        type: "select",
        options: ["capital_growth", "rental_yield", "own_home"],
        default: "capital_growth",
      },
      { key: "currency", label: "Currency", type: "select", options: ["SGD", "GBP", "USD", "EUR"], default: "SGD" },
      { key: "purchase_price", label: "Purchase price", type: "number" },
      { key: "current_value", label: "Current value", type: "number" },
      { key: "mortgage_bank", label: "Mortgage bank", type: "text" },
      { key: "mortgage_balance", label: "Mortgage balance", type: "number" },
      { key: "monthly_payment", label: "Monthly payment", type: "number" },
      { key: "interest_rate", label: "Interest rate %", type: "number" },
      { key: "fixed_rate_end", label: "Fixed rate ends", type: "date" },
      { key: "monthly_rent", label: "Monthly rent", type: "number" },
      { key: "monthly_costs", label: "Monthly costs", type: "number" },
      { key: "strategy", label: "Strategy / notes", type: "textarea" },
    ],
  },
  loans: {
    table: "loans",
    queryKey: "loans",
    label: "Loan",
    fields: [
      { key: "bank", label: "Bank", type: "text", required: true },
      { key: "purpose", label: "Purpose", type: "text", placeholder: "e.g. Personal, Car" },
      { key: "member_id", label: "Owner", type: "member" },
      { key: "balance", label: "Balance", type: "number" },
      { key: "rate", label: "Rate %", type: "number" },
      { key: "rate_label", label: "Rate label", type: "text", placeholder: "e.g. SORA + 0.8%" },
      { key: "monthly_payment", label: "Monthly payment", type: "number" },
      { key: "reprice_date", label: "Reprice date", type: "date" },
      { key: "action", label: "Action / notes", type: "textarea" },
    ],
  },
  insurance_policies: {
    table: "insurance_policies",
    queryKey: "insurance",
    label: "Insurance Policy",
    fields: [
      { key: "name", label: "Policy name", type: "text", required: true },
      { key: "category", label: "Category", type: "text", required: true, placeholder: "Life, Health, Car…" },
      { key: "provider", label: "Provider", type: "text" },
      { key: "member_id", label: "Insured", type: "member" },
      { key: "policy_number", label: "Policy number", type: "text" },
      { key: "premium", label: "Premium", type: "number" },
      {
        key: "frequency",
        label: "Frequency",
        type: "select",
        options: ["annual", "semi-annual", "quarterly", "monthly"],
        default: "annual",
      },
      { key: "sum_assured", label: "Sum assured", type: "number" },
      { key: "start_date", label: "Start date", type: "date" },
      { key: "end_date", label: "End date", type: "date" },
      { key: "next_due_date", label: "Next due date", type: "date" },
      { key: "action", label: "Action / notes", type: "textarea" },
    ],
  },
  investments: {
    table: "investments",
    queryKey: "investments",
    label: "Investment",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "group_name", label: "Group", type: "text", required: true, placeholder: "Stocks, Crypto, Funds…" },
      { key: "member_id", label: "Owner", type: "member" },
      { key: "cost_basis", label: "Cost basis", type: "number" },
      { key: "current_value", label: "Current value", type: "number" },
      { key: "projected_return_pct", label: "Projected return %", type: "number" },
      { key: "strategy", label: "Strategy / notes", type: "textarea" },
    ],
  },
  savings_accounts: {
    table: "savings_accounts",
    queryKey: "savings",
    label: "Savings Account",
    fields: [
      { key: "institution", label: "Institution", type: "text", required: true },
      { key: "group_name", label: "Group", type: "text", required: true, placeholder: "Banks, CPF, FD…" },
      { key: "member_id", label: "Owner", type: "member" },
      { key: "account_type", label: "Account type", type: "text" },
      { key: "account_number", label: "Account number", type: "text" },
      { key: "balance", label: "Balance", type: "number" },
      { key: "interest_rate", label: "Interest rate %", type: "number" },
      { key: "maturity_date", label: "Maturity date", type: "date" },
      { key: "last_updated", label: "Balance as of", type: "date" },
      { key: "note", label: "Notes", type: "textarea" },
    ],
  },
  health_conditions: {
    table: "health_conditions",
    queryKey: "health",
    label: "Health Item",
    fields: [
      { key: "name", label: "Condition / item", type: "text", required: true },
      { key: "member_id", label: "Person", type: "member", required: true },
      { key: "details", label: "Details", type: "textarea" },
    ],
  },
  gobag_items: {
    table: "gobag_items",
    queryKey: "gobag",
    label: "Go-Bag Item",
    fields: [
      { key: "label", label: "Item", type: "text", required: true, placeholder: "e.g. Passports" },
    ],
  },
};
