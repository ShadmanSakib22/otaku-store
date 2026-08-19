import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Product not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This product does not exist or is no longer available.
      </p>
      <Button asChild>
        <Link href="/manga">Browse manga</Link>
      </Button>
    </main>
  );
}