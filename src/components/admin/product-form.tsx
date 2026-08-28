"use client";

import { useState, useTransition, useRef } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveProductAction, uploadImageAction } from "@/lib/actions/product-actions";
import { Trash2 } from "lucide-react";

export interface ProductFormOptions {
  categories: { id: string; name: string }[];
  publishers: { id: string; name: string }[];
  genres: { id: string; name: string }[];
  authors: { id: string; name: string }[];
}

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  type: "MANGA" | "LIGHT_NOVEL" | "MERCH";
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  summary?: string;
  description: string;
  categoryId: string;
  publisherId?: string;
  releaseDate?: string;
  genres: string[];
  authors: string[];
  imageUrls: string[];
  variants: VariantRow[];
  volume?: number;
  isbn?: string;
  language?: string;
  pageCount?: number;
}

interface VariantRow {
  id?: string;
  name: string;
  sku: string;
  price: string;
  size: string;
  color: string;
  stock: string;
  lowStockAt: string;
}

const emptyVariant = (): VariantRow => ({
  name: "",
  sku: "",
  price: "",
  size: "",
  color: "",
  stock: "0",
  lowStockAt: "5",
});

function emptyForm(): ProductFormValues {
  return {
    name: "",
    slug: "",
    type: "MANGA",
    status: "DRAFT",
    summary: "",
    description: "",
    categoryId: "",
    publisherId: "",
    releaseDate: "",
    genres: [],
    authors: [],
    imageUrls: [],
    variants: [emptyVariant()],
    volume: undefined,
    isbn: "",
    language: "Japanese",
    pageCount: undefined,
  };
}

function fromInitial(initial?: ProductFormValues | null): ProductFormValues {
  if (!initial) return emptyForm();
  return {
    ...emptyForm(),
    ...initial,
    variants: initial.variants?.length
      ? initial.variants.map((v) => ({
          id: v.id,
          name: v.name ?? "",
          sku: v.sku ?? "",
          price: v.price != null ? String(v.price) : "",
          size: v.size ?? "",
          color: v.color ?? "",
          stock: v.stock != null ? String(v.stock) : "0",
          lowStockAt: v.lowStockAt != null ? String(v.lowStockAt) : "5",
        }))
      : [emptyVariant()],
  };
}

export function ProductForm({ categories, publishers, genres, authors, initial }: ProductFormOptions & { initial?: ProductFormValues | null }) {
  const [form, setForm] = useState<ProductFormValues>(() => fromInitial(initial) as ProductFormValues);
  const initialImageUrlsRef = useRef<string[]>(initial?.imageUrls ?? []);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const set = (key: keyof ProductFormValues, value: string | number | readonly string[] | undefined) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setVariant = (index: number, patch: Partial<VariantRow>) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  };

  const addVariant = () => {
    setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  };

  const removeVariant = (index: number) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.length > 1 ? f.variants.filter((_, i) => i !== index) : f.variants,
    }));
  };

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadImageAction(fd);
    setUploading(false);
    const upload = res as { url?: string; error?: string };
    if (upload.url) {
      set("imageUrls", [...form.imageUrls, upload.url]);
    } else {
      setError(upload.error ?? "Upload failed");
    }
  }

  const removeImage = (url: string) => {
    set("imageUrls", form.imageUrls.filter((u) => u !== url));
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const finalVariants = form.variants.filter(
      (v) => v.name.trim() && v.sku.trim() && v.price !== "" && Number(v.price) > 0
    );
    if (finalVariants.length === 0) {
      setError("Add at least one complete variant");
      return;
    }
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("slug", form.slug);
    fd.append("type", form.type);
    fd.append("status", form.status);
    fd.append("summary", form.summary ?? "");
    fd.append("description", form.description);
    fd.append("categoryId", form.categoryId);
    fd.append("publisherId", form.publisherId ?? "");
    fd.append("releaseDate", form.releaseDate ?? "");
    fd.append("genres", JSON.stringify(form.genres));
    fd.append("authors", JSON.stringify(form.authors));
    fd.append("imageUrls", JSON.stringify(form.imageUrls));
    fd.append("initialImageUrls", JSON.stringify(initialImageUrlsRef.current));
    fd.append("variants", JSON.stringify(finalVariants));
    if (form.id) fd.append("id", form.id);
    if (form.volume != null) fd.append("volume", String(form.volume));
    fd.append("isbn", form.isbn ?? "");
    fd.append("language", form.language ?? "Japanese");
    if (form.pageCount != null) fd.append("pageCount", String(form.pageCount));

    startTransition(async () => {
      const res = await saveProductAction(fd);
      if ("ok" in res) {
        redirect("/admin/products");
      } else {
        setError(res.error ?? "Failed to save product");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
          <CardDescription>Name, slug, type and category.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(value) => set("type", value as ProductFormValues["type"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANGA">Manga</SelectItem>
                  <SelectItem value="LIGHT_NOVEL">Light Novel</SelectItem>
                  <SelectItem value="MERCH">Merch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => set("status", value as ProductFormValues["status"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(value) => set("categoryId", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Publisher</Label>
              <Select value={form.publisherId ?? ""} onValueChange={(value) => set("publisherId", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select publisher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {publishers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Input id="summary" value={form.summary ?? ""} onChange={(e) => set("summary", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" required value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="releaseDate">Release date</Label>
            <Input id="releaseDate" type="date" value={form.releaseDate ?? ""} onChange={(e) => set("releaseDate", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Genres &amp; authors</CardTitle>
          <CardDescription>Select genres and authors for this product.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label>Genres</Label>
            <div className="space-y-2">
              {genres.map((g) => (
                <Label key={g.id} className="flex items-center gap-2 font-normal">
                  <Checkbox checked={form.genres.includes(g.id)} onCheckedChange={() => set("genres", toggleId(form.genres, g.id))} />
                  {g.name}
                </Label>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>Authors</Label>
            <div className="space-y-2">
              {authors.map((a) => (
                <Label key={a.id} className="flex items-center gap-2 font-normal">
                  <Checkbox checked={form.authors.includes(a.id)} onCheckedChange={() => set("authors", toggleId(form.authors, a.id))} />
                  {a.name}
                </Label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload product images. Each upload is stored immediately.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Upload image</Label>
            <Input id="image" type="file" accept="image/*" disabled={uploading} onChange={handleUpload} />
          </div>
          <div className="flex flex-wrap gap-3">
            {form.imageUrls.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-24 w-24 rounded-lg object-cover" />
                <Button type="button" variant="destructive" size="xs" className="absolute -top-2 -right-2" onClick={() => removeImage(url)}>
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>SKU, price and inventory for each variant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.variants.map((variant, index) => (
            <div key={index} className="space-y-3 rounded-lg bg-muted/40 p-3">
              <div className="flex items-center justify-between">
                <Label>Variant {index + 1}</Label>
                <Button type="button" variant="ghost" size="xs" onClick={() => removeVariant(index)} disabled={form.variants.length <= 1}>
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input value={variant.name} onChange={(e) => setVariant(index, { name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">SKU</Label>
                  <Input value={variant.sku} onChange={(e) => setVariant(index, { sku: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price</Label>
                  <Input type="number" min="1" step="1" value={variant.price} onChange={(e) => setVariant(index, { price: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Size</Label>
                  <Input value={variant.size} onChange={(e) => setVariant(index, { size: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <Input value={variant.color} onChange={(e) => setVariant(index, { color: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Stock</Label>
                  <Input type="number" min="0" value={variant.stock} onChange={(e) => setVariant(index, { stock: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Low stock at</Label>
                  <Input type="number" min="0" value={variant.lowStockAt} onChange={(e) => setVariant(index, { lowStockAt: e.target.value })} />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            Add variant
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Book metadata</CardTitle>
          <CardDescription>Optional details for manga and light novels.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="volume">Volume</Label>
            <Input id="volume" type="number" min="1" value={form.volume ?? ""} onChange={(e) => set("volume", e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input id="isbn" value={form.isbn ?? ""} onChange={(e) => set("isbn", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input id="language" value={form.language ?? ""} onChange={(e) => set("language", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageCount">Page count</Label>
            <Input id="pageCount" type="number" min="1" value={form.pageCount ?? ""} onChange={(e) => set("pageCount", e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending || uploading}>
        {isPending ? "Saving..." : "Save product"}
      </Button>
    </form>
  );
}
