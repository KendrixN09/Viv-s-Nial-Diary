// Normalizes a client-typed phone number into E.164 (+15551234567) so it's
// always safe to hand to Twilio later. The business is Kennesaw/US-based, so
// a bare 10-digit number is assumed US and gets a +1 prefix; an already
// international-looking number (leading +) is validated, not reinterpreted.
// Returns null for anything that can't be confidently normalized - callers
// should reject the input rather than store or text an unusable number.
export function normalizeToE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

// Light display formatter for showing a stored E.164 US number back to the
// admin as (470) 555-1234 instead of +14705551234.
export function formatUSPhoneDisplay(e164: string): string {
  const match = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (!match) return e164;
  return `(${match[1]}) ${match[2]}-${match[3]}`;
}
