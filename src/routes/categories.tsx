import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Screen, PageHeader } from "@/components/AppShell";
import { CATEGORIES } from "@/lib/catalog";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [
    { title: "Categories — JOSPPY GADGETS" },
    { name: "description", content: "Browse phone accessories, chargers, cables, power banks, bulbs, sockets, wires, DSTV/GOTV and solar." },
    { property: "og:title", content: "Categories — JOSPPY GADGETS" },
    { property: "og:description", content: "Browse all product categories." },
  ] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data = [] } = useQuery(productsQuery);
  return (
    <Screen>
      <PageHeader title="Categories" back={false} />
      <div className="space-y-2 p-4">
        {CATEGORIES.map((c) => {
          const n = data.filter((p) => p.category === c.slug).length;
          return (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary"><c.icon className="size-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{c.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{n} products</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </Screen>
  );
}
