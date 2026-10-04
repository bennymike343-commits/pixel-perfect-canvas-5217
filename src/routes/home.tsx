import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Screen, Logo } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { SupportCard } from "@/components/SupportCard";
import { CATEGORIES } from "@/lib/catalog";
import { productsQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Shop — JOSPPY GADGETS" },
      {
        name: "description",
        content:
          "Featured gadgets, new arrivals and deals on chargers, power banks, solar and more.",
      },
      { property: "og:title", content: "Shop — JOSPPY GADGETS" },
      { property: "og:description", content: "Featured gadgets, new arrivals and deals in Naira." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data = [], isLoading } = useQuery(productsQuery);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const featured = data.filter((p) => p.featured);
  const fresh = data.slice(0, 6);

  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pb-3 pt-5">
        <Logo />
        {isAdmin && (
          <Link
            to="/admin"
            className="rounded-xl bg-secondary px-3 py-2 font-mono text-[10px] uppercase text-secondary-foreground"
          >
            Admin
          </Link>
        )}
      </header>

      <form
        className="px-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/search", search: { q } });
        }}
      >
        <label className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-3 shadow-sm">
          <Search className="size-4 text-primary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search power banks, bulbs, cables…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="rounded-lg bg-primary px-2.5 py-1 font-mono text-[10px] uppercase text-primary-foreground">
            Go
          </button>
        </label>
      </form>

      <section className="mt-4 px-4">
        <Link
          to="/category/$slug"
          params={{ slug: "solar-products" }}
          className="relative block h-[140px] overflow-hidden rounded-3xl bg-hero text-primary-foreground shadow-glow"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="animate-sweep absolute top-0 h-full w-20 bg-primary-foreground/20 blur-md" />
          </div>
          <div className="absolute -bottom-8 -right-6 size-36 rounded-full bg-primary-foreground/15 blur-2xl" />
          <img
            src="/products/solarpanel.jpg"
            alt=""
            className="absolute -right-6 bottom-0 h-[130px] w-[130px] rotate-6 rounded-2xl object-cover opacity-90"
          />
          <div className="relative flex h-full flex-col justify-center px-5">
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-80">
              Flash deal · 48hrs
            </div>
            <div className="mt-1 text-2xl font-black leading-none tracking-tight">
              Beat NEPA.
              <br />
              Go solar today
            </div>
            <div className="mt-2 w-fit rounded-full bg-primary-foreground px-3 py-1 text-[11px] font-bold text-primary">
              Shop solar →
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-5 px-4">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Categories ({CATEGORIES.length})
          </div>
          <Link
            to="/categories"
            className="font-mono text-[10px] font-bold text-primary hover:underline"
          >
            View All ({CATEGORIES.length}) →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-1 py-2.5 transition-colors hover:border-primary/40 active:scale-[0.98]"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-accent text-primary">
                <c.icon className="size-[18px]" />
              </span>
              <span className="text-center text-[9.5px] font-semibold leading-tight text-foreground line-clamp-2">
                {c.short}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between px-4">
          <h2 className="text-base font-black tracking-tight">Featured</h2>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[230px] w-[156px] shrink-0 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} wide />
          ))}
        </div>
      </section>

      <section className="mt-5 px-4">
        <h2 className="mb-2 text-base font-black tracking-tight">New arrivals</h2>
        <div className="grid grid-cols-2 gap-3">
          {fresh.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <div className="mx-4 mt-6 flex items-center gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground">
        <ShieldCheck className="size-6 shrink-0" />
        <p className="text-xs font-medium">
          Genuine products · Pay on delivery available · Delivery across all 36 states
        </p>
      </div>

      <div className="mx-4 mt-4">
        <SupportCard compact />
      </div>
    </Screen>
  );
}
