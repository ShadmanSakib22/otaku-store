import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <div className="space-y-1">
          <p className="font-medium text-foreground">OtakuYa</p>
          <p>This is a demo site. Not a real store.</p>
        </div>
        <p>
          &copy;{" "}
          <Link
            href="https://github.com/shadmansakib22"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            shadmansakib22
          </Link>
        </p>
      </div>
    </footer>
  );
}
