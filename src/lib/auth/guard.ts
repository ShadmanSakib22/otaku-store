import { unauthorized, forbidden } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth/session";

export async function requireAdmin() {
  const session = await getSessionFromCookie();
  if (!session) unauthorized();
  return session;
}

export async function requireRole(role: "ADMIN" | "DEMO_ADMIN") {
  const session = await requireAdmin();
  if (role === "ADMIN" && session.role !== "ADMIN") forbidden();
  return session;
}