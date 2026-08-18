// Server-side input validation.
//
// The server validates every request it receives:
// - Checkout payloads
// - Payment session requests
// - Admin mutations
// - URL search parameters
//
// Client-provided price, total, inventory, payment status, and role
// values are never accepted as authoritative.
export {};