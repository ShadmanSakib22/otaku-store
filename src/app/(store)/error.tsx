"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">Something went wrong</p>
      <h1 className="text-3xl font-bold tracking-tight">Unexpected error</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        An error occurred while rendering this page. Please try again.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}