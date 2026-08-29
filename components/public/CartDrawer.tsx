"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { clean, formatPrice, telHref } from "@/lib/format";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/types";

/** Slide in cart, and the hand off to WhatsApp. */
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
    total,
    increment,
    decrement,
    removeItem,
    clearCart,
  } = useCart();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const currency = settings.currency;
  const call = telHref(settings.phone_display);
  const phone = clean(settings.phone_display);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    // Reset the thank you state once the drawer has closed.
    if (!next) setSent(false);
  }

  function sendOrder() {
    if (lines.length === 0) return;

    const message = buildOrderMessage(lines, settings);
    const url = buildWhatsAppUrl(message, settings.phone_whatsapp);
    if (!url) return;

    setSending(true);
    // Opened synchronously inside the click so mobile browsers do not block it.
    window.open(url, "_blank", "noopener,noreferrer");
    setSending(false);
    setSent(true);
    clearCart();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your order</SheetTitle>
          <SheetDescription>
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? "item" : "items"} ready to send`
              : "Nothing added yet"}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            {sent ? (
              <>
                <CheckCircle2 className="text-primary size-10" />
                <p className="text-foreground text-sm font-medium">
                  Your order is on its way to WhatsApp.
                </p>
                <p className="text-sm">
                  Finish sending the message there and we will confirm shortly.
                </p>
              </>
            ) : (
              <>
                <ShoppingBag className="size-10" />
                <p className="text-sm">
                  Your cart is empty. Browse the menu and add something you
                  like.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto px-4">
            {lines.map((line) => (
              <div key={line.id} className="flex gap-3 rounded-lg border p-3">
                <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md">
                  {line.imageUrl ? (
                    <Image
                      src={line.imageUrl}
                      alt={line.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-snug font-medium">
                      {line.name}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive size-7 shrink-0"
                      onClick={() => removeItem(line.id)}
                      aria-label={`Remove ${line.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 rounded-md border p-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 transition-transform active:scale-90"
                        onClick={() => decrement(line.id)}
                        aria-label={`Remove one ${line.name}`}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="min-w-5 text-center text-sm font-semibold tabular-nums">
                        {line.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 transition-transform active:scale-90"
                        onClick={() => increment(line.id)}
                        aria-label={`Add one more ${line.name}`}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>

                    <span className="text-sm font-semibold whitespace-nowrap">
                      {formatPrice(line.price * line.quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {lines.length > 0 ? (
          <SheetFooter className="gap-3">
            <Separator />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatPrice(total, currency)}
              </span>
            </div>
            {clean(settings.phone_whatsapp) ? (
              <Button
                size="lg"
                className="w-full"
                onClick={sendOrder}
                disabled={lines.length === 0 || sending}
              >
                {sending ? <Loader2 className="size-4 animate-spin" /> : null}
                Send order on WhatsApp
              </Button>
            ) : call ? (
              // No WhatsApp number in settings: fall back to a phone call.
              <Button asChild size="lg" className="w-full">
                <a href={call}>
                  <Phone className="size-4" />
                  Call to order{phone ? ` ${phone}` : ""}
                </a>
              </Button>
            ) : null}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
