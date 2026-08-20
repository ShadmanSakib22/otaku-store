import { prisma } from "@/lib/db/client";
import { adminClient } from "@/lib/search/client";
import { SEARCH_INDEX, SEARCH_REPLICAS } from "@/lib/constants";
import { buildProductDocument } from "@/lib/search/documents";

const DEFAULT_RANKING = [
  "typo",
  "geo",
  "words",
  "filters",
  "proximity",
  "attribute",
  "exact",
  "custom",
];

const REPLICA_RANKINGS: { indexName: string; ranking: string[] }[] = [
  { indexName: SEARCH_REPLICAS.priceAsc, ranking: ["asc(price)", ...DEFAULT_RANKING] },
  { indexName: SEARCH_REPLICAS.priceDesc, ranking: ["desc(price)", ...DEFAULT_RANKING] },
  { indexName: SEARCH_REPLICAS.newest, ranking: ["desc(createdAt)", ...DEFAULT_RANKING] },
  { indexName: SEARCH_REPLICAS.bestSelling, ranking: ["desc(lifetimeSales)", ...DEFAULT_RANKING] },
];

export async function ensureIndex() {
  await adminClient.setSettings({
    indexName: SEARCH_INDEX,
    indexSettings: {
      searchableAttributes: [
        "name",
        "summary",
        "description",
        "genres",
        "authors",
        "publisher",
      ],
      attributesForFaceting: [
        "type",
        "category",
        "genresSlugs",
        "authorsSlugs",
        "publisherSlug",
        "price",
        "stockStatus",
      ],
      replicas: REPLICA_RANKINGS.map((r) => `virtual(${r.indexName})`),
    },
  });
  for (const replica of REPLICA_RANKINGS) {
    await adminClient.setSettings({
      indexName: replica.indexName,
      indexSettings: { ranking: replica.ranking },
    });
  }
}

async function safe(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (error) {
    console.error("Algolia sync failed:", error);
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
    if (product) {
      await adminClient.saveObject({
        indexName: SEARCH_INDEX,
        body: buildProductDocument(product),
      });
    }
  });
}

export function deleteProductFromIndex(productId: string) {
  return safe(() =>
    adminClient.deleteObject({ indexName: SEARCH_INDEX, objectID: productId })
  );
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
  await adminClient.replaceAllObjects({
    indexName: SEARCH_INDEX,
    objects: products.map((p) => ({ ...buildProductDocument(p) })),
  });
}