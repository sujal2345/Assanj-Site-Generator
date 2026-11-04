import { FIELD_KEYS, FieldKey, PROPERTY_TYPES, QuoteFormConfig } from "./schema";

export const normalizePhone = (v: string) => v.replace(/[\s\-().]/g, "");

const rules: Record<FieldKey, (v: string) => string | null> = {
  name: (v) => (v.length < 2 ? "Please enter your full name" : v.length > 100 ? "Name is too long" : null),
  phone: (v) => (/^\+?\d{7,15}$/.test(normalizePhone(v)) ? null : "Enter a valid phone number"),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 200 ? null : "Enter a valid email address"),
  propertyType: (v) => ((PROPERTY_TYPES as readonly string[]).includes(v) ? null : "Select a property type"),
  monthlyBill: (v) => (/^\d{1,9}(\.\d{1,2})?$/.test(v.replace(/,/g, "")) ? null : "Enter a valid amount"),
  postalCode: (v) => (/^[A-Za-z0-9 -]{3,12}$/.test(v) ? null : "Enter a valid postal code"),
  city: (v) => (v.length < 2 || v.length > 100 ? "Enter your city" : null),
  serviceInterest: (v) => (v.length > 120 ? "Too long" : null),
  message: (v) => (v.length > 1000 ? "Max 1000 characters" : null),
};

/** Shared by the browser form and the /api/leads route, driven by each form's own config. */
export function validateLead(values: Record<string, string | undefined>, cfg: QuoteFormConfig) {
  const errors: Record<string, string> = {};
  const clean: Partial<Record<FieldKey, string>> = {};
  for (const key of FIELD_KEYS) {
    const f = cfg.fields[key];
    if (!f.enabled) continue;
    const v = (values[key] ?? "").trim();
    if (!v) {
      if (f.required) errors[key] = "This field is required";
      continue;
    }
    const err = rules[key](v);
    if (err) errors[key] = err;
    else clean[key] = key === "phone" ? normalizePhone(v) : key === "monthlyBill" ? v.replace(/,/g, "") : v;
  }
  return { errors, clean };
}
