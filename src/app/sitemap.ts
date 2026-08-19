import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/manga`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/light-novels`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/merchandise`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/search`, changeFrequency: "weekly", priority: 0.5 },
    ...products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}