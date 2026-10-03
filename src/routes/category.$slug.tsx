import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen, PageHeader } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { categoryBySlug } from "@/lib/catalog";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const name = categoryBySlug(params.slug)?.name ?? "Category";
    return { meta: [
      { title: `${name} — JOSPPY GADGETS` },
      { name: "description", content: `Shop ${name} in Naira at JOSPPY GADGETS.` },
      { property: "og:title", content: `${name} — JOSPPY GADGETS` },
      { property: "og:description", content: `Shop ${name} in Naira.` },
    ] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = categoryBySlug(slug);
  const { data = [], isLoading } = useQuery(productsQuery);
  const items = data.filter((p) => p.category === slug);
  return (
    <Screen>
      <PageHeader title={cat?.name ?? "Category"} />
      <div className="p-4">
        {!isLoading && items.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No products here yet. Check back soon.</p>}
        <div className="grid grid-cols-2 gap-3">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </div>
    </Screen>
  );
}
