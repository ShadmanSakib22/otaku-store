// Admin authentication and authorization.
//
// Responsibilities (server-only):
// - Admin login and session management
// - Role checks (ADMIN, DEMO_ADMIN)
// - Route protection for /admin/* and admin mutations
//
// The browser is never trusted for the admin role.
export * from "./session";
export * from "./guard";