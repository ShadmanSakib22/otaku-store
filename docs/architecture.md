# Architecture

## 1. Project Overview

A portfolio-grade Japanese pop-culture e-commerce store selling Manga, Light Novels, and Merchandise.

The application is a single-store commerce platform, not a marketplace or SaaS product.

Primary goals:

- Demonstrate modern Next.js full-stack development.
- Demonstrate SSR and React Server Components.
- Demonstrate server-side search, filtering, sorting, and pagination.
- Demonstrate guest checkout.
- Demonstrate Stripe Checkout and webhooks.
- Demonstrate a protected admin/CMS interface.
- Keep the codebase visually polished, understandable, and open source.

## 2. High-Level Architecture

```text
                         VERCEL
                           |
                        Next.js
                           |
        +------------------+------------------+
        |                                     |
   Storefront                              Admin
        |                                     |
        |                               Admin Auth / RBAC
        |
   +----+-----------------------------+
   |          |          |            |
 Neon DB    Algolia    Blob        Resend
Postgres      Search    Images       Email
   |
 Prisma
   |
 Orders / Products / Inventory
   |
 Stripe
   |
 Payments / Webhooks
```

PostgreSQL is the source of truth. Algolia is a derived search index. Vercel Blob stores images. Stripe handles online payments. Resend handles transactional email.

## 3. Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand + Zustand Persist
- PostgreSQL / Neon
- Prisma ORM
- TanStack Query where useful
- TanStack Table for complex admin tables
- Algolia
- Stripe Checkout + webhooks
- Resend
- Vercel Blob
- Vercel deployment

## 4. Rendering Strategy

Prefer React Server Components and server-side data fetching for SEO-critical and data-heavy storefront content.

Server-rendered areas:

- Homepage
- Category pages
- Product detail pages
- Search/filter result pages

Client Components are used where browser interactivity is required:

- Cart
- Add-to-cart interactions
- Checkout modal
- Image gallery controls
- Interactive filters
- Admin forms/tables

The goal is not to make every component a Server Component; it is to keep data-heavy work on the server and client interactivity on the client.

## 5. React Compiler

React Compiler is enabled.

Avoid manual `useMemo`, `useCallback`, and `memo` by default. Use them only when there is a demonstrated need.

## 6. Guest Customer Architecture

Customers do not have accounts or login.

```text
Browse
  ↓
Product
  ↓
Cart
  ↓
Guest Checkout
  ↓
Cash Pickup OR Stripe
  ↓
Order
```

There are no customer profiles, saved addresses, wishlists, passwords, or customer sessions.

Customer information is stored as part of the order.

## 7. Cart Architecture

The cart uses Zustand with persist middleware and localStorage.

Persist only:

```text
variantId
quantity
```

Do not persist the authoritative product object, price, inventory, or payment information.

At checkout, the server retrieves current product/variant information from PostgreSQL and validates:

- Product exists
- Variant exists
- Product is active
- Variant is purchasable
- Inventory is sufficient
- Current price

The client is never trusted for price or inventory.

## 8. Checkout Architecture

```text
Step 1
Terms / Disclaimer
        ↓
Step 2
Payment Method
        ↓
   +----+----+
   |         |
 Cash      Stripe
   |         |
Step 3     Step 3
Pickup     Customer info
details    + address
   |         |
   |      Stripe Checkout
   |         |
   |      Webhook
   |         |
   +----+----+
        |
      Order
```

Cash orders are Tokyo pickup only.

Stripe orders use Stripe-hosted Checkout.

Stripe webhooks are the authoritative payment confirmation mechanism.

## 9. Order Architecture

For Stripe:

```text
Pending Order
     ↓
Stripe Checkout
     ↓
Stripe Webhook
     ↓
Payment confirmed
     ↓
Order finalized
```

The return URL is not treated as proof of payment.

After confirmed payment:

```text
Stripe Webhook
    ↓
Update Payment
    ↓
Update Order
    ↓
Update inventory
    ↓
Update lifetime sales
    ↓
Send confirmation email
```

## 10. Lifetime Sales

Each product has a lifetime sales quantity representing the number of units successfully sold through this store.

For variants, sales are aggregated at the Product level.

Top Seller sections use this value.

## 11. Search Architecture

```text
PostgreSQL
     |
     | indexing
     v
Algolia
```

Search requests conceptually follow:

```text
Search
  ↓
Filter
  ↓
Sort
  ↓
Pagination
  ↓
Current page
```

The browser receives only the requested page.

## 12. Image Storage

Product and CMS images are stored in Vercel Blob.

```text
Admin
  ↓
Upload
  ↓
Vercel Blob
  ↓
Blob URL
  ↓
PostgreSQL reference
```

PostgreSQL stores URLs/references, not image binaries.

Storage-specific code should be isolated behind a small abstraction so the provider can be replaced later.

## 13. Email

Resend handles transactional emails.

Stripe confirmation email:

- Order ID
- Products
- Quantities
- Prices
- Total
- Shipping information
- Expected delivery information
- Support contact

Cash pickup email:

- Order ID
- Pickup location
- Products
- Pickup instructions
- Support contact

Cash email is optional if the customer does not provide an email.

## 14. Admin Architecture

The admin is a protected area of the same Next.js application.

```text
/admin
/admin/dashboard
/admin/products
/admin/inventory
/admin/orders
/admin/homepage
```

Responsibilities:

- Dashboard
- Product management
- Inventory management
- Order management
- Homepage CMS
- Hero slide management

## 15. Admin Tables

TanStack Table handles interactive table presentation.

It is not responsible for loading thousands of database records.

```text
Admin UI
   ↓
URL/request state
   ↓
Server
   ↓
Database query
   ↓
Current page
   ↓
TanStack Table
```

## 16. URL State

Catalogue search/filter state should be represented in the URL.

Example:

```text
/manga?q=one-piece&genre=action&author=oda&sort=price-asc&page=2
```

When filters change, reset pagination to page 1.

## 17. External Services

```text
Neon
└── PostgreSQL

Vercel Blob
└── Product / CMS images

Algolia
└── Catalogue search

Stripe
└── Online payments

Resend
└── Transactional email

Vercel
└── Application hosting
```

## 18. Security Principles

The browser is never trusted for authoritative commerce information.

Server-side validation is required for:

- Prices
- Inventory
- Order totals
- Payment state
- Admin authorization
- Terms acceptance
- Stripe webhooks

Never accept client-provided price, total, payment status, inventory, or admin role as authoritative.

## 19. Project Structure

```text
src/
├── app/
│   ├── (store)/
│   ├── admin/
│   ├── api/
│   └── ...
├── components/
│   ├── ui/
│   ├── store/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   └── admin/
├── lib/
│   ├── db/
│   ├── auth/
│   ├── stripe/
│   ├── search/
│   ├── storage/
│   ├── email/
│   └── validation/
├── stores/
│   ├── cart-store.ts
│   └── checkout-store.ts
└── types/

prisma/
├── schema.prisma
└── seed.ts
```
