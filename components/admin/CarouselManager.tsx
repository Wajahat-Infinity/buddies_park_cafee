"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlideForm } from "@/components/admin/SlideForm";
import {
  createSlide,
  deleteSlide,
  moveSlide,
  updateSlide,
  type ActionResult,
  type SlideInput,
} from "@/app/admin/actions";
import type { CarouselSlide } from "@/lib/types";

export function CarouselManager({ slides }: { slides: CarouselSlide[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<CarouselSlide | null>(null);

  function run(action: () => Promise<ActionResult>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        setAdding(false);
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Hero carousel</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Slides play in this order at the top of the site.
          </p>
        </div>
        {adding ? null : (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            New slide
          </Button>
        )}
      </div>

      {adding ? (
        <div className="bg-card mt-5 rounded-xl border p-4">
          <p className="mb-4 text-sm font-semibold">New slide</p>
          <SlideForm
            pending={pending}
            onCancel={() => setAdding(false)}
            onSubmit={(input: SlideInput) =>
              run(() => createSlide(input), "Slide added.")
            }
          />
        </div>
      ) : null}

      <ul className="mt-5 space-y-3">
        {slides.map((slide, index) => (
          <li key={slide.id} className="bg-card rounded-xl border p-3">
            {editingId === slide.id ? (
              <SlideForm
                slide={slide}
                pending={pending}
                onCancel={() => setEditingId(null)}
                onSubmit={(input: SlideInput) =>
                  run(() => updateSlide(slide.id, input), "Slide saved.")
                }
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex shrink-0 flex-col">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    aria-label="Move slide up"
                    disabled={pending || index === 0}
                    onClick={() =>
                      run(() => moveSlide(slide.id, "up"), "Order updated.")
                    }
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    aria-label="Move slide down"
                    disabled={pending || index === slides.length - 1}
                    onClick={() =>
                      run(() => moveSlide(slide.id, "down"), "Order updated.")
                    }
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>

                <div className="bg-muted relative aspect-video w-28 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={slide.image_url}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {slide.title || "Untitled slide"}
                  </p>
                  {slide.subtitle ? (
                    <p className="text-muted-foreground truncate text-xs">
                      {slide.subtitle}
                    </p>
                  ) : null}
                  {slide.is_active ? null : (
                    <Badge variant="secondary" className="mt-1.5 text-xs">
                      Hidden
                    </Badge>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit slide"
                    disabled={pending}
                    onClick={() => setEditingId(slide.id)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete slide"
                    disabled={pending}
                    onClick={() => setConfirming(slide)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {slides.length === 0 && !adding ? (
        <p className="text-muted-foreground mt-6 text-sm">
          No slides yet. Until you add one, the site shows the cafe name and
          tagline instead.
        </p>
      ) : null}

      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this slide?</AlertDialogTitle>
            <AlertDialogDescription>
              The slide and its image are removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => {
                const target = confirming;
                setConfirming(null);
                if (target) run(() => deleteSlide(target.id), "Slide deleted.");
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
