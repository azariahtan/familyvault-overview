import { Input } from "@/components/ui/input";
import { CURRENCY_SYMBOLS } from "@/lib/options";

function formatDisplay(v: string | number | null | undefined) {
  if (v == null || v === "") return "";
  const raw = String(v).replace(/,/g, "");
  if (raw === "-" || raw === "") return raw;
  if (!/^-?\d*\.?\d*$/.test(raw)) return String(v);
  const [intp, dec] = raw.split(".");
  const intFmt = Number(intp || "0").toLocaleString("en-US");
  return dec !== undefined ? `${intFmt}.${dec}` : (raw.startsWith("-") && intp === "" ? "-" : intFmt);
}

export function MoneyInput({
  value,
  onChange,
  currency = "SGD",
  placeholder,
  id,
}: {
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  currency?: string;
  placeholder?: string;
  id?: string;
}) {
  const sym = CURRENCY_SYMBOLS[currency] || "$";
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-muted-foreground">
        {sym}
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={formatDisplay(value)}
        onChange={(e) => {
          const raw = e.target.value.replace(/,/g, "");
          if (raw === "" || raw === "-" || /^-?\d*\.?\d*$/.test(raw)) onChange(raw);
        }}
        placeholder={placeholder}
        className="pl-7"
      />
    </div>
  );
}
