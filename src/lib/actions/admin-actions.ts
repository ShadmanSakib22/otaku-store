"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { compare, hash } from "bcryptjs";
import { adminLoginSchema, changePasswordSchema } from "@/lib/validation/admin";
import {
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getSessionFromCookie,
} from "@/lib/auth/session";

export async function loginAction(formData: FormData) {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/admin/login?error=invalid");

  const admin = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!admin || !(await compare(parsed.data.password, admin.passwordHash))) {
    redirect("/admin/login?error=invalid");
  }

  const token = await createSession(admin);
  await setSessionCookie(token);
  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

export async function changePasswordAction(
  _prev: ChangePasswordResult | null,
  formData: FormData,
): Promise<ChangePasswordResult> {
  const session = await getSessionFromCookie();
  if (!session) return { ok: false, error: "Not authenticated" };
  if (session.role === "DEMO_ADMIN") {
    return { ok: false, error: "Demo accounts cannot change their password" };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!admin) return { ok: false, error: "Account not found" };
  if (!(await compare(parsed.data.currentPassword, admin.passwordHash))) {
    return { ok: false, error: "Current password is incorrect" };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await hash(parsed.data.newPassword, 12) },
  });

  return { ok: true };
}