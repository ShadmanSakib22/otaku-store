import { prisma } from "@/lib/db/client";
import { searchClient } from "@/lib/search/client";
import { SEARCH_INDEX } from "@/lib/constants";
import { buildProductDocument } from "@/lib/search/documents";

const index = () => searchClient.index(SEARCH_INDEX);

export async function ensureIndex() {
  await index().updateSettings({
    filterableAttributes: [
      "type", "category", "genres", "authors", "publisher", "price", "stockStatus",
    ],
    sortableAttributes: ["price", "lifetimeSales", "createdAt"],
  });
}

async function safe(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (error) {
    console.error("Meilisearch sync failed:", error);
  }
}

export function indexProduct(productId: string) {
  return safe(async () => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        publisher: true,
        authors: { include: { author: true } },
        genres: { include: { genre: true } },
        images: { orderBy: { position: "asc" } },
        variants: { include: { inventory: true } },
      },
    });
    if (product) await index().addDocuments([buildProductDocument(product)]);
  });
}

export function deleteProductFromIndex(productId: string) {
  return safe(() => index().deleteDocument(productId));
}

export async function rebuildIndex() {
  await ensureIndex();
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: {
      category: true,
      publisher: true,
      authors: { include: { author: true } },
      genres: { include: { genre: true } },
      images: { orderBy: { position: "asc" } },
      variants: { include: { inventory: true } },
    },
  });
  await index().addDocuments(products.map(buildProductDocument));
}