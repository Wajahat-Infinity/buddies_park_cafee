/**
 * Small formatting and link helpers. Everything here takes its values from the
 * settings row, so no cafe specific literal ever appears in the source.
 */

/** Trims a nullable text field and returns null when it is effectively empty. */
export function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** `tel:` href built from the display phone, with spaces and dashes removed. */
export function telHref(phoneDisplay: string | null | undefined): string | null {
  const digits = clean(phoneDisplay)?.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

/**
 * wa.me link for a plain enquiry. `phoneWhatsapp` is expected to be digits
 * only, including the country code, with no plus sign and no leading zero.
 */
export function whatsappHref(
  phoneWhatsapp: string | null | undefined,
  message?: string | null
): string | null {
  const digits = clean(phoneWhatsapp)?.replace(/\D/g, "");
  if (!digits) return null;

  const text = clean(message);
  return text
    ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${digits}`;
}

/** Ensures an admin entered social URL is absolute before it is rendered. */
export function externalHref(url: string | null | undefined): string | null {
  const value = clean(url);
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/**
 * Price string built from the currency symbol in settings. Whole numbers are
 * shown without decimals, which is how prices are written locally.
 */
export function formatPrice(price: number, currency: string): string {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "";

  // No thousands separator, so a card and the WhatsApp order line agree.
  const body = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

  return `${currency} ${body}`.trim();
}
