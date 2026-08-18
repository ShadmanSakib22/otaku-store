# Architectural Decisions

## ADR-001 — Next.js Full-Stack

Use Next.js for storefront and server functionality.

Reason: demonstrate modern full-stack React, Server Components, SSR, server-side data access, and SEO-friendly catalogue pages.

## ADR-002 — Guest Checkout

Do not implement customer registration/login.

Reason: the project focuses on Browse → Cart → Checkout → Order and avoids unnecessary account-management complexity.

## ADR-003 — Zustand Persist for Cart

Use Zustand Persist + localStorage.

Persist only:

```text
variantId
quantity
```

Prices and inventory are always resolved server-side.

## ADR-004 — Persist Checkout Information Locally

Persist non-sensitive name, email, phone, and address information to improve repeat checkout.

Never persist payment credentials.

## ADR-005 — No Reviews or Ratings

Do not implement reviews or ratings in the current scope.

Reason: they are not required for the core commerce demonstration and would add additional account/verification/moderation complexity.

## ADR-006 — Volumes as Separate Products

Each Manga and Light Novel volume is a separate Product.

Reason: each volume has independent price, SKU, inventory, sales count, search result, and URL.

## ADR-007 — ProductVariant for Merchandise

Use ProductVariant for merchandise variations such as size and color.

Reason: cart and inventory can use one consistent sellable-unit model.

## ADR-008 — PostgreSQL as Source of Truth

Use Neon PostgreSQL as authoritative application storage.

Reason: commerce data benefits from relational integrity and transactions.

## ADR-009 — Prisma ORM

Use Prisma for type-safe PostgreSQL access, schema management, migrations, and TypeScript integration.

## ADR-010 — Meilisearch

Use Meilisearch as a dedicated catalogue search index.

Reason: full-text search, typo tolerance, facets, ranking, filtering, and fast pagination.

## ADR-011 — Server-Side Pagination

Never load the entire catalogue into the browser.

Reason: the application should remain performant with 10,000+ products.

## ADR-012 — TanStack Table

Use TanStack Table for complex admin tables.

Reason: table state, columns, sorting, selection, and pagination UI are handled cleanly while large-data querying remains server-side.

## ADR-013 — Vercel Blob

Use Vercel Blob for product and homepage images.

Reason: it fits the Next.js/Vercel architecture and the project only needs object storage for catalogue/CMS assets.

## ADR-014 — Stripe Hosted Checkout

Use Stripe Checkout rather than implementing a custom card form.

Reason: reduces payment handling complexity and keeps sensitive payment data outside the application.

## ADR-015 — Stripe Webhooks Are Authoritative

Use verified Stripe webhooks as payment confirmation.

Reason: a success redirect alone does not prove payment completion.

## ADR-016 — Resend

Use Resend for transactional order email.

## ADR-017 — No Stripe Checkout Link in Confirmation Email

Do not send the temporary Checkout Session URL in the initial implementation.

Reason: the permanent resource is the completed order, not the temporary payment session.

## ADR-018 — Separate Admin Authentication

Customers remain anonymous while administrators authenticate.

Reason: the store does not need customer accounts, but admin mutations require authorization.

## ADR-019 — Restricted Demo Admin

Use a restricted demo-admin role for public portfolio demonstrations if shared access is provided.

Reason: unrestricted credentials could allow visitors to corrupt shared demo data.

## ADR-020 — Lifetime Sales

Store lifetime sales quantity on Product.

Reason: it powers Top Seller sections for Manga, Light Novels, and Merchandise.

## ADR-021 — Homepage CMS

Store hero slides in the database and manage them through the admin panel.

Reason: demonstrates a lightweight CMS without introducing a separate CMS product.

## ADR-022 — No Database Cart

Do not store guest carts in PostgreSQL.

Reason: customers have no accounts and local persisted state is sufficient until checkout.

## ADR-023 — Server Is Authoritative

Never trust client-provided price, total, inventory, payment status, order status, or role.

Reason: client state can be modified.

## ADR-024 — Deliberately Limited Scope

Explicitly excluded:

```text
Customer accounts
Reviews
Ratings
Wishlist
Coupons
Loyalty system
Subscriptions
Marketplace sellers
Vendor management
Digital products
Recommendations
AI features
```

Reason: this is a portfolio demonstration, not an attempt to clone Amazon.
