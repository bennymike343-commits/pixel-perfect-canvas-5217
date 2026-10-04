import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Building2,
  Phone,
  ArrowRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Screen, PageHeader } from "@/components/AppShell";
import { naira, SUPPORT_PHONE, SUPPORT_PHONE_CALL, getWhatsAppSupportUrl } from "@/lib/catalog";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — JOSPPY GADGETS" },
      {
        name: "description",
        content: "Track your orders and view past purchases at JOSPPY GADGETS.",
      },
      { property: "og:title", content: "Orders — JOSPPY GADGETS" },
      {
        property: "og:description",
        content: "Track your orders and view past purchases at JOSPPY GADGETS.",
      },
    ],
  }),
  component: OrdersPage,
});

export type OrderItem = {
  id?: string;
  product_id?: string | null;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
};

export type OrderRecord = {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  address: string;
  state: string;
  city: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method?: "pod" | "transfer";
  created_at: string;
  items: OrderItem[];
};

const STAGES = [
  { key: "pending", label: "Order Placed", desc: "Order received & confirmed" },
  { key: "processing", label: "Processing", desc: "Inspected & packaged" },
  { key: "shipped", label: "Shipped", desc: "Dispatched with courier" },
  { key: "delivered", label: "Delivered", desc: "Received by customer" },
] as const;

function getStageIndex(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return 0;
  }
}

function StatusBadge({ status }: { status: OrderRecord["status"] }) {
  switch (status) {
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-success">
          <CheckCircle2 className="size-3" /> Delivered
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-500">
          <Truck className="size-3" /> Shipped
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary">
          <Clock className="size-3" /> Processing
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-destructive">
          <XCircle className="size-3" /> Cancelled
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
          <Clock className="size-3" /> Pending
        </span>
      );
  }
}

function OrdersPage() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Read local storage recent orders (used by guest checkout and as immediate cache)
      let localOrders: OrderRecord[] = [];
      try {
        const raw = localStorage.getItem("josppy-recent-orders");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            localOrders = parsed.map((o) => ({
              id: o.id,
              user_id: o.userId || o.user_id,
              full_name: o.fullName || o.full_name || "Customer",
              phone: o.phone || "",
              address: o.address || "",
              state: o.state || "",
              city: o.city || "",
              subtotal: Number(o.subtotal) || 0,
              delivery_fee: Number(o.deliveryFee ?? o.delivery_fee) || 2500,
              total: Number(o.total) || 0,
              status: (o.status as OrderRecord["status"]) || "pending",
              payment_method: (o.paymentMethod || o.payment_method) as "pod" | "transfer",
              created_at: o.createdAt || o.created_at || new Date().toISOString(),
              items: Array.isArray(o.items) ? o.items : [],
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to read local orders:", err);
      }

      // 2. Query database orders for authenticated user OR guest ID
      const effectiveUserId = session?.user?.id || localStorage.getItem("josppy-guest-uid");
      let dbOrders: OrderRecord[] = [];

      if (effectiveUserId) {
        try {
          const { data, error: dbError } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", effectiveUserId)
            .order("created_at", { ascending: false });

          if (!dbError && Array.isArray(data)) {
            const list: OrderRecord[] = [];
            for (const row of data) {
              const matchingLocal = localOrders.find((l) => l.id === row.id);
              let items: OrderItem[] = matchingLocal?.items || [];

              // If items not stored in local cache, load from order_items table
              if (items.length === 0) {
                try {
                  const { data: itemRows } = await supabase
                    .from("order_items")
                    .select("*")
                    .eq("order_id", row.id);

                  if (itemRows && Array.isArray(itemRows)) {
                    items = itemRows.map((it) => ({
                      id: it.id,
                      product_id: it.product_id,
                      name: it.name,
                      price: it.price,
                      quantity: it.quantity,
                      image_url: it.image_url,
                    }));
                  }
                } catch {
                  // Ignore item load error and continue with remaining orders
                }
              }

              list.push({
                id: row.id,
                user_id: row.user_id,
                full_name: row.full_name,
                phone: row.phone,
                address: row.address,
                state: row.state,
                city: row.city,
                subtotal: row.subtotal,
                delivery_fee: row.delivery_fee,
                total: row.total,
                status: row.status as OrderRecord["status"],
                payment_method: matchingLocal?.payment_method || "pod",
                created_at: row.created_at,
                items,
              });
            }
            dbOrders = list;
          }
        } catch (dbErr) {
          console.warn("Database order fetch failed, falling back to local storage:", dbErr);
        }
      }

      // 3. Merge database orders with local storage orders, prioritizing DB status updates
      const map = new Map<string, OrderRecord>();
      for (const o of localOrders) {
        map.set(o.id, o);
      }
      for (const o of dbOrders) {
        const prev = map.get(o.id);
        map.set(o.id, {
          ...o,
          items: o.items.length > 0 ? o.items : prev?.items || [],
          payment_method: o.payment_method || prev?.payment_method || "pod",
        });
      }

      const merged = Array.from(map.values());
      // Sort newest first
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(merged);
    } catch (e) {
      console.error("Order loading error:", e);
      setError("Unable to load orders. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Detailed View for a Selected Order
  if (selectedOrder) {
    const isCancelled = selectedOrder.status === "cancelled";
    const currentStageIdx = getStageIndex(selectedOrder.status);

    return (
      <Screen nav={false}>
        <PageHeader
          title={`Order #${selectedOrder.id.slice(0, 8).toUpperCase()}`}
          back={false}
          right={
            <button
              onClick={() => setSelectedOrderId(null)}
              className="grid size-9 place-items-center rounded-xl bg-secondary text-secondary-foreground"
              aria-label="Back to orders"
            >
              <ChevronLeft className="size-5" />
            </button>
          }
        />

        <div className="px-4 pb-28 pt-3">
          {/* Header Card with Reference & Status */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">Order ID</span>
              <StatusBadge status={selectedOrder.status} />
            </div>
            <h2 className="mt-1 font-mono text-lg font-black tracking-tight text-foreground">
              #{selectedOrder.id.slice(0, 8).toUpperCase()}
            </h2>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5 text-primary" />
              <span>
                {new Date(selectedOrder.created_at).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Delivery Timeline / Tracking */}
          <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <Truck className="size-4 text-primary" />
              Delivery Progress
            </div>

            {isCancelled ? (
              <div className="mt-3.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-destructive">
                  <XCircle className="size-4 shrink-0" />
                  <span>Order Cancelled</span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  This order was cancelled. If you need any assistance or have already made a
                  payment, please reach out to our team below.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  const isPending = idx > currentStageIdx;

                  return (
                    <div key={stage.key} className="relative flex items-start gap-3.5">
                      {/* Vertical connector line */}
                      {idx < STAGES.length - 1 && (
                        <div
                          className={`absolute left-[13px] top-[26px] h-9 w-0.5 ${
                            isCompleted ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}

                      {/* Stage indicator circle */}
                      <div
                        className={`grid size-7 shrink-0 place-items-center rounded-full text-xs transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : "border border-border bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <span className="font-mono text-[11px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Stage text */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs font-bold ${
                              isCurrent
                                ? "text-primary"
                                : isPending
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                            }`}
                          >
                            {stage.label}
                          </p>
                          {isCurrent && (
                            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary">
                              Current Stage
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delivery Address Details */}
          <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              Delivery Destination
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-bold text-foreground">{selectedOrder.full_name}</p>
              <p className="text-muted-foreground">{selectedOrder.phone}</p>
              <p className="text-muted-foreground">
                {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} State
              </p>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <Building2 className="size-4 text-primary" />
              Payment Method
            </div>
            <div className="mt-3">
              {selectedOrder.payment_method === "transfer" ? (
                <div className="rounded-2xl border border-primary/20 bg-accent/40 p-3 text-xs">
                  <p className="font-bold text-primary">Direct Bank Transfer</p>
                  <p className="mt-1 text-muted-foreground">
                    Bank: Opay Microfinance Bank · Acc: 6428600287
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-secondary/60 p-3 text-xs">
                  <p className="font-bold text-foreground">Pay on Delivery</p>
                  <p className="mt-0.5 text-muted-foreground">Payable via Cash or POS on arrival</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-2">
                <Package className="size-4 text-primary" />
                Items ({selectedOrder.items.length})
              </span>
            </div>

            <div className="mt-3 divide-y divide-border/60">
              {selectedOrder.items.map((it, idx) => (
                <div key={it.id || idx} className="flex items-center gap-3 py-2.5">
                  {it.image_url ? (
                    <img
                      src={it.image_url}
                      alt={it.name}
                      className="size-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="size-12 shrink-0 rounded-xl bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground">{it.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {it.quantity} × {naira(it.price)}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {naira(it.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal, delivery & total */}
            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-foreground">
                  {naira(selectedOrder.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span className="font-mono font-medium text-foreground">
                  {naira(selectedOrder.delivery_fee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-black text-foreground">
                <span>Total Amount</span>
                <span className="font-mono text-base font-bold text-primary">
                  {naira(selectedOrder.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Support Inquiries via WhatsApp and Phone */}
          <div className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Need help with this order?</span>
              <span className="font-mono text-xs font-bold text-primary">{SUPPORT_PHONE}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={getWhatsAppSupportUrl(
                  `Hello JOSPPY GADGETS, I would like to inquire about my order #${selectedOrder.id.slice(0, 8).toUpperCase()}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#25D366]/15 py-2.5 text-xs font-bold text-[#128C7E] transition-colors hover:bg-[#25D366]/25 active:scale-[0.98]"
              >
                <Phone className="size-3.5" />
                <span>WhatsApp</span>
                <ExternalLink className="size-3" />
              </a>
              <a
                href={SUPPORT_PHONE_CALL}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-accent active:scale-[0.98]"
              >
                <Phone className="size-3.5" />
                <span>Call Support</span>
              </a>
            </div>
          </div>

          {/* Back button */}
          <div className="mt-3">
            <button
              onClick={() => setSelectedOrderId(null)}
              className="w-full rounded-2xl bg-secondary py-3 text-center text-xs font-bold text-secondary-foreground"
            >
              Back to All Orders
            </button>
          </div>
        </div>
      </Screen>
    );
  }

  // Orders List Screen
  return (
    <Screen>
      <PageHeader
        title="My Orders"
        back={false}
        right={
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="grid size-9 place-items-center rounded-xl bg-secondary text-secondary-foreground disabled:opacity-50"
            aria-label="Refresh orders"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="px-4 pb-28 pt-3">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading your orders…</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="my-6 rounded-3xl border border-destructive/20 bg-destructive/10 p-5 text-center">
            <AlertCircle className="mx-auto size-7 text-destructive" />
            <h3 className="mt-2 text-sm font-bold text-foreground">Failed to load orders</h3>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 rounded-xl bg-primary px-4 py-2 font-mono text-xs font-bold text-primary-foreground shadow-glow"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <span className="grid size-20 place-items-center rounded-3xl bg-accent text-primary">
              <Package className="size-9" />
            </span>
            <h2 className="mt-4 text-xl font-black text-foreground">No orders yet</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              You haven't placed any orders yet. Discover our top-rated gadgets, power banks, and
              electrical accessories.
            </p>
            <Link
              to="/home"
              className="mt-6 flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
            >
              Start Shopping
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Past Orders ({orders.length})
            </p>

            {orders.map((o) => {
              const dateStr = new Date(o.created_at).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const itemCount = o.items.reduce((s, it) => s + (it.quantity || 1), 0);

              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className="cursor-pointer rounded-3xl border border-border bg-card p-4 transition-all hover:border-primary/40 active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-foreground">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </span>
                      <p className="text-[11px] text-muted-foreground">{dateStr}</p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>

                  {/* Thumbnail Row */}
                  {o.items.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 overflow-hidden">
                      {o.items.slice(0, 4).map((it, idx) => (
                        <div
                          key={it.id || idx}
                          className="size-11 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
                        >
                          {it.image_url ? (
                            <img
                              src={it.image_url}
                              alt={it.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="grid size-full place-items-center text-[10px] text-muted-foreground">
                              {it.name.slice(0, 2)}
                            </div>
                          )}
                        </div>
                      ))}
                      {o.items.length > 4 && (
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary font-mono text-[10px] font-bold text-secondary-foreground">
                          +{o.items.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Footer */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-2.5">
                    <div>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
                      </span>
                      <span className="font-mono text-sm font-bold text-primary">
                        {naira(o.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-primary">
                      <span>View Details</span>
                      <ChevronRight className="size-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Customer Support Card */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Need help with an order?</span>
            <span className="font-mono text-xs font-bold text-primary">{SUPPORT_PHONE}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={getWhatsAppSupportUrl("Hello JOSPPY GADGETS, I need help with my order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#25D366]/15 py-2.5 text-xs font-bold text-[#128C7E] transition-colors hover:bg-[#25D366]/25 active:scale-[0.98]"
            >
              <Phone className="size-3.5" />
              <span>WhatsApp</span>
              <ExternalLink className="size-3" />
            </a>
            <a
              href={SUPPORT_PHONE_CALL}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-accent active:scale-[0.98]"
            >
              <Phone className="size-3.5" />
              <span>Call Support</span>
            </a>
          </div>
        </div>
      </div>
    </Screen>
  );
}
