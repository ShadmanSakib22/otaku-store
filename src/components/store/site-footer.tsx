import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-8 text-sm text-muted-foreground">
        <p className="font-serif font-semibold text-foreground">Otaku Store</p>
        <p>
          Support: {SUPPORT_EMAIL} · {SUPPORT_PHONE}
        </p>
      </div>
    </footer>
  );
}
