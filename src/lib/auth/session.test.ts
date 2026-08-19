// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createSession, verifySession } from "./session";

const secret = "test-secret-at-least-32-characters-long-0000";

describe("session tokens", () => {
  it("round-trips a token", async () => {
    const token = await createSession({ id: "admin-1", role: "ADMIN" }, secret);
    const payload = await verifySession(token, secret);
    expect(payload).toMatchObject({ sub: "admin-1", role: "ADMIN" });
  });

  it("rejects a tampered token", async () => {
    const token = await createSession({ id: "admin-1", role: "ADMIN" }, secret);
    await expect(verifySession(`${token}x`, secret)).resolves.toBeNull();
  });
});