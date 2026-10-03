import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Screen, PageHeader } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductCard";
import { categoryBySlug, naira } from "@/lib/catalog";
import { productQuery } from "@/lib/queries";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$id")({
  head: () => ({ meta: [
    { title: "Product — JOSPPY GADGETS" },
    { name: "description", content: "Product details, price in Naira and stock availability." },
    { property: "og:title", content: "Product — JOSPPY GADGETS" },
    { property: "og:description", content: "Product details and price in Naira." },
  ] }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: p, isLoading } = useQuery(productQuery(id));
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const navigate = useNavigate();

  if (isLoading) return <Screen nav={false}><PageHeader title="Product" /><div className="m-4 aspect-square animate-pulse rounded-3xl bg-muted" /></Screen>;
  if (!p) return <Screen><PageHeader title="Not found" /><p className="p-8 text-center text-muted-foreground">This product is no longer available. <Link to="/home" className="text-primary">Go home</Link></p></Screen>;

  const out = p.stock <= 0;
  const addToCart = (go?: boolean) => {
    add({ id: p.id, name: p.name, price: p.price, image_url: p.image_url, stock: p.stock }, qty);
    toast.success(`${qty} × ${p.name} added`);
    if (go) navigate({ to: "/cart" });
  };

  return (
    <Screen nav={false}>
      <PageHeader title={categoryBySlug(p.category)?.short ?? "Product"} />
      <div className="px-4 pb-32 pt-3">
        <div className="rounded-3xl border border-border bg-card p-2"><ProductImage src={p.image_url} alt={p.name} className="rounded-2xl" /></div>
        <h1 className="mt-4 text-xl font-black leading-tight tracking-tight">{p.name}</h1>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-2xl font-bold text-primary">{naira(p.price)}</span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${out ? "bg-destructive/10 text-destructive" : p.stock < 10 ? "bg-warning/15 text-foreground" : "bg-success/15 text-success"}`}>
            {out ? "Out of stock" : `${p.stock} in stock`}
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2 rounded-xl bg-secondary p-3 text-secondary-foreground"><Truck className="size-4" />Delivery nationwide</div>
          <div className="flex items-center gap-2 rounded-xl bg-secondary p-3 text-secondary-foreground"><ShieldCheck className="size-4" />Genuine & tested</div>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-card p-3">
          <span className="text-sm font-semibold">Quantity</span>
          <div className="flex items-center gap-3">
            <button aria-label="Decrease" disabled={qty <= 1} onClick={() => setQty(qty - 1)} className="grid size-9 place-items-center rounded-xl bg-secondary disabled:opacity-40"><Minus className="size-4" /></button>
            <span className="w-6 text-center font-mono font-bold">{qty}</span>
            <button aria-label="Increase" disabled={qty >= p.stock} onClick={() => setQty(qty + 1)} className="grid size-9 place-items-center rounded-xl bg-secondary disabled:opacity-40"><Plus className="size-4" /></button>
          </div>
        </div>
      </div>
      <div className="glass fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md gap-2 border-t border-border p-3">
        <button disabled={out} onClick={() => addToCart()} className="flex-1 rounded-2xl border border-primary py-3.5 text-sm font-bold text-primary disabled:opacity-40">Add to Cart</button>
        <button disabled={out} onClick={() => addToCart(true)} className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40">Buy now · {naira(p.price * qty)}</button>
      </div>
    </Screen>
  );
}
