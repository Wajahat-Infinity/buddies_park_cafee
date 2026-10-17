"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { deliveryFee } from "@/lib/delivery";
import { clean, formatPrice, telHref } from "@/lib/format";
import {
  buildOrderMessage,
  buildWhatsAppUrl,
  type OrderDetails,
} from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/types";

/** Small uppercase label above each checkout field. */
const FIELD_LABEL = "text-park/60 text-[0.7rem] font-bold tracking-[0.12em] uppercase";
const FIELD = "h-11 rounded-xl border-none bg-white shadow-card text-park";

/**
 * The checkout: a full screen on phones, a side panel on desktop, and the
 * hand off to WhatsApp.
 */
export function CartDrawer({
  open,
  onOpenChange,
  settings,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SiteSettings;
}) {
  const {
    lines,
    itemCount,
    total: subtotal,
    increment,
    decrement,
    removeItem,
    clearCart,
  } = useCart();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [fulfilment, setFulfilment] =
    useState<OrderDetails["fulfilment"]>("pickup");
  const [address, setAddress] = useState("");

  // The order is useless to the cafe without a name, or without an address
  // when it is going out for delivery.
  const needsAddress = fulfilment === "delivery";
  const detailsComplete =
    name.trim().length > 0 && (!needsAddress || address.trim().length > 0);
  const currency = settings.currency;
  const call = telHref(settings.phone_display);
  const phone = clean(settings.phone_display);

  // Zero unless this is a delivery the cafe charges for, so the breakdown only
  // appears when there is something to break down.
  const fee = deliveryFee(settings, subtotal, fulfilment);
  // A charge the free delivery threshold has just cancelled. Worth saying out
  // loud, because the delivery button still advertises the charge.
  const feeWaived =
    fulfilment === "delivery" && fee === 0 && Number(settings.delivery_fee) > 0;
  const deliveryNote = clean(settings.delivery_note);
  // What the delivery button advertises before it is chosen.
  const feeHint = Number(settings.delivery_fee) > 0
    ? formatPrice(Number(settings.delivery_fee), currency)
    : null;

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    // Reset the thank you state once the drawer has closed.
    if (!next) setSent(false);
  }

  function sendOrder() {
    if (lines.length === 0 || !detailsComplete) return;

    const message = buildOrderMessage(lines, settings, {
      name,
      fulfilment,
      address,
    });
    const url = buildWhatsAppUrl(message, settings.phone_whatsapp);
    if (!url) return;

    setSending(true);
    // Opened synchronously inside the click so mobile browsers do not block it.
    window.open(url, "_blank", "noopener,noreferrer");
    setSending(false);
    setSent(true);
    clearCart();
    setAddress("");
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        // The sheet sets its width with a data attribute selector, which beats
        // a plain `w-full`; match it so phones get the whole screen.
        className="bg-paper text-park font-body flex flex-col gap-0 border-none p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="bg-park flex-row items-center justify-between gap-3 px-5 pt-5 pb-4 text-white">
          <div>
            <SheetTitle className="font-poster text-4xl leading-none font-black text-white uppercase">
              Your order
            </SheetTitle>
            <SheetDescription className="mt-1 text-white/60">
              {itemCount > 0
                ? `${itemCount} ${itemCount === 1 ? "item" : "items"} ready to send`
                : "Nothing added yet"}
            </SheetDescription>
          </div>
          <SheetClose
            aria-label="Close"
            className="bg-park-2 grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/15"
          >
            <X className="size-5" />
          </SheetClose>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="bg-lime text-park grid size-16 place-items-center rounded-full">
              {sent ? (
                <CheckCircle2 className="size-8" />
              ) : (
                <ShoppingBag className="size-7" />
              )}
            </span>
            {sent ? (
              <>
                <p className="font-poster mt-2 text-3xl leading-none font-black uppercase">
                  Order on its way
                </p>
                <p className="text-park/65 text-sm">
                  Finish sending the message in WhatsApp and we will confirm
                  shortly.
                </p>
              </>
            ) : (
              <p className="text-park/65 text-sm">
                Your order is empty. Browse the menu and add something you like.
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1 space-y-2.5 overflow-y-auto px-4 pt-4 pb-2">
            {lines.map((line) => (
              <div
                key={line.id}
                className="shadow-card flex items-center gap-3 rounded-2xl bg-white p-2"
              >
                <div className="bg-paper text-park/40 relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl">
                  {line.imageUrl ? (
                    <Image
                      src={line.imageUrl}
                      alt={line.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="size-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-snug font-bold">{line.name}</p>
                    <button
                      type="button"
                      className="text-park/40 hover:text-chili -mt-0.5 grid size-7 shrink-0 place-items-center rounded-full transition-colors"
                      onClick={() => removeItem(line.id)}
                      aria-label={`Remove ${line.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <div className="bg-park flex items-center gap-1 rounded-full p-0.5 text-white">
                      <button
                        type="button"
                        className="bg-park-2 grid size-7 place-items-center rounded-full transition-transform active:scale-90"
                        onClick={() => decrement(line.id)}
                        aria-label={`Remove one ${line.name}`}
                      >
                        <Minus className="size-3.5" strokeWidth={2.75} />
                      </button>
                      <span className="min-w-5 text-center text-sm font-extrabold tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="bg-lime text-park grid size-7 place-items-center rounded-full transition-transform active:scale-90"
                        onClick={() => increment(line.id)}
                        aria-label={`Add one more ${line.name}`}
                      >
                        <Plus className="size-3.5" strokeWidth={2.75} />
                      </button>
                    </div>

                    <span className="font-poster text-xl leading-none font-black whitespace-nowrap tabular-nums">
                      {formatPrice(line.price * line.quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {lines.length > 0 ? (
          <SheetFooter className="gap-4 border-t border-black/5 bg-white/60 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="space-y-1.5">
              <span className={FIELD_LABEL}>How do you want it?</span>
              <div className="bg-park/8 grid grid-cols-2 gap-1 rounded-full p-1">
                {(["pickup", "delivery"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={fulfilment === option}
                    onClick={() => setFulfilment(option)}
                    className={cn(
                      "flex h-10 items-center justify-center gap-1.5 rounded-full text-sm font-bold capitalize transition-colors",
                      fulfilment === option
                        ? "bg-park text-lime"
                        : "text-park/70 hover:text-park"
                    )}
                  >
                    {option}
                    {option === "delivery" && feeHint ? (
                      <span className="text-xs font-semibold opacity-75">
                        +{feeHint}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-name" className={FIELD_LABEL}>
                Name for the order
              </Label>
              <Input
                id="order-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className={FIELD}
              />
            </div>

            {needsAddress ? (
              <div className="space-y-1.5">
                <Label htmlFor="order-address" className={FIELD_LABEL}>
                  Delivery address
                </Label>
                <Textarea
                  id="order-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows={2}
                  placeholder="House and street, area"
                  autoComplete="street-address"
                  className={cn(FIELD, "h-auto")}
                />
                {deliveryNote ? (
                  <p className="text-park/60 text-xs">{deliveryNote}</p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-1.5">
              {fee || feeWaived ? (
                <div className="text-park/70 space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery</span>
                    <span className={fee ? "tabular-nums" : "text-park font-bold"}>
                      {fee ? formatPrice(fee, currency) : "Free"}
                    </span>
                  </div>
                </div>
              ) : null}
              <div className="border-park/20 font-poster flex items-center justify-between border-t border-dashed pt-2 text-3xl leading-none font-black uppercase">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatPrice(subtotal + fee, currency)}
                </span>
              </div>
            </div>

            {clean(settings.phone_whatsapp) ? (
              <button
                type="button"
                className="bg-park text-lime flex h-13 w-full items-center justify-center gap-2 rounded-full font-bold transition-opacity disabled:opacity-50"
                onClick={sendOrder}
                disabled={lines.length === 0 || sending || !detailsComplete}
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MessageCircle className="size-5" />
                )}
                Send order on WhatsApp
              </button>
            ) : call ? (
              // No WhatsApp number in settings: fall back to a phone call.
              <a
                href={call}
                className="bg-park text-lime flex h-13 w-full items-center justify-center gap-2 rounded-full font-bold"
              >
                <Phone className="size-4" />
                Call to order{phone ? ` ${phone}` : ""}
              </a>
            ) : null}

            {clean(settings.phone_whatsapp) ? (
              <p className="text-park/60 -mt-1 text-center text-xs">
                {detailsComplete
                  ? "WhatsApp opens with your order written out. Press send and we'll confirm."
                  : name.trim()
                    ? "Add your delivery address to send the order."
                    : "Add your name to send the order."}
              </p>
            ) : null}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
