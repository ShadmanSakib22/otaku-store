import { Meilisearch } from "meilisearch";

const host = process.env.MEILISEARCH_HOST ?? "http://localhost:7700";

export const searchClient = new Meilisearch({
  host,
  apiKey: process.env.MEILISEARCH_ADMIN_KEY,
});