import {
  CURRENCIES, BANKS, PROPERTY_PURPOSE, INSURANCE_FREQ, INSURANCE_CATEGORIES, INVESTMENT_TYPES,
} from "./options";

export type FieldType = "text" | "number" | "date" | "select" | "textarea" | "member";
export type SelectOption = string | { value: string; label: string };

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[];
  default?: any;
  placeholder?: string;
  money?: boolean;          // render with MoneyInput + currency prefix
  currencyFrom?: string;    // field key whose value drives the currency symbol
  hideOnAdd?: boolean;
};

export type RecordConfig = {
  table: string;
  queryKey: string;
  label: string;
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
      { key: "purpose", label: "Purpose", type: "select", options: PROPERTY_PURPOSE, default: "capital_growth" },
      { key: "currency", label: "Currency", type: "select", options: CURRENCIES, default: "SGD" },
      { key: "purchase_price", label: "Purchase price", type: "number", money: true, currencyFrom: "currency" },
      { key: "current_value",  label: "Current value",  type: "number", money: true, currencyFrom: "currency" },
      { key: "mortgage_bank", label: "Mortgage bank", type: "select", options: BANKS },
      { key: "mortgage_balance", label: "Mortgage balance", type: "number", money: true, currencyFrom: "currency" },
      { key: "monthly_payment", label: "Monthly payment", type: "number", money: true, currencyFrom: "currency" },
      { key: "interest_rate", label: "Interest rate %", type: "number" },
      { key: "fixed_rate_end", label: "Fixed rate ends", type: "date" },
      { key: "monthly_rent", label: "Monthly rent", type: "number", money: true, currencyFrom: "currency" },
      { key: "monthly_costs", label: "Monthly costs", type: "number", money: true, currencyFrom: "currency" },
      { key: "strategy", label: "Strategy", type: "text", placeholder: "e.g. Capital appreciation at 5% p.a., sell by 2028" },
      // NOTE: action/notes columns are not in the properties table; we use 'strategy' for the
      // short headline and let users keep detailed notes via the dedicated Notes section.
    ],
  },

  loans: {
    table: "loans",
    queryKey: "loans",
    label: "Loan",
    fields: [
      { key: "bank", label: "Bank", type: "select", options: BANKS, required: true },
      { key: "purpose", label: "Purpose", type: "text", placeholder: "e.g. Personal, Car" },
      { key: "member_id", label: "Owner", type: "member" },
      { key: "original_amount", label: "Original loan amount", type: "number", money: true },
      { key: "balance", label: "Current balance", type: "number", money: true },
      { key: "start_date", label: "Loan start date", type: "date" },
      { key: "term_years", label: "Loan term (years)", type: "number" },
      { key: "rate", label: "Current interest rate %", type: "number" },
      { key: "rate_label", label: "Rate label", type: "text", placeholder: "e.g. SORA + 0.8%" },
      { key: "reprice_date", label: "Reprice date", type: "date" },
      { key: "action", label: "Action", type: "text", placeholder: "e.g. Ask UOB for repricing rate by May 2026" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Background, history, advisor info…" },
    ],
  },

  insurance_policies: {
    table: "insurance_policies",
    queryKey: "insurance",
    label: "Insurance Policy",
    fields: [
      { key: "name", label: "Policy name", type: "text", required: true },
      { key: "category", label: "Category", type: "select", options: INSURANCE_CATEGORIES, required: true },
      { key: "provider", label: "Provider", type: "text" },
      { key: "member_id", label: "Insured", type: "member" },
      { key: "policy_number", label: "Policy number", type: "text" },
      { key: "premium", label: "Premium", type: "number", money: true },
      { key: "frequency", label: "Frequency", type: "select", options: INSURANCE_FREQ, default: "annual" },
      { key: "sum_assured", label: "Sum assured", type: "number", money: true },
      { key: "start_date", label: "Start date", type: "date" },
      { key: "end_date", label: "End date", type: "date" },
      { key: "next_due_date", label: "Next due date", type: "date" },
      { key: "action", label: "Action", type: "text", placeholder: "e.g. Renew before Mar 2027" },
    ],
  },

  investments: {
    table: "investments",
    queryKey: "investments",
    label: "Investment",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "group_name", label: "Investment type", type: "select", options: INVESTMENT_TYPES, required: true },
      { key: "member_id", label: "Owner", type: "member" },
      { key: "cost_basis", label: "Amount invested", type: "number", money: true },
      { key: "current_value", label: "Current value", type: "number", money: true },
      { key: "projected_return_pct", label: "Projected return %", type: "number" },
      { key: "strategy", label: "Strategy / notes", type: "textarea" },
    ],
  },

  savings_accounts: {
    table: "savings_accounts",
    queryKey: "savings",
    label: "Savings Account",
    fields: [
      { key: "institution", label: "Institution", type: "text", required: true, placeholder: "e.g. DBS, OCBC" },
      { key: "member_id", label: "Owner", type: "member" },
      { key: "account_type", label: "Account type", type: "text", placeholder: "e.g. eSavers, FD, SRS, CPF" },
      { key: "account_number", label: "Account number", type: "text" },
      { key: "balance", label: "Balance", type: "number", money: true },
      { key: "interest_rate", label: "Interest rate %", type: "number" },
      { key: "maturity_date", label: "Maturity date (for FDs)", type: "date" },
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
