"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
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
  deleteMenuItem,
  setMenuItemFlag,
  type ActionResult,
} from "@/app/admin/actions";
import type { Category, MenuItem } from "@/lib/types";

export function MenuTable({
  items,
  categories,
  currency,
}: {
  items: MenuItem[];
  categories: Category[];
  currency: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<string>("all");
  const [confirming, setConfirming] = useState<MenuItem | null>(null);

  const visible =
    filter === "all"
      ? items
      : items.filter((item) => item.category_id === filter);

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
        <h1 className="text-xl font-semibold">Menu items</h1>
        <Button asChild size="sm" disabled={categories.length === 0}>
          <Link href="/admin/menu/new">
            <Plus className="size-4" />
            New item
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Add a category first, then items can go inside it.
        </p>
      ) : null}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {[{ id: "all", name: "All" }, ...categories].map((category) => (
          <Button
            key={category.id}
            size="sm"
            variant={filter === category.id ? "default" : "outline"}
            className="shrink-0"
            onClick={() => setFilter(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {visible.map((item) => (
          <li
            key={item.id}
            className="bg-card flex items-start gap-3 rounded-lg border p-3"
          >
            <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-md">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt=""
                  fill
                  sizes="56px"
                  className={cn(
                    "object-cover",
                    !item.is_available && "grayscale"
                  )}
                />
              ) : (
                <div className="text-muted-foreground flex size-full items-center justify-center">
                  <UtensilsCrossed className="size-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.name}</p>
              <p className="text-muted-foreground text-sm">
                {formatPrice(item.price, currency)}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={item.is_available}
                    disabled={pending}
                    aria-label={`${item.name} available`}
                    onCheckedChange={(checked) =>
                      run(
                        () =>
                          setMenuItemFlag(item.id, "is_available", checked),
                        checked ? "Back in stock." : "Marked sold out."
                      )
                    }
                  />
                  Available
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={item.is_featured}
                    disabled={pending}
                    aria-label={`${item.name} featured`}
                    onCheckedChange={(checked) =>
                      run(
                        () => setMenuItemFlag(item.id, "is_featured", checked),
                        checked ? "Added to featured." : "Removed from featured."
                      )
                    }
                  />
                  Featured
                </label>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-1">
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={`Edit ${item.name}`}
              >
                <Link href={`/admin/menu/${item.id}`}>
                  <Pencil className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${item.name}`}
                disabled={pending}
                onClick={() => setConfirming(item)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {visible.length === 0 && categories.length > 0 ? (
        <p className="text-muted-foreground mt-6 text-sm">
          Nothing here yet.
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
              The item and its photo are removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => {
                const target = confirming;
                setConfirming(null);
                if (target) {
                  run(() => deleteMenuItem(target.id), "Item deleted.");
                }
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
