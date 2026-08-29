"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  createCategory,
  deleteCategory,
  moveCategory,
  updateCategory,
  type ActionResult,
} from "@/app/admin/actions";
import type { Category } from "@/lib/types";

type CategoryRow = Category & { itemCount: number };

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirming, setConfirming] = useState<CategoryRow | null>(null);

  /** Runs an action, toasts the outcome and refreshes the server data. */
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

  function onAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName;
    if (!name.trim()) return;
    run(async () => {
      const result = await createCategory(name);
      if (result.ok) setNewName("");
      return result;
    }, "Category added.");
  }

  function saveRename(id: string) {
    const name = editingName;
    run(async () => {
      const result = await updateCategory(id, { name });
      if (result.ok) setEditingId(null);
      return result;
    }, "Category renamed.");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold">Categories</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        The order here is the order of the tabs on the site.
      </p>

      <form onSubmit={onAdd} className="mt-5 flex gap-2">
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New category name"
          disabled={pending}
          aria-label="New category name"
        />
        <Button type="submit" disabled={pending || !newName.trim()}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add
        </Button>
      </form>

      <ul className="mt-5 space-y-2">
        {categories.map((category, index) => (
          <li
            key={category.id}
            className="bg-card flex flex-wrap items-center gap-3 rounded-lg border p-3"
          >
            <div className="flex shrink-0 flex-col">
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                aria-label={`Move ${category.name} up`}
                disabled={pending || index === 0}
                onClick={() =>
                  run(() => moveCategory(category.id, "up"), "Order updated.")
                }
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                aria-label={`Move ${category.name} down`}
                disabled={pending || index === categories.length - 1}
                onClick={() =>
                  run(() => moveCategory(category.id, "down"), "Order updated.")
                }
              >
                <ArrowDown className="size-3.5" />
              </Button>
            </div>

            <div className="min-w-0 flex-1">
              {editingId === category.id ? (
                <div className="flex gap-2">
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    disabled={pending}
                    aria-label={`Rename ${category.name}`}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    aria-label="Save name"
                    disabled={pending}
                    onClick={() => saveRename(category.id)}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Cancel rename"
                    disabled={pending}
                    onClick={() => setEditingId(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="truncate font-medium">{category.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {category.itemCount}{" "}
                    {category.itemCount === 1 ? "item" : "items"}
                  </p>
                </>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Switch
                checked={category.is_active}
                disabled={pending}
                aria-label={`Show ${category.name} on the site`}
                onCheckedChange={(checked) =>
                  run(
                    () => updateCategory(category.id, { is_active: checked }),
                    checked ? "Category shown." : "Category hidden."
                  )
                }
              />
              {editingId === category.id ? null : (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Rename ${category.name}`}
                  disabled={pending}
                  onClick={() => {
                    setEditingId(category.id);
                    setEditingName(category.name);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${category.name}`}
                disabled={pending}
                onClick={() => setConfirming(category)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {categories.length === 0 ? (
        <p className="text-muted-foreground mt-6 text-sm">
          No categories yet. Add the first one above.
        </p>
      ) : null}

      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {confirming?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirming?.itemCount
                ? `This also deletes its ${confirming.itemCount} item${
                    confirming.itemCount === 1 ? "" : "s"
                  } and their photos. This cannot be undone.`
                : "This cannot be undone."}
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
                  run(() => deleteCategory(target.id), "Category deleted.");
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
