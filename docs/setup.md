# Environment & External Services Setup

How to obtain every environment variable and configure every external service the store uses.

The app reads its configuration from `.env` (copy from `example.env`). Never commit real secrets.

## 1. Environment Variable Reference

| Variable | Required | Used by | Where to get it |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `src/lib/db/client.ts` (app runtime) | Neon: pooled connection string |
| `DIRECT_URL` | Yes (CLI) | Prisma CLI (migrations, seeding) | Neon: direct connection string |
| `AUTH_SECRET` | Yes | `src/lib/auth/session.ts` (JWT signing) | Generate: `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Card checkout | `src/lib/stripe/client.ts` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Card checkout | `src/lib/stripe/webhook.ts` (signature verify) | Stripe Dashboard webhook, or `stripe listen` output |
| `ALGOLIA_APP_ID` | Search | `src/lib/search/client.ts` | Algolia Dashboard → Settings → API Keys |
| `ALGOLIA_ADMIN_API_KEY` | Search | `src/lib/search/sync.ts` (index writes) | Algolia API key with admin/write ACL (server-only) |
| `ALGOLIA_SEARCH_API_KEY` | Search | Server-side storefront queries | Algolia search-only key (ACL: `search`) |
| `RESEND_API_KEY` | Email | `src/lib/email/client.ts` | Resend Dashboard → API Keys |
| `EMAIL_FROM` | Email | `src/lib/email/client.ts` (sender address) | A verified domain in Resend |
| `BLOB_READ_WRITE_TOKEN` | Admin images | `src/lib/actions/product-actions.ts` (`@vercel/blob` `put()`) | Vercel Blob store settings |
| `NEXT_PUBLIC_APP_URL` | Yes | Stripe return URLs, absolute email links | Your app's public URL (`http://localhost:3000` locally) |

---

## 2. PostgreSQL (Neon)

The database. Prisma 7 talks to it through the `@prisma/adapter-neon` driver adapter (`src/lib/db/client.ts`), which requires `DATABASE_URL`. Migrations and seeding use `DIRECT_URL`.

### 2.1 Create a project

1. Create a free account at https://neon.tech.
2. **Create project** → choose a region near you → **Create**. A default database (`neondb`) is created.
3. From the project dashboard, go to **Connection Details** (top of the project page).

### 2.2 Obtain the two connection strings

Neon offers two connection string variants:

- **Pooled** — hostname contains `-pooler` (e.g. `ep-xyz-pooler.us-east-1.aws.neon.tech`). Use for `DATABASE_URL` (app runtime).
- **Direct** — hostname without `-pooler` (e.g. `ep-xyz.us-east-1.aws.neon.tech`). Use for `DIRECT_URL` (Prisma CLI).

Use the **SQL** / **Prisma** connection string tab. Copy the full `postgresql://user:password@host/db?sslmode=require` string (the app already works with the `sslmode=require` query parameter; the `channel_binding=require` flag in a fresh Neon string is also fine).

### 2.3 Set `.env`

```bash
DATABASE_URL="postgresql://user:password@ep-xyz-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 2.4 Verify

```bash
pnpm prisma:migrate   # prisma migrate dev — applies schema migrations
pnpm prisma:seed      # wipes + populates demo catalogue, admins, hero slides
```

`prisma:migrate` needs a running DB and a valid `DIRECT_URL`. `prisma:seed` uses `DATABASE_URL`. If either fails with a connection error, re-check the hostname (pooled vs direct) and that the password is URL-encoded.

---

## 3. Algolia (Search)

Full-text search engine. PostgreSQL stays the source of truth; Algolia holds an index built from active products. The client (`src/lib/search/client.ts`) uses `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_API_KEY`, and `ALGOLIA_SEARCH_API_KEY`.

### 3.1 Create an account and application

1. Create an account at https://www.algolia.com.
2. **Create an application** (e.g. `otaku-store`) — the free tier supports the demo catalogue easily.

### 3.2 Obtain the API keys

1. Go to **Settings → API Keys** in the dashboard.
2. Copy the **Application ID** into `ALGOLIA_APP_ID`.
3. Copy the **Admin API Key** into `ALGOLIA_ADMIN_API_KEY`. This key is used server-side only (index writes in `src/lib/search/sync.ts`). Never expose it to the browser.
4. Click **New API Key** and create a search-only key (ACL: `search`) for the `products` index. Put it in `ALGOLIA_SEARCH_API_KEY`.

### 3.3 Set `.env`

```bash
ALGOLIA_APP_ID="XXXXX"
ALGOLIA_ADMIN_API_KEY="xxxxx"
ALGOLIA_SEARCH_API_KEY="xxxxx"
```

### 3.4 Build the index

Documents are built from active products in PostgreSQL (`src/lib/search/documents.ts`) and pushed by `rebuildIndex` (`src/lib/search/sync.ts`). `ensureIndex` configures searchable attributes, filterable facets, and the virtual replicas used for sorting:

```bash
pnpm exec tsx -e "import('@/lib/search/sync').then((m) => m.rebuildIndex())"
```

### 3.5 Verify

1. In the Algolia dashboard, open the **Search** tab and confirm the `products` index has records (equal to the number of active products).
2. Visit `http://localhost:3000/search?q=one-piece`. If the search page works but returns nothing, the index is empty — re-run `rebuildIndex`.

---

## 4. Stripe (Payments)

Handles card payments via Checkout Sessions. Cash-on-pickup needs no Stripe keys. Key usage: `STRIPE_SECRET_KEY` (API calls), `STRIPE_WEBHOOK_SECRET` (webhook signature verification).

### 4.1 Create an account and get the secret key

1. Create an account at https://dashboard.stripe.com (or use the existing one).
2. Keep **Test mode** on (toggle in the dashboard header).
3. **Developers → API keys** → copy `Secret key` (starts with `sk_test_`) into `.env`:
   ```bash
   STRIPE_SECRET_KEY="sk_test_51..."
   ```

### 4.2 Set up the webhook (for local development)

The webhook at `/api/webhooks/stripe` (`src/app/api/webhooks/stripe/route.ts`) finalizes paid orders via the `checkout.session.completed` event.

**Option A — Stripe CLI (recommended for local dev):**

1. Install the CLI: https://docs.stripe.com/stripe-cli (Windows: `winget install Stripe.StripeCli`, or Scoop/Chocolatey).
2. Log in: `stripe login` (opens a browser to authorize the CLI).
3. Forward events to the app:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. The CLI prints a `whsec_...` signing secret. Copy it into `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```
5. Restart the dev server so it picks up the new env var.

**Option B — Dashboard webhook (for a deployed host):**

1. **Developers → Webhooks → Add endpoint** → URL `https://<your-host>/api/webhooks/stripe`.
2. Select the **`checkout.session.completed`** event (and `checkout.session.async_payment_succeeded` / `checkout.session.async_payment_failed` if you enable async payments).
3. After creating, reveal the **Signing secret** (`whsec_...`) and copy it into `STRIPE_WEBHOOK_SECRET`.

### 4.3 Verify

1. Restart the app, then place an order on the storefront and choose **card**.
2. You are redirected to a Stripe Checkout page (Test mode). Pay with the test card `4242 4242 4242 4242`, any future expiry, any CVC.
3. After payment, you land back on the order confirmation page, and the webhook marks the order paid. In `stripe listen` terminal you should see the forwarded `checkout.session.completed` event (a successful call returns 200; the route returns 500 on a missing payment record so Stripe retries).

Troubleshooting: **"Invalid signature" / 400 from the webhook** usually means `STRIPE_WEBHOOK_SECRET` doesn't match the CLI's current session secret — restart `stripe listen` and copy the new value. **Test mode** must be on for `sk_test_` keys to work.

---

## 5. Resend (Transactional Email)

Sends order-confirmation and cash-pickup emails (`src/lib/email/client.ts`, `send.ts`).

### 5.1 Create an account and API key

1. Create an account at https://resend.com.
2. **API Keys → Create API key** → name it (e.g. `otaku-store`) → copy the key (`re_...`). Resend only shows it once.
3. Add to `.env`:
   ```bash
   RESEND_API_KEY="re_..."
   ```

### 5.2 Verify a sending domain

Emails must be sent from a domain you own and verify:

1. **Domains → Add domain** → follow the DNS instructions (add the `MX` / `SPF` / `DKIM` records at your DNS provider).
2. Wait for the domain status to become **Verified**.
3. Set `EMAIL_FROM` to an address on that domain:
   ```bash
   EMAIL_FROM="Otaku Store <no-reply@yourdomain.com>"
   ```
   (The store defaults to `no-reply@example.com` if unset, which Resend will reject for sending.)

### 5.3 Verify

Place a cash or card order. The confirmation email is sent to the order's email address. Check the inbox (and spam). You can also send a test from the Resend dashboard: **Overview → Send a test email** using your verified domain.

Note: email failures are logged server-side (`console.error` in `src/lib/email/send.ts`) and never block order creation — the order still succeeds even if the email fails.

---

## 6. Vercel Blob (Images)

Stores product images and homepage hero-slide images uploaded in the admin. Used by `put()` in `src/lib/actions/product-actions.ts`.

### 6.1 Create a blob store

1. Go to https://vercel.com and open your project (or create one and link it).
2. **Storage → Create Database → Blob** → name the store (e.g. `otaku-images`).
3. Copy the **`BLOB_READ_WRITE_TOKEN`** (`vercel_blob_rw_...`) into `.env`:
   ```bash
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
   ```

For local development outside a Vercel project, you can still create a store in the dashboard and copy its token; the `@vercel/blob` client reads it from `BLOB_READ_WRITE_TOKEN`.

### 6.2 Verify

1. Log in to `/admin` (see section 8 for credentials).
2. Go to **Products → New Product** (or edit a product / homepage slide).
3. Upload an image. The thumbnail should appear after upload.
4. Check the blob store dashboard shows the uploaded file (it uploads under the `products/` prefix with a random UUID filename).

Troubleshooting: a `401`/auth error on upload means `BLOB_READ_WRITE_TOKEN` is missing, expired, or from a different store/project than the one expected by the client.

---

## 7. `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL`

### 7.1 `AUTH_SECRET`

Signs admin session JWTs (`src/lib/auth/session.ts`, jose `HS256`). It must be a strong, stable random value:

```bash
openssl rand -base64 32
```

Paste the output into `AUTH_SECRET`. Changing it signs everyone out (tokens no longer verify). Never commit the real value.

### 7.2 `NEXT_PUBLIC_APP_URL`

The public URL of the app. Used for Stripe Checkout return URLs and absolute links in order emails.

- Local development: `NEXT_PUBLIC_APP_URL="http://localhost:3000"`
- Production: `NEXT_PUBLIC_APP_URL="https://your-domain.com"`

It is a client-visible variable (`NEXT_PUBLIC_`), so never put anything secret in it.

---

## 8. Admin Login (demo users)

The seed creates two admin users — log in at `/admin/login`:

| Role | Email | Password |
| --- | --- | --- |
| `ADMIN` | `admin@example.com` | See seed file |
| `DEMO_ADMIN` | `demo@example.com` | `Demo123!` |

`ADMIN` can do everything (including deleting products/slides). `DEMO_ADMIN` is read-mostly: destructive operations like product deletion, inventory edits, and hero-slide deletion require `ADMIN`.

---

## 9. Recommended Order of Operations

1. **Neon** → get `DATABASE_URL` / `DIRECT_URL` → `pnpm prisma:migrate` → `pnpm prisma:seed`.
2. **AUTH_SECRET** → `openssl rand -base64 32`.
3. **Algolia** → get `ALGOLIA_APP_ID`/`ALGOLIA_ADMIN_API_KEY`/`ALGOLIA_SEARCH_API_KEY` → `rebuildIndex`.
4. **Stripe** → test secret key → `stripe listen --forward-to localhost:3000/api/webhooks/stripe` → `STRIPE_WEBHOOK_SECRET`.
5. **Resend** → API key + verified domain → `RESEND_API_KEY` / `EMAIL_FROM`.
6. **Vercel Blob** → `BLOB_READ_WRITE_TOKEN`.
7. `NEXT_PUBLIC_APP_URL` → `http://localhost:3000` locally.
8. `pnpm dev` → browse the storefront at `http://localhost:3000`, log into `/admin` with the demo credentials, and run the smoke-test checklist from the plan (`docs/superpowers/plans/2026-08-18-full-project.md`, Phase G Task G2).

---

## 10. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `DATABASE_URL is not set` at startup | `.env` missing the key, or the app was started before `.env` existed |
| Prisma migrate/seed connection error | Wrong host variant (`-pooler` vs direct), wrong region, or non-URL-encoded password |
| Search page works but no results | Index empty — run `rebuildIndex`; confirm the `products` index has records in the Algolia dashboard |
| `/search` returns errors / 500 | Algolia keys wrong, index missing, or `ALGOLIA_ADMIN_API_KEY`/`ALGOLIA_SEARCH_API_KEY` unset |
| Stripe redirects but order stays pending | Webhook not reaching `/api/webhooks/stripe`, or `STRIPE_WEBHOOK_SECRET` mismatch |
| Webhook logs `Invalid signature` (400) | `STRIPE_WEBHOOK_SECRET` out of sync — restart `stripe listen`, copy the new `whsec_...` |
| Checkout test card rejected | Test mode off, or a non-test card used |
| Order email never arrives | Domain not verified in Resend, `EMAIL_FROM` on an unverified domain, or mail in spam |
| Image upload fails with 401 | `BLOB_READ_WRITE_TOKEN` missing/wrong/from another store |
| Everyone logged out of admin | `AUTH_SECRET` changed (tokens no longer verify) |
| `STRIPE_SECRET_KEY is not set` / `RESEND_API_KEY is not set` at startup | Key missing or blank in `.env`; both throw on import (`src/lib/stripe/client.ts`, `src/lib/email/client.ts`) — set real or placeholder values before `pnpm dev` |