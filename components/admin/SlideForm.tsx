"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { SlideInput } from "@/app/admin/actions";
import type { CarouselSlide } from "@/lib/types";

/** Add or edit one slide. Used inline on the carousel screen. */
export function SlideForm({
  slide,
  pending,
  onSubmit,
  onCancel,
}: {
  slide?: CarouselSlide;
  pending: boolean;
  onSubmit: (input: SlideInput) => void;
  onCancel?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    slide?.image_url ?? null
  );
  const [title, setTitle] = useState(slide?.title ?? "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? "");
  const [isActive, setIsActive] = useState(slide?.is_active ?? true);

  function submit() {
    if (!imageUrl) return;
    onSubmit({
      image_url: imageUrl,
      title: title.trim() || null,
      subtitle: subtitle.trim() || null,
      is_active: isActive,
    });
  }

  return (
    <div className="space-y-4">
      <ImageUploader
        value={imageUrl}
        onChange={setImageUrl}
        folder="carousel"
        label="Slide image"
      />

      <div className="space-y-2">
        <Label htmlFor={`title-${slide?.id ?? "new"}`}>Title</Label>
        <Input
          id={`title-${slide?.id ?? "new"}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`subtitle-${slide?.id ?? "new"}`}>Subtitle</Label>
        <Input
          id={`subtitle-${slide?.id ?? "new"}`}
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          disabled={pending}
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <Label htmlFor={`active-${slide?.id ?? "new"}`} className="font-normal">
          Show this slide
        </Label>
        <Switch
          id={`active-${slide?.id ?? "new"}`}
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={pending}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" onClick={submit} disabled={pending || !imageUrl}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {slide ? "Save slide" : "Add slide"}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}
