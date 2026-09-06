"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { updateSettings, type SettingsInput } from "@/app/admin/actions";
import { isValidWhatsappNumber } from "@/lib/validation";
import { buildOrderMessage, type OrderDetails } from "@/lib/whatsapp";
import type { CartLine } from "@/context/CartContext";
import type { SiteSettings } from "@/lib/types";

/** Two invented lines, used only to preview the outgoing order message. */
const PREVIEW_LINES: CartLine[] = [
  { id: "a", name: "Sample item", price: 650, imageUrl: null, quantity: 2 },
  { id: "b", name: "Another item", price: 450, imageUrl: null, quantity: 1 },
];

/** Stand in for what the customer types into the cart before sending. */
const PREVIEW_DETAILS: OrderDetails = {
  name: "Customer name",
  fulfilment: "delivery",
  address: "Their delivery address",
};

function nullable(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

/**
 * Reads a money field. Empty is `null` — meaning "not set" — and anything that
 * is not a number comes back as NaN, so the form can refuse it rather than
 * quietly saving a zero.
 */
function amount(value: string): number | null {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    cafe_name: settings.cafe_name,
    tagline: settings.tagline ?? "",
    phone_display: settings.phone_display ?? "",
    phone_whatsapp: settings.phone_whatsapp ?? "",
    address: settings.address ?? "",
    hours: settings.hours ?? "",
    currency: settings.currency,
    instagram_url: settings.instagram_url ?? "",
    facebook_url: settings.facebook_url ?? "",
    whatsapp_greeting: settings.whatsapp_greeting ?? "",
    delivery_fee: settings.delivery_fee ? String(settings.delivery_fee) : "",
    free_delivery_over: settings.free_delivery_over
      ? String(settings.free_delivery_over)
      : "",
    delivery_note: settings.delivery_note ?? "",
    announcement_text: settings.announcement_text ?? "",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(settings.logo_url);
  const [announcementActive, setAnnouncementActive] = useState(
    settings.announcement_active
  );

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      disabled: pending,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => setForm((current) => ({ ...current, [key]: event.target.value })),
    };
  }

  const whatsapp = form.phone_whatsapp.trim();
  const whatsappValid = whatsapp === "" || isValidWhatsappNumber(whatsapp);

  // An empty charge means free delivery, which is a valid answer; a typo is not.
  const fee = amount(form.delivery_fee);
  const feeValid = fee === null || (Number.isFinite(fee) && fee >= 0);
  const threshold = amount(form.free_delivery_over);
  const thresholdValid =
    threshold === null || (Number.isFinite(threshold) && threshold > 0);
  const canSave = whatsappValid && feeValid && thresholdValid;

  // The preview details order a delivery, so the owner sees the charge land in
  // the message as they type it.
  const previewMessage = buildOrderMessage(
    PREVIEW_LINES,
    {
      ...settings,
      cafe_name: form.cafe_name || settings.cafe_name,
      currency: form.currency || settings.currency,
      whatsapp_greeting: nullable(form.whatsapp_greeting),
      delivery_fee: feeValid && fee !== null ? fee : 0,
      free_delivery_over: thresholdValid ? threshold : null,
    },
    PREVIEW_DETAILS
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: SettingsInput = {
      cafe_name: form.cafe_name,
      tagline: nullable(form.tagline),
      logo_url: logoUrl,
      phone_display: nullable(form.phone_display),
      phone_whatsapp: nullable(whatsapp),
      address: nullable(form.address),
      hours: nullable(form.hours),
      currency: form.currency,
      instagram_url: nullable(form.instagram_url),
      facebook_url: nullable(form.facebook_url),
      whatsapp_greeting: nullable(form.whatsapp_greeting),
      delivery_fee: fee ?? 0,
      free_delivery_over: threshold,
      delivery_note: nullable(form.delivery_note),
      announcement_text: nullable(form.announcement_text),
      announcement_active: announcementActive,
    };

    startTransition(async () => {
      const result = await updateSettings(input);
      if (result.ok) {
        toast.success("Settings saved.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Branding</h2>

        <div className="space-y-2">
          <Label htmlFor="cafe_name">Cafe name</Label>
          <Input id="cafe_name" required {...field("cafe_name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" {...field("tagline")} />
        </div>

        <ImageUploader
          value={logoUrl}
          onChange={setLogoUrl}
          folder="logo"
          label="Logo"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Contact</h2>

        <div className="space-y-2">
          <Label htmlFor="phone_display">Phone shown on the site</Label>
          <Input id="phone_display" {...field("phone_display")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_whatsapp">WhatsApp number</Label>
          <Input
            id="phone_whatsapp"
            inputMode="numeric"
            aria-invalid={!whatsappValid}
            {...field("phone_whatsapp")}
          />
          <p className="text-muted-foreground text-xs">
            Digits only, with the country code. No plus sign, no leading zero.
          </p>
          {whatsapp ? (
            whatsappValid ? (
              <p className="text-muted-foreground text-xs break-all">
                Orders go to{" "}
                <span className="font-medium">https://wa.me/{whatsapp}</span>
              </p>
            ) : (
              <p className="text-destructive text-xs">
                That is not a valid number yet.
              </p>
            )
          ) : (
            <p className="text-muted-foreground text-xs">
              Leave empty to hide the WhatsApp buttons and offer calling instead.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" rows={2} {...field("address")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hours">Opening hours</Label>
          <Input id="hours" {...field("hours")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram link</Label>
            <Input id="instagram_url" {...field("instagram_url")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook_url">Facebook link</Label>
            <Input id="facebook_url" {...field("facebook_url")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Ordering</h2>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency symbol</Label>
          <Input id="currency" required className="max-w-32" {...field("currency")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_greeting">Order greeting</Label>
          <Input id="whatsapp_greeting" {...field("whatsapp_greeting")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="delivery_fee">Delivery charge</Label>
            <Input
              id="delivery_fee"
              inputMode="decimal"
              placeholder="0"
              aria-invalid={!feeValid}
              {...field("delivery_fee")}
            />
            {feeValid ? (
              <p className="text-muted-foreground text-xs">
                Added to delivery orders only. Leave empty for free delivery.
              </p>
            ) : (
              <p className="text-destructive text-xs">
                Enter a number, or leave it empty.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="free_delivery_over">Free delivery over</Label>
            <Input
              id="free_delivery_over"
              inputMode="decimal"
              placeholder="No limit"
              aria-invalid={!thresholdValid}
              {...field("free_delivery_over")}
            />
            {thresholdValid ? (
              <p className="text-muted-foreground text-xs">
                Waives the charge once the food alone reaches this much. Leave
                empty to always charge.
              </p>
            ) : (
              <p className="text-destructive text-xs">
                Enter a number above zero, or leave it empty.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="delivery_note">Delivery note</Label>
          <Input
            id="delivery_note"
            placeholder="Delivery within 5 km only"
            {...field("delivery_note")}
          />
          <p className="text-muted-foreground text-xs">
            Shown under the address box when a customer chooses delivery.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Customers will send</p>
          <pre className="bg-muted overflow-x-auto rounded-lg border p-3 text-xs whitespace-pre-wrap">
            {previewMessage}
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Announcement</h2>

        <div className="space-y-2">
          <Label htmlFor="announcement_text">Announcement text</Label>
          <Input
            id="announcement_text"
            placeholder="Closed today, or New winter menu"
            {...field("announcement_text")}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <Label htmlFor="announcement_active" className="font-normal">
            Show the announcement bar
          </Label>
          <Switch
            id="announcement_active"
            checked={announcementActive}
            onCheckedChange={setAnnouncementActive}
            disabled={pending}
          />
        </div>
      </section>

      <Button type="submit" size="lg" disabled={pending || !canSave}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Save settings
      </Button>
    </form>
  );
}
