# Ecommerce-Otaku

A Japanese pop-culture e-commerce store selling manga, light novels, and merchandise — with guest checkout, search, and a protected admin CMS.

## Features

- **Catalogue** — manga, light novels, and merchandise with genre filtering, price sorting, and pagination.
- **Guest checkout** — no accounts required; pay by **cash on pickup** or **card via Stripe** (webhook-finalized orders).
- **Order confirmation** — confirmation page per order plus a transactional email via Resend.
- **Search** — Algolia-powered full-text search with filters and sorting.
- **Admin CMS** — protected dashboard for products, inventory, orders, and homepage hero slides, with ADMIN / DEMO_ADMIN roles (jose-signed sessions).

## Tech Stack

- **Next.js 16** (App Router, React Server Components, Turbopack)
- **Prisma 7 + Neon** PostgreSQL
- **TypeScript**
- **Tailwind CSS 4 + shadcn/ui**
- **Zustand** (cart state), **TanStack Table** (admin tables)
- **jose** (admin sessions)
- **Stripe** (payments), **Resend** (transactional email)
- **Algolia** (search), **Vercel Blob** (image uploads)

## Getting Started

### Prerequisites

- Node.js 20+ and **pnpm**
- A PostgreSQL database (this project uses [Neon](https://neon.tech))
- An [Algolia](https://www.algolia.com) application (API keys from Settings → API Keys)
- Stripe account + [Stripe CLI](https://docs.stripe.com/stripe-cli) (for webhook testing)
- Resend account with a verified sending domain
- Vercel Blob store (for image uploads in the admin)

### Install

```bash
pnpm install
```

### Environment variables

Copy `example.env` to `.env` and fill in real values:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string (app runtime) |
| `DIRECT_URL` | Neon direct connection string (Prisma CLI: migrations, seeding) |
| `AUTH_SECRET` | Secret used to sign admin session tokens (generate with `openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-only) — placeholder |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret — placeholder |
| `ALGOLIA_APP_ID` | Algolia application ID (Settings → API Keys) |
| `ALGOLIA_ADMIN_API_KEY` | Algolia admin key (server-only, index writes) |
| `ALGOLIA_SEARCH_API_KEY` | Algolia search-only key (storefront queries) |
| `RESEND_API_KEY` | Resend API key for transactional email — placeholder |
| `EMAIL_FROM` | From address for order confirmation emails |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token — placeholder |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (Stripe return URLs, absolute email links) |

> `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, and `BLOB_READ_WRITE_TOKEN` ship as placeholders — the store still runs with them blank until you configure the corresponding service.

### Database, seed, and dev server

```bash
pnpm prisma:migrate   # apply migrations (prisma migrate dev)
pnpm prisma:seed      # reset + populate demo catalogue data
pnpm dev              # start http://localhost:3000
```

The seed script wipes the database, then creates two admin users, three categories, fourteen genres, demo authors/publishers, a manga/light-novel/merch catalogue (with variants and inventory), and four homepage hero slides.

## Setup Guides

For step-by-step instructions on creating accounts, obtaining every key, and verifying each service, see [`docs/setup.md`](docs/setup.md).

### Algolia

Create an Algolia application and copy the app ID plus a search-only API key from **Settings → API Keys** into `ALGOLIA_APP_ID` / `ALGOLIA_SEARCH_API_KEY`, and the admin key into `ALGOLIA_ADMIN_API_KEY` (server-only).

Populate the index (builds documents from active products in the DB):

```bash
pnpm exec tsx -e "import('@/lib/search/sync').then((m) => m.rebuildIndex())"
```

Search is served at `/search` (e.g. `/search?q=one-piece`).

### Stripe

Set your test keys in `.env`. In the Stripe Dashboard, register the webhook endpoint `https://<your-host>/api/webhooks/stripe` with the `checkout.session.completed` event. For local development:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

### Resend

Create an API key and add it as `RESEND_API_KEY`. Verify the domain you want to send from and set it as `EMAIL_FROM`.

### Vercel Blob

Create a Blob store and paste its read/write token into `BLOB_READ_WRITE_TOKEN` (used for product and hero-slide image uploads in the admin).

### Admin users

Log in at `/admin/login`. The seed creates:

- `admin@example.com` / `Admin123!` (full `ADMIN` role)
- `demo@example.com` / `Demo123!` (`DEMO_ADMIN` role)

To create another admin, insert an `adminUser` row with a bcryptjs-hashed password, e.g.:

```bash
pnpm exec tsx -e "const { hash } = require('bcryptjs'); hash('YourPass123!', 12).then(console.log)"
```

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `pnpm dev` | Start the development server |
| `build` | `pnpm build` | Production build (Turbopack) |
| `start` | `pnpm start` | Start the production server |
| `lint` | `pnpm lint` | ESLint over the project |
| `test` | `pnpm test` | Run the Vitest test suite once |
| `test:watch` | `pnpm test:watch` | Run tests in watch mode |
| `prisma:generate` | `pnpm prisma generate` | Generate the Prisma client |
| `prisma:migrate` | `pnpm prisma migrate dev` | Apply database migrations |
| `prisma:seed` | `pnpm prisma db seed` | Reset and seed demo data |

## Architecture

The storefront is a Next.js 16 App Router app under `src/app`: catalogue pages (`/manga`, `/light-novels`, `/merchandise`, `/product/[slug]`), guest checkout (`/cart`, `/checkout`, `/order/[orderNumber]`), search (`/search`), and a protected admin under `/admin` with route-level session guards. Server actions and API routes handle checkout, Stripe payments (`/api/checkout`, `/api/payment-session`, `/api/webhooks/stripe`), and search indexing. Prisma talks to Neon PostgreSQL via the `@prisma/adapter-neon` driver adapter.

For details, see the docs:

- [`docs/architecture.md`](docs/architecture.md) — project structure and overview
- [`docs/database.md`](docs/database.md) — data model and schema rules
- [`docs/authentication.md`](docs/authentication.md) — admin sessions, roles, and access control
- [`docs/payments.md`](docs/payments.md) — checkout flows and payment handling
- [`docs/search.md`](docs/search.md) — Algolia indexing, filtering, and pagination
- [`docs/decisions.md`](docs/decisions.md) — architectural decision records (ADRs)

## Security Notes

- `AUTH_SECRET` must be a strong random value (e.g. `openssl rand -base64 32`).
- Never commit real secrets. Commit only `example.env`; keep `.env` out of version control.