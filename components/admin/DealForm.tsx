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
import { createDeal, updateDeal, type DealInput } from "@/app/admin/actions";
import type { Deal } from "@/lib/types";

export function DealForm({ deal }: { deal?: Deal }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(deal?.name ?? "");
  const [items, setItems] = useState((deal?.items ?? []).join("\n"));
  const [price, setPrice] = useState(deal ? String(deal.price) : "");
  const [badge, setBadge] = useState(deal?.badge ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    deal?.image_url ?? null
  );
  const [isActive, setIsActive] = useState(deal?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(String(deal?.sort_order ?? 0));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: DealInput = {
      name,
      items: items
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      price: Number(price),
      badge: badge.trim() || null,
      image_url: imageUrl,
      is_active: isActive,
      sort_order: Number(sortOrder) || 0,
    };

    startTransition(async () => {
      const result = deal
        ? await updateDeal(deal.id, input)
        : await createDeal(input);

      if (result.ok) {
        toast.success(deal ? "Deal saved." : "Deal added.");
        router.push("/admin/deals");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold">
        {deal ? "Edit deal" : "New deal"}
      </h1>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Shawarma Duo"
          required
          disabled={pending}
        />
        <p className="text-muted-foreground text-xs">
          The last word is shown in green on the site, like the posters.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="items">What&rsquo;s in the deal</Label>
        <Textarea
          id="items"
          value={items}
          onChange={(event) => setItems(event.target.value)}
          rows={5}
          placeholder={"2 Chicken Shawarmas\n1 Classic Fries\n2 Mango Slush"}
          required
          disabled={pending}
        />
        <p className="text-muted-foreground text-xs">One item per line.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Deal price</Label>
          <Input
            id="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">Sort order</Label>
          <Input
            id="sort"
            type="number"
            inputMode="numeric"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="badge">Badge</Label>
        <Input
          id="badge"
          value={badge}
          onChange={(event) => setBadge(event.target.value)}
          placeholder="Optional, e.g. Serves 4-5"
          maxLength={24}
          disabled={pending}
        />
      </div>

      <ImageUploader
        value={imageUrl}
        onChange={setImageUrl}
        folder="deals"
        label="Deal photo"
      />

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="active" className="font-normal">
            Show on the website
          </Label>
          <Switch
            id="active"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {deal ? "Save changes" : "Add deal"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => router.push("/admin/deals")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
