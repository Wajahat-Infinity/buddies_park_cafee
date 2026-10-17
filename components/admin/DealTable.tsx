"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BadgePercent, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import {
  deleteDeal,
  setDealActive,
  type ActionResult,
} from "@/app/admin/actions";
import type { Deal } from "@/lib/types";

export function DealTable({
  deals,
  currency,
}: {
  deals: Deal[];
  currency: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<Deal | null>(null);

  function run(action: () => Promise<ActionResult>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Deals</h1>
        <Button asChild size="sm">
          <Link href="/admin/deals/new">
            <Plus className="size-4" />
            New deal
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground mt-1 text-sm">
        Shown under the hero on the home page and on the Deals page. Switch a
        deal off to hide it without deleting it.
      </p>

      <ul className="mt-4 space-y-2">
        {deals.map((deal) => (
          <li
            key={deal.id}
            className="bg-card flex items-start gap-3 rounded-lg border p-3"
          >
            <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-md">
              {deal.image_url ? (
                <Image
                  src={deal.image_url}
                  alt=""
                  fill
                  sizes="56px"
                  className={cn("object-cover", !deal.is_active && "grayscale")}
                />
              ) : (
                <div className="text-muted-foreground flex size-full items-center justify-center">
                  <BadgePercent className="size-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{deal.name}</p>
              <p className="text-muted-foreground text-sm">
                {formatPrice(deal.price, currency)}
                {deal.badge ? ` · ${deal.badge}` : ""}
              </p>
              <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                {(deal.items ?? []).join(" · ")}
              </p>

              <label className="mt-2 flex w-fit items-center gap-2 text-xs">
                <Switch
                  checked={deal.is_active}
                  disabled={pending}
                  aria-label={`${deal.name} shown on the website`}
                  onCheckedChange={(checked) =>
                    run(
                      () => setDealActive(deal.id, checked),
                      checked ? "Deal is live." : "Deal hidden."
                    )
                  }
                />
                Live on website
              </label>
            </div>

            <div className="flex shrink-0 flex-col gap-1">
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={`Edit ${deal.name}`}
              >
                <Link href={`/admin/deals/${deal.id}`}>
                  <Pencil className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${deal.name}`}
                disabled={pending}
                onClick={() => setConfirming(deal)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {deals.length === 0 ? (
        <p className="text-muted-foreground mt-6 text-sm">
          No deals yet. Add one and it appears on the home page straight away.
        </p>
      ) : null}

      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirming?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The deal and its uploaded photo are removed permanently. To hide
              it for now, switch it off instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => {
                const target = confirming;
                setConfirming(null);
                if (target) run(() => deleteDeal(target.id), "Deal deleted.");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
