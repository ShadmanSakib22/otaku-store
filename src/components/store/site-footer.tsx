import Link from "next/link";
import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

const FOOTER_LINKS = [
  { label: "Manga", href: "/manga" },
  { label: "Light Novels", href: "/light-novels" },
  { label: "Merchandise", href: "/merchandise" },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-bold">OtakuYa</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your Akihabara pickup point for manga, light novels and
              merchandise.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Browse</p>
            <ul className="mt-2 space-y-1.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Support</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>{SUPPORT_EMAIL}</li>
              <li>{SUPPORT_PHONE}</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} OtakuYa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
