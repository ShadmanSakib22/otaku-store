import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = () => {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
};

export interface SessionPayload {
  sub: string;
  role: "ADMIN" | "DEMO_ADMIN";
}

const toKey = (secret: string | Uint8Array): Uint8Array =>
  typeof secret === "string" ? new TextEncoder().encode(secret) : secret;

export async function createSession(
  adminUser: { id: string; role: "ADMIN" | "DEMO_ADMIN" },
  secret: string | Uint8Array = SECRET()
): Promise<string> {
  return new SignJWT({ role: adminUser.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminUser.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(toKey(secret));
}

export async function verifySession(
  token: string,
  secret: string | Uint8Array = SECRET()
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, toKey(secret));
    return {
      sub: String(payload.sub),
      role: payload.role as SessionPayload["role"],
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  (await cookies()).set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete("auth_token");
}

export async function getSessionFromCookie() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;
  return verifySession(token);
}