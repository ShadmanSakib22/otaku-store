# Search, Filtering & Pagination

## 1. Search Engine

The store uses Algolia for catalogue search.

PostgreSQL remains the source of truth.

```text
PostgreSQL
    ↓
Indexing
    ↓
Algolia
```

## 2. Search Features

The search system demonstrates:

- Full-text search
- Typo tolerance
- Filtering
- Sorting
- Facets
- Search pagination

## 3. Catalogue Scale

The system must not download the entire catalogue into the browser.

Example:

```text
10,000 products
      ↓
Search
      ↓
1,000 matches
      ↓
Filter
      ↓
250 matches
      ↓
Sort
      ↓
Page 3
      ↓
50 results
```

## 4. Search URL

Example:

```text
/manga?q=one-piece&genre=action&author=oda&price=500-2000&sort=price-asc&page=2
```

URL state makes results shareable and supports browser navigation.

## 5. Processing Order

Conceptually:

```text
Search
  ↓
Filter
  ↓
Sort
  ↓
Pagination
```

The search engine applies these before returning the page.

## 6. Manga Filters

Active filters:

```text
Genre
Author
Publisher
Language
Price
```

## 7. Light Novel Filters

Active filters:

```text
Genre
Author
Publisher
Language
Price
```

## 8. Merchandise Filters

Active filters:

```text
Category
Size
Color
Price
```

## 8a. Search Page Filters

The search page exposes all filters across product types:

```text
Genre, Author, Publisher, Language, Category, Size, Color, Price
```

Empty filter groups are hidden automatically.

## 9. Pagination

Use server/search-engine pagination.

Suggested page sizes:

```text
24
48
```

The response should provide:

```text
results
currentPage
pageSize
totalHits
totalPages
```

## 10. Filter Changes

Changing a filter resets pagination:

```text
Current:
page=4

New filter:
genre=Action

New:
genre=Action&page=1
```

## 11. Sorting

Potential storefront sorting:

```text
Relevance
Newest
Price: Low → High
Price: High → Low
Best Selling
```

Best Selling uses lifetime sales.

## 12. Search Index Document

Example:

```json
{
  "objectID": "product-id",
  "id": "product-id",
  "name": "One Piece Vol. 1",
  "slug": "one-piece-volume-1",
  "type": "MANGA",
  "category": "Manga",
  "authors": ["Eiichiro Oda"],
  "authorsSlugs": ["eiichiro-oda"],
  "publisher": "Shueisha",
  "publisherSlug": "shueisha",
  "genres": ["Action", "Adventure"],
  "genresSlugs": ["action", "adventure"],
  "price": 12.99,
  "lifetimeSales": 1248,
  "stockStatus": "IN_STOCK"
}
```

## 13. Search Index Synchronization

```text
Admin mutation
   ↓
PostgreSQL
   ↓
Update/reindex Algolia
```

Search indexing happens server-side.

## 14. Search vs TanStack Table

TanStack Table is for admin data presentation, not as the storefront search engine.

```text
Admin UI
   ↓
Server query
   ↓
Current page
   ↓
TanStack Table
```

## 15. Product Details

Product detail pages use PostgreSQL/Prisma for authoritative data.

```text
/product/[slug]
       ↓
Prisma
       ↓
Product
├── Images
├── Variants
├── Author
├── Publisher
├── Genres
├── Book metadata
└── Inventory
```

Algolia is for discovery, not checkout or authoritative product state.
