"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db/client";
import { requireAdmin, requireRole } from "@/lib/auth/guard";
import { productFormSchema } from "@/lib/validation/admin";
import { indexProduct, deleteProductFromIndex } from "@/lib/search/sync";
import { Prisma, type ProductType, type ProductStatus } from "@/generated/prisma/client";

export async function uploadImageAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file" };

  const blob = await put(`products/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
  });
  return { url: blob.url };
}

export async function deleteProductAction(id: string) {
  await requireRole("ADMIN");
  await prisma.product.delete({ where: { id } });
  await deleteProductFromIndex(id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const raw: Record<string, unknown> = Object.fromEntries(formData);
  for (const key of ["genres", "authors", "imageUrls", "variants"] as const) {
    const value = raw[key];
    if (typeof value === "string") {
      try {
        raw[key] = JSON.parse(value) as unknown;
      } catch {
        return { error: "Invalid product data" };
      }
    }
  }
  const parsed = productFormSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Invalid product data", issues: parsed.error.flatten() };
  }

  const data = parsed.data;
  let id = data.id;

  const base: Prisma.ProductUncheckedCreateInput = {
    name: data.name,
    slug: data.slug,
    type: data.type as ProductType,
    status: data.status as ProductStatus,
    summary: data.summary || null,
    description: data.description,
    categoryId: data.categoryId,
    publisherId: data.publisherId || null,
    releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
    price: data.variants[0]?.price ?? 0,
  };

  const genres = data.genres.map((genreId) => ({ genreId }));
  const authors = data.authors.map((authorId) => ({ authorId }));

  if (id) {
    await prisma.product.update({
      where: { id },
      data: {
        ...base,
        genres: { deleteMany: {}, create: genres },
        authors: { deleteMany: {}, create: authors },
        bookMetadata: data.volume
          ? {
              upsert: {
                create: { volume: data.volume, isbn: data.isbn || null, language: data.language, pageCount: data.pageCount || null },
                update: { volume: data.volume, isbn: data.isbn || null, language: data.language, pageCount: data.pageCount || null },
              },
            }
          : undefined,
      },
    });
  } else {
    const product = await prisma.product.create({
      data: {
        ...base,
        genres: { create: genres },
        authors: { create: authors },
        bookMetadata: data.volume
          ? { create: { volume: data.volume, isbn: data.isbn || null, language: data.language, pageCount: data.pageCount || null } }
          : undefined,
      },
    });
    id = product.id;
  }

  await prisma.productImage.deleteMany({ where: { productId: id } });
  if (data.imageUrls.length) {
    await prisma.productImage.createMany({
      data: data.imageUrls.map((url, index) => ({ productId: id, url, position: index })),
    });
  }

  const variantIds = data.variants.map((v) => v.id).filter((v): v is string => Boolean(v));
  try {
    await prisma.productVariant.deleteMany({
      where: {
        productId: id,
        NOT: { id: { in: variantIds } },
      } as Prisma.ProductVariantWhereInput,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { error: "Cannot remove a variant that has been ordered" };
    }
    throw error;
  }
  try {
    for (const variant of data.variants) {
      const payload: Prisma.ProductVariantUpdateInput = {
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        size: variant.size || null,
        color: variant.color || null,
        inventory: {
          upsert: {
            create: { quantity: variant.stock, lowStockAt: variant.lowStockAt },
            update: { quantity: variant.stock, lowStockAt: variant.lowStockAt },
          },
        },
      };
      if (variant.id) {
        await prisma.productVariant.update({ where: { id: variant.id }, data: payload });
      } else {
        const created = await prisma.productVariant.create({
          data: {
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            size: variant.size || null,
            color: variant.color || null,
            productId: id,
          },
        });
        await prisma.inventory.create({
          data: { variantId: created.id, quantity: variant.stock, lowStockAt: variant.lowStockAt },
        });
      }
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Duplicate SKU" };
    }
    throw error;
  }

  await indexProduct(id);
  revalidatePath(`/product/${data.slug}`);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, id };
}
