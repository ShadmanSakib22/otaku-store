# Authentication & Authorization

## 1. Customer Authentication

Customers do not create accounts.

There is no customer registration, login, password, profile, saved address, session, or wishlist.

```text
Customer
  ↓
Browse
  ↓
Cart
  ↓
Checkout
  ↓
Order
```

## 2. Checkout Identity

Customer identity is represented by information captured during checkout:

```text
Name
Phone
Email
```

This information is stored on the Order.

Email is optional for cash pickup but required for Stripe checkout/order confirmation.

## 3. Browser-Persisted Checkout Information

Non-sensitive checkout information may be persisted locally to prefill future purchases:

```text
name
email
phone
address
```

The customer can edit it before submission.

Never persist:

```text
Card number
CVV
Stripe secrets
Payment credentials
```

## 4. Admin Authentication

The admin area is authenticated separately from customers.

Administrative routes are protected server-side.

```text
/admin
/admin/products
/admin/inventory
/admin/orders
/admin/homepage
```

## 5. Admin Roles

Initial roles:

```text
ADMIN
DEMO_ADMIN
```

`ADMIN` has full administrative access.

`DEMO_ADMIN` is intended for restricted portfolio demonstrations.

## 6. Authorization Boundary

Frontend visibility is not a security boundary.

This is insufficient:

```text
if (isAdmin) {
  show Delete button
}
```

The server must enforce:

```text
request
  ↓
authenticate
  ↓
authorize
  ↓
perform mutation
```

## 7. Public API Security

Public operations can include:

```text
GET products
GET product
GET search
POST checkout
POST payment-session
```

Administrative mutations require authorization.

## 8. Webhook Authentication

Stripe webhooks must be verified using Stripe's webhook signature mechanism before processing.

## 9. Security Principles

Never trust client-provided:

```text
role
price
total
inventory
payment status
order status
```

All important business operations must be validated server-side.
