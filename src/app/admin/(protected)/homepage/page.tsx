import { getHeroSlidesAdmin } from "@/lib/admin-queries";
import { getSessionFromCookie } from "@/lib/auth/session";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";

export const revalidate = 0;

export default async function AdminHomepagePage() {
  const [slides, session] = await Promise.all([
    getHeroSlidesAdmin(),
    getSessionFromCookie(),
  ]);

  const rows = slides.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    imageUrl: s.imageUrl,
    ctaText: s.ctaText,
    ctaUrl: s.ctaUrl,
    position: s.position,
    isActive: s.isActive,
    startsAt: s.startsAt?.toISOString() ?? null,
    endsAt: s.endsAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Homepage</h1>
      <HeroSlidesManager slides={rows} canDelete={session?.role === "ADMIN"} />
    </div>
  );
}