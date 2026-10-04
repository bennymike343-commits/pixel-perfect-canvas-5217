import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Truck,
  Building2,
  ShoppingBag,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  PackageCheck,
  Phone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Screen, PageHeader } from "@/components/AppShell";
import {
  DELIVERY_FEE,
  STATES,
  naira,
  SUPPORT_PHONE,
  SUPPORT_PHONE_CALL,
  getWhatsAppSupportUrl,
} from "@/lib/catalog";
import { useCart, type CartItem } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — JOSPPY GADGETS" },
      {
        name: "description",
        content: "Complete your order with nationwide delivery across Nigeria.",
      },
      { property: "og:title", content: "Checkout — JOSPPY GADGETS" },
      {
        property: "og:description",
        content: "Complete your order with nationwide delivery across Nigeria.",
      },
    ],
  }),
  component: CheckoutPage,
});

type PaymentMethod = "pod" | "transfer";

type ConfirmedOrder = {
  id: string;
  fullName: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: CartItem[];
};

function getOrCreateGuestUserId(): string {
  const GUEST_KEY = "josppy-guest-uid";
  if (typeof window === "undefined") return "guest-user";
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    } else {
      id = "guest-" + Math.random().toString(36).substring(2, 10);
    }
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

function saveLocalRecentOrder(order: ConfirmedOrder) {
  try {
    const KEY = "josppy-recent-orders";
    const existing = JSON.parse(localStorage.getItem(KEY) || "[]") as ConfirmedOrder[];
    existing.unshift(order);
    localStorage.setItem(KEY, JSON.stringify(existing.slice(0, 20)));
  } catch (err) {
    console.error("Failed to save local recent order", err);
  }
}

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Lagos");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pod");

  // Automatically pre-fill saved customer details if signed in
  useEffect(() => {
    if (!session?.user) return;

    const userEmail = session.user.email || "";
    const meta = session.user.user_metadata || {};

    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          if (data.full_name) setFullName(data.full_name);
          else if (meta["full_name"]) setFullName(meta["full_name"] as string);

          if (data.phone) setPhone(data.phone);
          else if (meta["phone"]) setPhone(meta["phone"] as string);

          if (data.state) setState(data.state);
          if (data.city) setCity(data.city);
          if (data.address) setAddress(data.address);
        } else if (meta) {
          if (meta["full_name"]) setFullName(meta["full_name"] as string);
          if (meta["phone"]) setPhone(meta["phone"] as string);
        }
      });
  }, [session]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const grandTotal = subtotal + DELIVERY_FEE;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs["fullName"] = "Please enter your full name (minimum 3 characters)";
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      errs["phone"] = "Please enter a valid phone or WhatsApp number (at least 10 digits)";
    }

    if (!state.trim()) {
      errs["state"] = "Please select a state";
    }

    if (!city.trim() || city.trim().length < 2) {
      errs["city"] = "Please enter your city or area";
    }

    if (!address.trim() || address.trim().length < 6) {
      errs["address"] = "Please enter your full delivery address and landmark";
    }

    // Check inventory stock limits
    for (const item of items) {
      if (item.stock <= 0) {
        errs["stock"] =
          `"${item.name}" is currently out of stock. Please remove it from your cart.`;
        break;
      }
      if (item.quantity > item.stock) {
        errs["stock"] =
          `Only ${item.stock} unit(s) available for "${item.name}". Please reduce quantity.`;
        break;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty. Please add products first.");
      return;
    }

    if (!validate()) {
      const firstError = Object.values(errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    setSubmitting(true);

    try {
      // Determine user ID: use authenticated session user ID or stable guest UUID
      const userId = session?.user?.id || getOrCreateGuestUserId();

      // 1. Create order record
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          full_name: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          state,
          city: city.trim(),
          subtotal,
          delivery_fee: DELIVERY_FEE,
          total: grandTotal,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation failed:", orderError);
        throw new Error(orderError.message || "Could not create order. Please try again.");
      }

      const generatedId =
        (orderData as { id?: string } | null)?.id ||
        `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // 2. Insert order items
      const orderItemsPayload = items.map((i) => ({
        order_id: generatedId,
        product_id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image_url: i.image_url,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);

      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        // We log error but don't abort since the primary order record was created
      }

      // 3. Invalidate products query cache so stock update reflects across catalog
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      // 4. Save confirmed order locally so user can review immediately
      const newConfirmedOrder: ConfirmedOrder = {
        id: generatedId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        state,
        city: city.trim(),
        address: address.trim(),
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total: grandTotal,
        paymentMethod,
        createdAt: new Date().toISOString(),
        items: [...items],
      };

      saveLocalRecentOrder(newConfirmedOrder);
      setConfirmedOrder(newConfirmedOrder);

      // 5. Clear cart ONLY after successful creation
      clear();
      toast.success("Order placed successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // If order was successfully placed, display confirmation screen
  if (confirmedOrder) {
    return (
      <Screen nav={false}>
        <PageHeader title="Order Confirmed" back={false} />
        <div className="px-4 pb-20 pt-4">
          {/* Success Banner */}
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-success/15 text-success">
              <CheckCircle2 className="size-9" />
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground">
              Order Confirmed!
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you for shopping with JOSPPY GADGETS.
            </p>
            <div className="mt-3 inline-block rounded-xl bg-secondary px-3 py-1.5 font-mono text-xs font-bold text-secondary-foreground">
              Order ID: #{confirmedOrder.id.slice(0, 8).toUpperCase()}
            </div>
          </div>

          {/* Delivery & Payment Information */}
          <div className="mt-4 space-y-3">
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <Truck className="size-4 text-primary" />
                Delivery Information
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="font-bold text-foreground">{confirmedOrder.fullName}</p>
                <p className="text-muted-foreground">{confirmedOrder.phone}</p>
                <p className="text-muted-foreground">
                  {confirmedOrder.address}, {confirmedOrder.city}, {confirmedOrder.state} State
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <Building2 className="size-4 text-primary" />
                Payment Method
              </div>
              {confirmedOrder.paymentMethod === "pod" ? (
                <div className="mt-3 rounded-2xl bg-secondary/70 p-3 text-xs leading-relaxed text-secondary-foreground">
                  <p className="font-bold">Pay on Delivery (Cash or POS)</p>
                  <p className="mt-1 opacity-90">
                    Please prepare {naira(confirmedOrder.total)} to be paid to the delivery courier
                    upon receiving your package.
                  </p>
                </div>
              ) : (
                <div className="mt-3 rounded-2xl bg-accent/60 p-3.5 text-xs text-foreground">
                  <p className="font-bold text-primary">Direct Bank Transfer Instructions</p>
                  <p className="mt-1 text-muted-foreground">
                    Please transfer the total amount to complete dispatch:
                  </p>
                  <div className="mt-2 space-y-1 rounded-xl bg-card p-3 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank:</span>
                      <span className="font-bold">Opay Microfinance Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Name:</span>
                      <span className="font-bold">Josppy Electrical Engineering Services</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Number:</span>
                      <span className="font-bold text-primary">6428600287</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-primary">{naira(confirmedOrder.total)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    After transfer, send your proof of payment via WhatsApp to{" "}
                    <a
                      href={getWhatsAppSupportUrl(
                        `Hello JOSPPY GADGETS, here is my proof of payment for order #${confirmedOrder.id.slice(0, 8).toUpperCase()}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-primary underline"
                    >
                      {SUPPORT_PHONE}
                    </a>{" "}
                    or call{" "}
                    <a href={SUPPORT_PHONE_CALL} className="font-bold text-foreground underline">
                      {SUPPORT_PHONE}
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>

            {/* Items Summary */}
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <PackageCheck className="size-4 text-primary" />
                Items Ordered ({confirmedOrder.items.length})
              </div>
              <div className="mt-3 divide-y divide-border">
                {confirmedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2.5">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="size-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="size-12 rounded-xl bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{item.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {item.quantity} × {naira(item.price)}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {naira(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{naira(confirmedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-mono">{naira(confirmedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-foreground">
                  <span>Total Paid</span>
                  <span className="font-mono text-primary">{naira(confirmedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Order Confirmation Support Actions */}
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Questions about this order?
                </span>
                <span className="font-mono text-xs font-bold text-primary">{SUPPORT_PHONE}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={getWhatsAppSupportUrl(
                    `Hello JOSPPY GADGETS, I just placed order #${confirmedOrder.id.slice(0, 8).toUpperCase()}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#25D366]/15 py-2.5 text-xs font-bold text-[#128C7E] transition-colors hover:bg-[#25D366]/25 active:scale-[0.98]"
                >
                  <Phone className="size-3.5" />
                  <span>WhatsApp</span>
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

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/home"
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-center font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98]"
            >
              Continue Shopping
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/orders"
              className="flex items-center justify-center rounded-2xl border border-input bg-card py-3.5 text-center text-sm font-bold text-foreground transition-colors hover:bg-accent"
            >
              View Order History
            </Link>
          </div>
        </div>
      </Screen>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <Screen>
        <PageHeader title="Checkout" />
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <span className="grid size-20 place-items-center rounded-3xl bg-accent text-primary">
            <ShoppingBag className="size-9" />
          </span>
          <h2 className="mt-4 text-xl font-black">Your cart is empty</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/home"
            className="mt-6 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Start Shopping
          </Link>
        </div>
      </Screen>
    );
  }

  return (
    <Screen nav={false}>
      <PageHeader title="Checkout" />

      <form onSubmit={handlePlaceOrder} className="px-4 pb-36 pt-3">
        {/* Errors Alert */}
        {errors["stock"] && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errors["stock"]}</span>
          </div>
        )}

        {/* 1. Customer Information & Delivery Address */}
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="grid size-6 place-items-center rounded-lg bg-accent font-mono text-xs font-bold text-primary">
              1
            </span>
            <h2 className="text-sm font-black tracking-tight">Delivery Address</h2>
          </div>

          <div className="mt-3.5 space-y-3">
            {session?.user && (
              <div className="flex items-center gap-2 rounded-2xl bg-accent/60 p-2.5 text-xs text-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                <span className="truncate text-[11px]">
                  Logged in as <strong className="font-semibold">{session.user.email}</strong> ·
                  Saved details auto-filled
                </span>
              </div>
            )}
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Joshua Sunday"
                className={`mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary ${
                  errors["fullName"] ? "border-destructive bg-destructive/5" : "border-input"
                }`}
              />
              {errors["fullName"] && (
                <p className="mt-1 text-[11px] text-destructive">{errors["fullName"]}</p>
              )}
            </div>

            {/* Phone / WhatsApp */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                WhatsApp / Phone Number <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0801 234 5678"
                  className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary ${
                    errors["phone"] ? "border-destructive bg-destructive/5" : "border-input"
                  }`}
                />
                <Phone className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
              </div>
              {errors["phone"] && (
                <p className="mt-1 text-[11px] text-destructive">{errors["phone"]}</p>
              )}
            </div>

            {/* State and City row */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* State Dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  State <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  City / Area <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Ikeja"
                  className={`mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary ${
                    errors["city"] ? "border-destructive bg-destructive/5" : "border-input"
                  }`}
                />
                {errors["city"] && (
                  <p className="mt-1 text-[11px] text-destructive">{errors["city"]}</p>
                )}
              </div>
            </div>

            {/* Full Street Address */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Delivery / Street Address <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, house number, nearest bus stop or landmark…"
                className={`mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary ${
                  errors["address"] ? "border-destructive bg-destructive/5" : "border-input"
                }`}
              />
              {errors["address"] && (
                <p className="mt-1 text-[11px] text-destructive">{errors["address"]}</p>
              )}
            </div>
          </div>
        </section>

        {/* 2. Payment Method */}
        <section className="mt-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="grid size-6 place-items-center rounded-lg bg-accent font-mono text-xs font-bold text-primary">
              2
            </span>
            <h2 className="text-sm font-black tracking-tight">Payment Method</h2>
          </div>

          <div className="mt-3.5 space-y-2">
            {/* Pay on Delivery Option */}
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
                paymentMethod === "pod"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="pod"
                checked={paymentMethod === "pod"}
                onChange={() => setPaymentMethod("pod")}
                className="mt-1 text-primary accent-primary"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Truck className="size-4 text-primary" />
                  <span>Pay on Delivery</span>
                  <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-[9.5px] font-bold text-success">
                    Popular
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pay via Cash or POS transfer when our courier delivers to your doorstep.
                </p>
              </div>
            </label>

            {/* Direct Bank Transfer Option */}
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
                paymentMethod === "transfer"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="transfer"
                checked={paymentMethod === "transfer"}
                onChange={() => setPaymentMethod("transfer")}
                className="mt-1 text-primary accent-primary"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Building2 className="size-4 text-primary" />
                  <span>Direct Bank Transfer</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fast bank transfer directly to our company account before delivery.
                </p>

                {paymentMethod === "transfer" && (
                  <div className="mt-3 rounded-xl border border-primary/20 bg-card p-3 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank:</span>
                      <span className="font-bold">Opay Microfinance Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Name:</span>
                      <span className="font-bold">Josppy Electrical Engineering Services</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Number:</span>
                      <span className="font-bold text-primary">6428600287</span>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </section>

        {/* 3. Order Summary */}
        <section className="mt-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-lg bg-accent font-mono text-xs font-bold text-primary">
                3
              </span>
              <h2 className="text-sm font-black tracking-tight">Order Summary</h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{items.length} item(s)</span>
          </div>

          {/* Items preview list */}
          <div className="mt-3 divide-y divide-border/60">
            {items.map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-2.5">
                {i.image_url ? (
                  <img
                    src={i.image_url}
                    alt={i.name}
                    className="size-12 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="size-12 shrink-0 rounded-xl bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{i.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Qty: {i.quantity} × {naira(i.price)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {naira(i.price * i.quantity)}
                  </span>
                  {i.quantity > i.stock && (
                    <p className="text-[10px] text-destructive">Max: {i.stock}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-foreground">{naira(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Nationwide Delivery</span>
              <span className="font-mono font-semibold text-foreground">{naira(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-black text-foreground">
              <span>Grand Total</span>
              <span className="font-mono text-base font-bold text-primary">
                {naira(grandTotal)}
              </span>
            </div>
          </div>
        </section>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          <span>Genuine products · Inspected & tested before delivery</span>
        </div>

        {/* Fixed bottom checkout bar */}
        <div className="glass fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border p-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Placing your order…</span>
              </>
            ) : (
              <>
                <span>Place Order · {naira(grandTotal)}</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Screen>
  );
}
