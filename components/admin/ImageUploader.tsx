"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, buildMediaPath, type MediaFolder } from "@/lib/storage";

const MAX_EDGE = 1400;
const QUALITY = 0.82;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/**
 * Resizes and re-encodes the picked file in the browser, so a 6MB phone photo
 * reaches storage as a small JPEG instead.
 */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process the image.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY)
  );
  if (!blob) throw new Error("Could not process the image.");
  return blob;
}

export function ImageUploader({
  value,
  onChange,
  folder,
  label = "Photo",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: MediaFolder;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      toast.error("That image is too large. Pick one under 15MB.");
      return;
    }

    setUploading(true);
    try {
      const blob = await compress(file);
      const supabase = createClient();
      const path = buildMediaPath(folder, "jpg");

      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

      onChange(publicUrl);
      toast.success("Photo uploaded.");
    } catch (error) {
      console.error("[upload]", error);
      toast.error(
        error instanceof Error ? error.message : "Upload failed. Try again."
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>

      <div className="flex items-start gap-3">
        <div className="bg-muted relative size-24 shrink-0 overflow-hidden rounded-lg border">
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center">
              <ImagePlus className="size-6" />
            </div>
          )}
          {uploading ? (
            <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <ImagePlus className="size-4" />
                {value ? "Replace photo" : "Upload photo"}
              </>
            )}
          </Button>

          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              disabled={uploading}
              onClick={() => onChange(null)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          ) : null}

          <p className="text-muted-foreground text-xs">
            Resized automatically before upload.
          </p>
        </div>
      </div>
    </div>
  );
}
