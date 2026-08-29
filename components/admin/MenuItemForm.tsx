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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  createMenuItem,
  updateMenuItem,
  type MenuItemInput,
} from "@/app/admin/actions";
import type { Category, MenuItem } from "@/lib/types";

export function MenuItemForm({
  categories,
  item,
}: {
  categories: Category[];
  item?: MenuItem;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [categoryId, setCategoryId] = useState(
    item?.category_id ?? categories[0]?.id ?? ""
  );
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    item?.image_url ?? null
  );
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true);
  const [isFeatured, setIsFeatured] = useState(item?.is_featured ?? false);
  const [tags, setTags] = useState((item?.tags ?? []).join(", "));
  const [sortOrder, setSortOrder] = useState(String(item?.sort_order ?? 0));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: MenuItemInput = {
      category_id: categoryId,
      name,
      description: description.trim() || null,
      price: Number(price),
      image_url: imageUrl,
      is_available: isAvailable,
      is_featured: isFeatured,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      sort_order: Number(sortOrder) || 0,
    };

    startTransition(async () => {
      const result = item
        ? await updateMenuItem(item.id, input)
        : await createMenuItem(input);

      if (result.ok) {
        toast.success(item ? "Item saved." : "Item added.");
        router.push("/admin/menu");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold">
        {item ? "Edit item" : "New item"}
      </h1>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          disabled={pending}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
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

      <ImageUploader
        value={imageUrl}
        onChange={setImageUrl}
        folder="menu"
        label="Item photo"
      />

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="Separate with commas"
          disabled={pending}
        />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="available" className="font-normal">
            Available to order
          </Label>
          <Switch
            id="available"
            checked={isAvailable}
            onCheckedChange={setIsAvailable}
            disabled={pending}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="featured" className="font-normal">
            Show in the featured carousel
          </Label>
          <Switch
            id="featured"
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending || !categoryId}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {item ? "Save changes" : "Add item"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => router.push("/admin/menu")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
