import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, AlertCircle } from "lucide-react";
import { Screen, PageHeader } from "@/components/AppShell";
import { DELIVERY_FEE, naira, getRemovedProductIds } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { resolveProductImageUrl } from "@/lib/images";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — JOSPPY GADGETS" },
      { name: "description", content: "Review the items in your cart." },
      { property: "og:title", content: "Cart — JOSPPY GADGETS" },
      { property: "og:description", content: "Review the items in your cart." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const removedIds = getRemovedProductIds();
  const hasUnavailableItems = items.some((i) => removedIds.has(i.id));

  if (!items.length)
    return (
      <Screen>
        <PageHeader title="My Cart" back={false} />
        <div className="flex flex-col items-center px-8 py-20 text-center">
          <span className="grid size-20 place-items-center rounded-3xl bg-accent text-primary">
            <ShoppingBag className="size-9" />
          </span>
          <h2 className="mt-4 text-lg font-black">Your cart is empty</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse our gadgets and add something you like.
          </p>
          <Link
            to="/home"
            className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Start shopping
          </Link>
        </div>
      </Screen>
    );
  return (
    <Screen>
      <PageHeader title={`My Cart (${items.length})`} back={false} />
      <div className="space-y-2 p-4 pb-56">
        {hasUnavailableItems && (
          <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              One or more items in your cart are no longer available. Please remove them to proceed.
            </span>
          </div>
        )}
        {items.map((i) => {
          const isItemRemoved = removedIds.has(i.id);
          return (
            <div key={i.id} className="flex gap-3 rounded-2xl border border-border bg-card p-2">
              {i.image_url ? (
                <img
                  src={resolveProductImageUrl(i.image_url)}
                  alt={i.name}
                  className="size-20 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="size-20 shrink-0 rounded-xl bg-muted" />
              )}
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-tight">{i.name}</p>
                    {isItemRemoved && (
                      <span className="mt-1 inline-block rounded-md bg-destructive/15 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                        Item unavailable (Removed from store)
                      </span>
                    )}
                  </div>
                  <button
                    aria-label="Remove"
                    onClick={() => remove(i.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-primary">
                    {naira(i.price * i.quantity)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Decrease"
                      disabled={isItemRemoved}
                      onClick={() => setQty(i.id, i.quantity - 1)}
                      className="grid size-7 place-items-center rounded-lg bg-secondary disabled:opacity-40"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-5 text-center font-mono text-sm">{i.quantity}</span>
                    <button
                      aria-label="Increase"
                      disabled={isItemRemoved}
                      onClick={() => setQty(i.id, i.quantity + 1)}
                      className="grid size-7 place-items-center rounded-lg bg-secondary disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-4 mb-24 rounded-2xl bg-secondary/50 p-3 text-center text-xs text-muted-foreground">
          <p>
            Nationwide delivery at {naira(DELIVERY_FEE)} · Read our{" "}
            <Link to="/delivery-policy" className="font-semibold text-primary underline">
              Delivery Policy
            </Link>{" "}
            &{" "}
            <Link to="/returns-policy" className="font-semibold text-primary underline">
              Returns Policy
            </Link>
          </p>
        </div>
      </div>
      <div className="glass fixed inset-x-0 bottom-[68px] z-30 mx-auto max-w-md space-y-1.5 border-t border-border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono">{naira(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span className="font-mono">{naira(DELIVERY_FEE)}</span>
        </div>
        <div className="flex justify-between text-base font-black">
          <span>Total</span>
          <span className="font-mono text-primary">{naira(subtotal + DELIVERY_FEE)}</span>
        </div>
        {hasUnavailableItems ? (
          <button
            disabled
            className="mt-2 block w-full rounded-2xl bg-muted py-3.5 text-center font-bold text-muted-foreground cursor-not-allowed opacity-75"
          >
            Remove unavailable items to proceed
          </button>
        ) : (
          <Link
            to="/checkout"
            className="mt-2 block rounded-2xl bg-primary py-3.5 text-center font-bold text-primary-foreground shadow-glow"
          >
            Proceed to checkout
          </Link>
        )}
      </div>
    </Screen>
  );
}
