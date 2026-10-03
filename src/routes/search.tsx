import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { Screen, PageHeader } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional().default("") }),
  head: () => ({ meta: [
    { title: "Search — JOSPPY GADGETS" },
    { name: "description", content: "Search gadgets and electrical products at JOSPPY GADGETS." },
    { property: "og:title", content: "Search — JOSPPY GADGETS" },
    { property: "og:description", content: "Search gadgets and electrical products." },
  ] }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const { data = [] } = useQuery(productsQuery);
  const term = q.toLowerCase().trim();
  const results = term ? data.filter((p) => (p.name + " " + p.description + " " + p.category).toLowerCase().includes(term)) : data;
  return (
    <Screen>
      <PageHeader title="Search" />
      <div className="p-4">
        <label className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-3">
          <Search className="size-4 text-primary" />
          <input autoFocus defaultValue={q} onChange={(e) => navigate({ search: { q: e.target.value }, replace: true })} placeholder="Search products" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{results.length} results</p>
        <div className="mt-3 grid grid-cols-2 gap-3">{results.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </div>
    </Screen>
  );
}
