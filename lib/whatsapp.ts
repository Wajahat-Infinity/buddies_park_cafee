import { clean, formatPrice } from "@/lib/format";
import { deliveryFee, type Fulfilment } from "@/lib/delivery";
import type { CartLine } from "@/context/CartContext";
import type { SiteSettings } from "@/lib/types";

/** What the customer fills in before sending, collected in the cart drawer. */
export type OrderDetails = {
  name: string;
  fulfilment: Fulfilment;
  address: string;
};

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

/**
 * The full order message, ready to be encoded into a wa.me link.
 *
 * Customer details are filled in on the site rather than left as blank lines
 * for the customer to complete inside WhatsApp, which they rarely did.
 */
export function buildOrderMessage(
  lines: CartLine[],
  settings: SiteSettings,
  details?: OrderDetails
): string {
  const currency = settings.currency;
  const subtotal = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0
  );

  const name = clean(details?.name);
  const delivery = details?.fulfilment === "delivery";
  const address = clean(details?.address);
  const fee = deliveryFee(settings, subtotal, details?.fulfilment);

  // A pickup order, and a cafe that charges nothing, keep the single total
  // line rather than a breakdown that only ever reads "Delivery: Rs 0".
  const totals = fee
    ? [
        `Subtotal: ${formatPrice(subtotal, currency)}`,
        `Delivery: ${formatPrice(fee, currency)}`,
        `Total: ${formatPrice(subtotal + fee, currency)}`,
      ]
    : [`Total: ${formatPrice(subtotal, currency)}`];

  return [
    greetingLine(settings),
    "",
    ...lines.map((line) => orderLine(line, currency)),
    "",
    ...totals,
    "",
    `Name: ${name ?? ""}`,
    `Pickup or delivery: ${
      details ? (delivery ? "Delivery" : "Pickup") : ""
    }`,
    // The address line is only meaningful for a delivery.
    ...(delivery ? [`Address: ${address ?? ""}`] : []),
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
