/**
 * The delivery charge, in one place, so the cart footer, the WhatsApp message
 * and the admin preview can never disagree about what a customer owes.
 */

import type { SiteSettings } from "@/lib/types";

export type Fulfilment = "pickup" | "delivery";

/**
 * What to add to the subtotal. Zero for pickup, for a cafe that charges
 * nothing, and for an order that has reached the free delivery threshold.
 *
 * The threshold is compared against the subtotal — the items alone — which is
 * how "free delivery over Rs 2000" is normally read, and avoids a total that
 * depends on itself.
 */
export function deliveryFee(
  settings: Pick<SiteSettings, "delivery_fee" | "free_delivery_over">,
  subtotal: number,
  fulfilment: Fulfilment | undefined
): number {
  if (fulfilment !== "delivery") return 0;

  const fee = Number(settings.delivery_fee);
  if (!Number.isFinite(fee) || fee <= 0) return 0;

  const threshold = Number(settings.free_delivery_over);
  if (Number.isFinite(threshold) && threshold > 0 && subtotal >= threshold) {
    return 0;
  }

  return fee;
}
