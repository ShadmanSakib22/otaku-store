# Database

## 1. Database Overview

The application uses PostgreSQL hosted on Neon with Prisma ORM.

PostgreSQL is authoritative for:

- Products
- Categories
- Inventory
- Orders
- Payments
- Homepage CMS data
- Admin data

Algolia is only a derived search index.

## 2. Core Domain Model

```text
CATALOGUE
├── Category
├── Genre
├── Author
├── Publisher
├── Product
├── ProductAuthor
├── BookMetadata
├── ProductImage
└── ProductVariant

INVENTORY
└── Inventory

COMMERCE
├── Order
├── OrderItem
├── OrderShippingAddress
├── Payment
└── CashPickupDetails

CMS
└── HeroSlide

ADMIN
└── AdminUser
```

There are no customer account tables.

## 3. Customer Model

Customers do not have accounts.

There is no customer:

- Registration
- Login
- Password
- Profile
- Saved address
- Session
- Wishlist

Customer information is captured as an order snapshot:

```text
Order
├── customerName
├── customerEmail
├── customerPhone
└── shipping address
```

## 4. Category

Main categories:

```text
MANGA
LIGHT_NOVEL
MERCH
```

Fields:

```text
id
name
slug
description
image
createdAt
updatedAt
```

## 5. Genre

Represents searchable product tags.

Examples:

```text
Action
Adventure
Comedy
Drama
Fantasy
Horror
Romance
Sci-Fi
Slice of Life
```

Products can have multiple genres.

## 6. Author

Represents creators associated with books.

Product and Author use a many-to-many relationship through `ProductAuthor`.

## 7. Publisher

Represents a publisher associated with a book product.

## 8. Product

The central catalogue entity.

Typical fields:

```text
id
name
slug
type
summary
description
categoryId
publisherId
releaseDate
lifetimeSales
status
createdAt
updatedAt
```

`lifetimeSales` is the quantity sold through this store and powers Top Seller sections.

## 9. Manga and Light Novel Volumes

Each Manga or Light Novel volume is a separate Product.

Example:

```text
One Piece Vol. 1
One Piece Vol. 2
One Piece Vol. 3
```

Each has its own:

- URL
- SKU
- Price
- Inventory
- Sales count
- Search result

This keeps catalogue and commerce logic simple.

## 10. BookMetadata

Used by Manga and Light Novel products.

Typical fields:

```text
id
productId
volume
isbn
language
pageCount
releaseDate
```

A Product has at most one BookMetadata record.

## 11. ProductImage

A product can have one or more images.

```text
Product
└── ProductImage[]
```

Fields:

```text
id
productId
url
alt
position
createdAt
```

Images are stored in Vercel Blob. PostgreSQL stores the URL/reference.

## 12. ProductVariant

Represents an individual sellable SKU.

Merch example:

```text
Gojo Hoodie
├── S / Black
├── M / Black
├── L / Black
└── XL / Black
```

Fields:

```text
id
productId
name
sku
price
size
color
createdAt
updatedAt
```

For a product without meaningful variations, use a single default variant.

Example:

```text
One Piece Vol. 1
└── Default
```

The cart always references ProductVariant.

## 13. Inventory

Inventory belongs to a ProductVariant.

```text
ProductVariant
└── Inventory
```

Typical fields:

```text
id
variantId
quantity
lowStockAt
updatedAt
```

Derived stock status:

```text
quantity = 0
→ OUT_OF_STOCK

quantity <= lowStockAt
→ LOW_STOCK

quantity > lowStockAt
→ IN_STOCK
```

## 14. Order

Order is the central commerce record.

Typical fields:

```text
id
orderNumber

customerName
customerEmail
customerPhone

paymentMethod
status
paymentStatus

currency
subtotal
shippingCost
total

termsAccepted
termsVersion
termsAcceptedAt

createdAt
updatedAt
```

The customer information is stored directly on the Order because there are no customer accounts.

`orderNumber` is unique and human-readable.

Example:

```text
ORD-2026-000123
```

## 15. OrderItem

Represents a purchased line item.

Typical fields:

```text
id
orderId
variantId

productName
variantName
sku

unitPrice
quantity
total
```

Product/variant information is copied as a historical snapshot so old orders remain correct after catalogue changes.

## 16. Order Shipping Address

Stripe orders collect a shipping address.

The address is stored as an order snapshot rather than a reusable customer address.

Typical fields:

```text
firstName
lastName
address1
address2
city
state
postalCode
country
phone
```

Cash pickup orders do not require a shipping address.

## 17. CashPickupDetails

Cash orders are pickup-only.

A dedicated model may store:

```text
orderId
pickupLocation
pickupInstructions
```

The exact split between Order and CashPickupDetails can be finalized during implementation.

## 18. Payment

Represents payment processing.

Stripe identifiers may include:

```text
stripeCheckoutSessionId
stripePaymentIntentId
```

Typical fields:

```text
provider
status
amount
currency
paidAt
createdAt
updatedAt
```

Cash orders do not need Stripe identifiers.

## 19. HeroSlide

Controls the homepage hero section.

Typical fields:

```text
id
title
subtitle
imageUrl
ctaText
ctaUrl
position
isActive
startsAt
endsAt
createdAt
updatedAt
```

The admin manages approximately 3–4 active slides.

## 20. AdminUser

Customer authentication is absent, but the admin area is authenticated.

Initial roles:

```text
ADMIN
DEMO_ADMIN
```

`DEMO_ADMIN` may be restricted for the public portfolio demo.

## 21. Relationships

| Relationship | Type |
|---|---|
| Category → Product | One-to-many |
| Publisher → Product | One-to-many |
| Product → BookMetadata | One-to-one |
| Product → ProductImage | One-to-many |
| Product → ProductVariant | One-to-many |
| Product ↔ Author | Many-to-many |
| Product ↔ Genre | Many-to-many |
| ProductVariant → Inventory | One-to-one |
| Order → OrderItem | One-to-many |
| ProductVariant → OrderItem | One-to-many |
| Order → Payment | One-to-one / optional |
| Order → Shipping Address | One-to-one / optional |
| Order → CashPickupDetails | One-to-one / optional |

## 22. Indexing

Common indexes:

```text
Product.slug UNIQUE
Product.type
Product.status
Product.categoryId
Product.publisherId
Product.createdAt
Product.lifetimeSales

ProductVariant.productId
ProductVariant.sku UNIQUE

Inventory.variantId UNIQUE

Order.orderNumber UNIQUE
Order.customerEmail
Order.status
Order.paymentStatus
Order.paymentMethod
Order.createdAt

OrderItem.orderId
OrderItem.variantId
```

Compound indexes should be added when justified by real query patterns.

## 23. Search Data

Algolia documents are generated from PostgreSQL.

Example:

```json
{
  "id": "product-id",
  "name": "One Piece Vol. 1",
  "slug": "one-piece-volume-1",
  "type": "MANGA",
  "category": "Manga",
  "authors": ["Eiichiro Oda"],
  "publisher": "Shueisha",
  "genres": ["Action", "Adventure"],
  "price": 12.99,
  "lifetimeSales": 1248,
  "stockStatus": "IN_STOCK"
}
```

The search index is never the authoritative source for checkout.

## 24. Guest Cart

There is intentionally no database Cart model.

Cart state lives in the browser:

```text
Zustand
  ↓
Persist middleware
  ↓
localStorage
```

Persist:

```text
variantId
quantity
```

Do not persist authoritative:

```text
price
inventory
payment status
order status
```

## 25. Checkout Data Integrity

The server receives cart identifiers and quantities and retrieves current data from PostgreSQL.

```text
Client cart
   ↓
variantId + quantity
   ↓
Server
   ↓
PostgreSQL
   ↓
Validate:
  - active
  - exists
  - inventory
  - current price
   ↓
Calculate total server-side
```

## 26. Lifetime Sales

Lifetime sales are updated only when the store considers a purchase successfully completed.

Stripe:

```text
Stripe webhook
  ↓
Payment confirmed
  ↓
Order finalized
  ↓
Increment lifetimeSales
```

For cash, define whether a sale is counted at order creation or pickup completion and keep that rule consistent.

## 27. Transactions and Idempotency

Use Prisma transactions where multiple records must remain consistent.

Examples:

- Creating an order and order items
- Finalizing payment
- Updating inventory
- Incrementing lifetime sales

Stripe webhook processing must be idempotent so repeated delivery cannot duplicate inventory deductions, sales counts, or emails.

## 28. Seed Data

Suggested initial catalogue:

```text
Manga
~15 products

Light Novels
~8 products

Merchandise
~8 products
```

Include multiple genres, authors, publishers, images, variants, stock levels, prices, and sales values.

Additional generated data can later be used to test 10,000+ record search and pagination.

## 29. Deliberately Excluded

```text
Customer accounts
Customer profiles
Customer passwords
Customer sessions
Wishlists
Reviews
Ratings
Subscriptions
Vendors
Seller accounts
Marketplace entities
Loyalty points
Coupons
Digital products
Product recommendations
```
