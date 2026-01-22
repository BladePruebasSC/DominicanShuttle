import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type CountryOption = {
  code: string;
  name: string;
  dial: string;
  flag: string; // emoji
};

const COUNTRIES: CountryOption[] = [
  { code: "DO", name: "República Dominicana", dial: "+1", flag: "🇩🇴" },
  { code: "US", name: "Estados Unidos", dial: "+1", flag: "🇺🇸" },
  { code: "PR", name: "Puerto Rico", dial: "+1", flag: "🇵🇷" },
  { code: "ES", name: "España", dial: "+34", flag: "🇪🇸" },
  { code: "MX", name: "México", dial: "+52", flag: "🇲🇽" },
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
];

function onlyDigits(v: string) {
  return (v || "").replace(/[^0-9]/g, "");
}

export function PhoneInput({
  value,
  onChange,
  defaultCountryCode = "DO",
  placeholder = "Número",
  className,
}: {
  value?: string | null;
  onChange: (value: string) => void;
  defaultCountryCode?: string;
  placeholder?: string;
  className?: string;
}) {
  const defaultCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === defaultCountryCode) ?? COUNTRIES[0],
    [defaultCountryCode],
  );

  const [countryCode, setCountryCode] = useState(defaultCountry.code);
  const [number, setNumber] = useState("");

  // Intento simple de hidratar desde value (si viene con +)
  useEffect(() => {
    if (!value) return;
    const trimmed = String(value).trim();
    if (!trimmed.startsWith("+")) return;

    const found = COUNTRIES.find((c) => trimmed.startsWith(c.dial));
    if (found) {
      setCountryCode(found.code);
      setNumber(onlyDigits(trimmed.slice(found.dial.length)));
    }
  }, [value]);

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? defaultCountry;

  const emit = (nextCountryCode: string, nextNumber: string) => {
    const c = COUNTRIES.find((x) => x.code === nextCountryCode) ?? defaultCountry;
    const digits = onlyDigits(nextNumber);
    onChange(`${c.dial}${digits}`);
  };

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Select
        value={countryCode}
        onValueChange={(v) => {
          setCountryCode(v);
          emit(v, number);
        }}
      >
        <SelectTrigger className="bg-void/50 border-white/10 text-white focus:border-coco-gold h-12 w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-void border-white/10">
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code} className="text-white hover:bg-coco-gold/20">
              <span className="mr-2">{c.flag}</span>
              {c.dial} <span className="text-gray-400 ml-2">{c.code}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={number}
        onChange={(e) => {
          const next = e.target.value;
          setNumber(next);
          emit(countryCode, next);
        }}
        className="bg-void/50 border-white/10 text-white"
        placeholder={placeholder}
        inputMode="tel"
      />
    </div>
  );
}

