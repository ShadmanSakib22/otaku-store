"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        const url = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
        router.push(url);
      }}
      className="flex w-full max-w-sm gap-2"
    >
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search manga, novels, merch…"
        aria-label="Search"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
