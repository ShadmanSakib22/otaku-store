"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { compare } from "bcryptjs";
import { adminLoginSchema } from "@/lib/validation/admin";
import { createSession, setSessionCookie, clearSessionCookie } from "@/lib/auth/session";

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