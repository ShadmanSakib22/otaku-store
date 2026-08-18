# Payments & Checkout

## 1. Payment Methods

The store supports:

```text
Cash Pickup
Stripe
```

Cash is restricted to the configured Tokyo pickup location.

Stripe handles online payment.

## 2. Checkout Flow

```text
Cart
 ↓
Terms
 ↓
Payment Method
 ↓
Cash OR Stripe
```

## 3. Step 1 — Terms

The customer must accept the purchase disclaimer.

```text
[ ] I have read and agree to the terms.
```

Store:

```text
termsAccepted
termsVersion
termsAcceptedAt
```

## 4. Step 2 — Payment Method

Options:

```text
Pay by Cash
Pay by Stripe
```

Cash clearly displays that pickup is available inside Tokyo only.

## 5. Cash Checkout

Collect:

```text
Name *
Phone *
Email (optional)
```

Create the order and show:

```text
Order ID
Pickup location
Products
Quantities
Total
Support contact
Pickup instructions
```

The customer can download a pickup transcript/receipt.

If an email is provided, Resend sends the receipt.

## 6. Stripe Checkout

```text
Checkout form
   ↓
Server validates cart
   ↓
Create pending Order
   ↓
Create Stripe Checkout Session
   ↓
Redirect to Stripe
   ↓
Customer pays
   ↓
Stripe webhook
   ↓
Confirm payment
   ↓
Finalize order
   ↓
Send confirmation email
```

## 7. Stripe Checkout Session

The server calculates the order from authoritative database data.

It:

1. Receives cart variant IDs and quantities.
2. Loads variants from PostgreSQL.
3. Validates product status.
4. Validates inventory.
5. Calculates prices.
6. Creates the pending order.
7. Creates the Stripe Checkout Session.

## 8. Stripe Success Redirect

The customer can be returned to the website and shown:

```text
Your payment was successful.

Your order has been placed.
Please check your email for details.
```

The return URL is not payment proof.

## 9. Stripe Webhook

```text
Webhook
  ↓
Verify signature
  ↓
Check idempotency
  ↓
Find Order
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

Stripe webhook processing must be idempotent.

## 10. Email Strategy

Send the order confirmation after confirmed Stripe payment.

Do not use the success redirect as the trigger for sending the confirmation email.

Email contains:

```text
Order ID
Product details
Order details
Receipt/total
Expected delivery information
Support email
Support phone
```

## 11. Stripe Checkout Link

Do not email the Stripe Checkout Session URL in the initial implementation.

Use:

```text
Customer
  ↓
Stripe Checkout
  ↓
Payment confirmed
  ↓
Confirmation email
```

Abandoned-checkout recovery can be considered later.

## 12. Inventory

Inventory must be validated before checkout.

The final implementation must also prevent overselling when multiple customers attempt to purchase limited-stock items simultaneously.

Inventory mutation should be transactional.

## 13. Payment Amounts

The client must never be trusted for:

```text
unit price
subtotal
shipping cost
total
```

The server calculates these values from current database records.

## 14. Payment Secrets

Stripe secret keys and webhook secrets remain server-only environment variables.

Never expose:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

to the browser.
