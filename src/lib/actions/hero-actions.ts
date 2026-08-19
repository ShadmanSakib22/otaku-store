"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { requireAdmin, requireRole } from "@/lib/auth/guard";
import { heroSlideFormSchema } from "@/lib/validation/admin";

export async function saveHeroSlideAction(formData: FormData) {
  await requireAdmin();
  const parsed = heroSlideFormSchema.safeParse({
    ...Object.fromEntries(formData),
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { ok: false, error: "Invalid slide data" };

  const data = parsed.data;
  const payload = {
    title: data.title,
    subtitle: data.subtitle || null,
    imageUrl: data.imageUrl,
    ctaText: data.ctaText || null,
    ctaUrl: data.ctaUrl || null,
    position: data.position,
    isActive: data.isActive,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
  };

  const slide = data.id
    ? await prisma.heroSlide.update({ where: { id: data.id }, data: payload })
    : await prisma.heroSlide.create({ data: payload });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { ok: true, slide };
}

export async function deleteHeroSlideAction(id: string) {
  await requireRole("ADMIN");
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function reorderHeroSlidesAction(ids: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    ids.map((id, position) =>
      prisma.heroSlide.update({ where: { id }, data: { position } })
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { ok: true };
}
