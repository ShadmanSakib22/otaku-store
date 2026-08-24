"use client";

import { useState, useTransition } from "react";
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteHeroSlideAction,
  reorderHeroSlidesAction,
  saveHeroSlideAction,
} from "@/lib/actions/hero-actions";
import { uploadImageAction } from "@/lib/actions/product-actions";

export interface HeroSlideRow {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaText: string | null;
  ctaUrl: string | null;
  position: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

type SavedSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaText: string | null;
  ctaUrl: string | null;
  position: number;
  isActive: boolean;
  startsAt: string | Date | null;
  endsAt: string | Date | null;
};

interface SlideForm {
  id?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  position: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

function toRow(slide: SavedSlide): HeroSlideRow {
  return {
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    imageUrl: slide.imageUrl,
    ctaText: slide.ctaText,
    ctaUrl: slide.ctaUrl,
    position: slide.position,
    isActive: slide.isActive,
    startsAt: slide.startsAt ? new Date(slide.startsAt).toISOString() : null,
    endsAt: slide.endsAt ? new Date(slide.endsAt).toISOString() : null,
  };
}

function emptyForm(): SlideForm {
  return {
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaText: "",
    ctaUrl: "",
    position: "0",
    isActive: true,
    startsAt: "",
    endsAt: "",
  };
}

function fromSlide(slide: HeroSlideRow): SlideForm {
  return {
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle ?? "",
    imageUrl: slide.imageUrl,
    ctaText: slide.ctaText ?? "",
    ctaUrl: slide.ctaUrl ?? "",
    position: String(slide.position),
    isActive: slide.isActive,
    startsAt: slide.startsAt?.slice(0, 10) ?? "",
    endsAt: slide.endsAt?.slice(0, 10) ?? "",
  };
}

export function HeroSlidesManager({
  slides,
  canDelete,
}: {
  slides: HeroSlideRow[];
  canDelete: boolean;
}) {
  const [items, setItems] = useState(slides);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SlideForm>(emptyForm());
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const set = (key: keyof SlideForm, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const openNew = () => {
    setForm(emptyForm());
    setError("");
    setOpen(true);
  };

  const openEdit = (slide: HeroSlideRow) => {
    setForm(fromSlide(slide));
    setError("");
    setOpen(true);
  };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = (await uploadImageAction(fd)) as { url?: string; error?: string };
    setUploading(false);
    if (res.url) {
      set("imageUrl", res.url);
    } else {
      setError(res.error ?? "Upload failed");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subtitle", form.subtitle);
    fd.append("imageUrl", form.imageUrl);
    fd.append("ctaText", form.ctaText);
    fd.append("ctaUrl", form.ctaUrl);
    fd.append("position", form.position);
    fd.append("isActive", form.isActive ? "true" : "false");
    fd.append("startsAt", form.startsAt);
    fd.append("endsAt", form.endsAt);
    if (form.id) fd.append("id", form.id);

    startTransition(async () => {
      const res = await saveHeroSlideAction(fd);
      if (res.ok && res.slide) {
        const row = toRow(res.slide);
        setItems((list) => {
          const exists = list.some((s) => s.id === row.id);
          const next = exists ? list.map((s) => (s.id === row.id ? row : s)) : [...list, row];
          return next.sort((a, b) => a.position - b.position);
        });
        setOpen(false);
      } else {
        setError(res.error ?? "Failed to save slide");
      }
    });
  }

  const handleDelete = (slide: HeroSlideRow) => {
    if (!window.confirm(`Delete slide "${slide.title}"?`)) return;
    startTransition(async () => {
      await deleteHeroSlideAction(slide.id);
      setItems((list) => list.filter((s) => s.id !== slide.id));
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    const next = reordered.map((s, i) => ({ ...s, position: i }));
    setItems(next);
    startTransition(async () => {
      await reorderHeroSlidesAction(next.map((s) => s.id));
    });
  };

  const dateRange = (slide: HeroSlideRow) => {
    if (!slide.startsAt && !slide.endsAt) return null;
    const start = slide.startsAt?.slice(0, 10) ?? "...";
    const end = slide.endsAt?.slice(0, 10) ?? "...";
    return `${start} to ${end}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Slides appear in the homepage carousel, ordered by position.
        </p>
        <Button onClick={openNew}>
          <PlusIcon />
          Add slide
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hero slides yet. Add one to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((slide, index) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 rounded-none border bg-card p-4"
            >
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="outline"
                  aria-label="Move up"
                  disabled={index === 0 || isPending}
                  onClick={() => move(index, -1)}
                >
                  <ChevronUpIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="outline"
                  aria-label="Move down"
                  disabled={index === items.length - 1 || isPending}
                  onClick={() => move(index, 1)}
                >
                  <ChevronDownIcon />
                </Button>
              </div>
              <div className="h-16 w-28 shrink-0 overflow-hidden rounded-none bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{slide.title}</p>
                <p className="text-xs text-muted-foreground">
                  Position {slide.position} &middot; {dateRange(slide) ?? "No date range"}
                </p>
              </div>
              <Badge variant={slide.isActive ? "default" : "outline"}>
                {slide.isActive ? "Active" : "Inactive"}
              </Badge>
              <div className="flex items-center gap-1">
                <Button type="button" size="icon-sm" variant="ghost" aria-label="Edit slide" onClick={() => openEdit(slide)}>
                  <PencilIcon />
                </Button>
                {canDelete && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Delete slide"
                    disabled={isPending}
                    onClick={() => handleDelete(slide)}
                  >
                    <Trash2Icon />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit slide" : "Add slide"}</DialogTitle>
            <DialogDescription>
              Configure the title, image and call-to-action for this carousel slide.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" accept="image/*" disabled={uploading} onChange={handleUpload} />
              {form.imageUrl ? (
                <div className="relative mt-2 w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="" className="h-32 w-full rounded-none object-cover" />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No image selected.</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ctaText">Button text</Label>
                <Input id="ctaText" value={form.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaUrl">Button link</Label>
                <Input id="ctaUrl" value={form.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" type="number" min="0" required value={form.position} onChange={(e) => set("position", e.target.value)} />
              </div>
              <div className="flex items-end">
                <Label className="flex items-center gap-2">
                  <Checkbox checked={form.isActive} onCheckedChange={(checked) => set("isActive", checked === true)} />
                  Active
                </Label>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Start date</Label>
                <Input id="startsAt" type="date" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endsAt">End date</Label>
                <Input id="endsAt" type="date" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || uploading}>
                {isPending ? "Saving..." : "Save slide"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}