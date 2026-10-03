import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { naira, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function ProductImage({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className={`aspect-square w-full rounded-xl bg-muted object-cover ${className}`} />
  ) : (
    <div className={`grid aspect-square w-full place-items-center rounded-xl bg-muted font-mono text-[10px] uppercase text-muted-foreground ${className}`}>No image</div>
  );
}

export function ProductCard({ p, wide }: { p: Product; wide?: boolean }) {
  const { add } = useCart();
  const out = p.stock <= 0;
  return (
    <div className={`relative rounded-2xl border border-border bg-card p-2 ${wide ? "w-[156px] shrink-0" : ""}`}>
      <Link to="/product/$id" params={{ id: p.id }} className="block">
        <ProductImage src={p.image_url} alt={p.name} />
        <div className="mt-2 line-clamp-2 min-h-[2.4em] text-[12px] font-semibold leading-tight">{p.name}</div>
        <div className="mt-1 font-mono text-[13px] font-bold text-primary">{naira(p.price)}</div>
      </Link>
      <button
        disabled={out}
        aria-label={`Add ${p.name} to cart`}
        onClick={() => { add({ id: p.id, name: p.name, price: p.price, image_url: p.image_url, stock: p.stock }, 1); toast.success("Added to cart"); }}
        className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
      {out && <span className="absolute left-3 top-3 rounded-md bg-destructive px-1.5 py-0.5 text-[9px] font-bold uppercase text-destructive-foreground">Sold out</span>}
    </div>
  );
}
