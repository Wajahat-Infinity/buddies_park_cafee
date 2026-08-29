import { clean, formatPrice } from "@/lib/format";
import type { CartLine } from "@/context/CartContext";
import type { SiteSettings } from "@/lib/types";

/** Width the dot leaders aim for before the price column. */
const LEADER_WIDTH = 34;

/**
 * Opening line. The greeting is the owner's text from settings; the cafe name
 * is spliced in after "Hello" when the greeting starts that way and does not
 * already name the cafe, which is what the default greeting expects.
 */
function greetingLine(settings: SiteSettings): string {
  const name = settings.cafe_name;
  const greeting = clean(settings.whatsapp_greeting);

  if (!greeting) return `Hello ${name}`;
  if (greeting.toLowerCase().includes(name.toLowerCase())) return greeting;

  const match = greeting.match(/^hello[\s,!.]*/i);
  if (!match) return `${greeting}`;

  const rest = greeting.slice(match[0].length);
  return rest ? `Hello ${name}, ${rest}` : `Hello ${name}`;
}

function orderLine(line: CartLine, currency: string): string {
  const left = `${line.quantity} x ${line.name}`;
  const right = formatPrice(line.price * line.quantity, currency);
  const dots = ".".repeat(Math.max(3, LEADER_WIDTH - left.length));
  return `${left} ${dots} ${right}`;
}

/** The full order message, ready to be encoded into a wa.me link. */
export function buildOrderMessage(
  lines: CartLine[],
  settings: SiteSettings
): string {
  const currency = settings.currency;
  const total = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0
  );

  return [
    greetingLine(settings),
    "",
    ...lines.map((line) => orderLine(line, currency)),
    "",
    `Total: ${formatPrice(total, currency)}`,
    "",
    "Name:",
    "Pickup or delivery:",
    "Address (if delivery):",
  ].join("\n");
}

/**
 * wa.me link for the order. Returns null when settings hold no WhatsApp
 * number, so the caller can offer the phone number instead.
 */
export function buildWhatsAppUrl(
  message: string,
  phone: string | null | undefined
): string | null {
  const digits = clean(phone)?.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
