import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingCart, Package, User, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export function Logo({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`${small ? "size-8 text-sm" : "size-9"} grid place-items-center rounded-xl bg-hero font-black text-primary-foreground shadow-glow`}
      >
        J
      </div>
      <div className="leading-none">
        <div className="text-[15px] font-black tracking-tight">
          JOSPPY<span className="text-primary"> GADGETS</span>
        </div>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          Power · Light · Phone
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  back = true,
  right,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <header className="glass sticky top-0 z-30 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center border-b border-border px-3 py-3">
      {back ? (
        <button
          onClick={() => history.back()}
          aria-label="Back"
          className="grid size-9 place-items-center rounded-xl bg-secondary text-secondary-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>
      ) : (
        <span />
      )}
      <h1 className="truncate text-center text-base font-black tracking-tight">{title}</h1>
      <div className="flex justify-end">{right}</div>
    </header>
  );
}

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { count } = useCart();
  const { session } = useAuth();
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 px-1 py-1.5">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group relative flex flex-col items-center gap-1 py-1 text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <span className="relative grid size-8 place-items-center rounded-xl group-data-[status=active]:bg-accent">
              <t.icon className="size-5" />
              {t.to === "/cart" && count > 0 && (
                <span className="absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
              {t.to === "/profile" && session && (
                <span
                  title="Signed in"
                  className="absolute right-0.5 top-0 size-2 rounded-full bg-success ring-2 ring-background"
                />
              )}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider">
              {t.to === "/profile" && session ? "Account" : t.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function Screen({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <div
      className={`relative mx-auto min-h-screen max-w-md overflow-x-hidden bg-background ${nav ? "pb-24" : ""}`}
    >
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-primary-glow/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-52 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">{children}</div>
      {nav && <BottomNav />}
    </div>
  );
}
