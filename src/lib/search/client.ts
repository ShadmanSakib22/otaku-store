import { algoliasearch } from "algoliasearch";

const appId = process.env.ALGOLIA_APP_ID ?? "";
const adminKey = process.env.ALGOLIA_ADMIN_API_KEY ?? "";
const searchKey = process.env.ALGOLIA_SEARCH_API_KEY ?? "";

export const adminClient = algoliasearch(appId, adminKey);
export const searchClient = algoliasearch(appId, searchKey);