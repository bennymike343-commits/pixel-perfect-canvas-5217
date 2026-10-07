import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, MapPin, Clock, ShieldCheck, Phone, AlertCircle, ExternalLink } from "lucide-react";
import { Screen, PageHeader } from "@/components/AppShell";
import {
  SUPPORT_PHONE,
  SUPPORT_PHONE_CALL,
  getWhatsAppSupportUrl,
  naira,
  DELIVERY_FEE,
  STATES,
} from "@/lib/catalog";

export const Route = createFileRoute("/delivery-policy")({
  head: () => ({
    meta: [
      { title: "Delivery Policy — JOSPPY GADGETS" },
      {
        name: "description",
        content:
          "Learn about JOSPPY GADGETS nationwide delivery across all 36 Nigerian states and Abuja at ₦2,500 flat, shipping timelines, and address requirements.",
      },
      { property: "og:title", content: "Delivery Policy — JOSPPY GADGETS" },
      {
        property: "og:description",
        content: "Nationwide delivery across all 36 Nigerian states and Abuja at ₦2,500 flat.",
      },
    ],
  }),
  component: DeliveryPolicyPage,
});

function DeliveryPolicyPage() {
  return (
    <Screen>
      <PageHeader title="Delivery Policy" back />

      <div className="space-y-6 px-4 py-5 text-sm leading-relaxed text-foreground">
        {/* Intro Banner */}
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <Truck className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Nationwide Delivery Policy</h2>
              <p className="text-xs text-muted-foreground">
                Flat shipping rate of {naira(DELIVERY_FEE)} across Nigeria.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Delivery Fee */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="size-4" />
            <span>1. Standard Delivery Fee</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-primary/10 p-4 border border-primary/20">
            <div>
              <span className="text-xs font-semibold text-foreground">
                Standard Nationwide Delivery
              </span>
              <p className="text-[11px] text-muted-foreground">
                Covers all supported items and checkout parcels
              </p>
            </div>
            <span className="font-mono text-lg font-black text-primary">{naira(DELIVERY_FEE)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Any additional delivery charges, if applicable (such as exceptional overweight cargo or
            remote off-grid locations), should only be applied when clearly communicated before
            order confirmation.
          </p>
        </section>

        {/* Section 2: Address Requirements */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <MapPin className="size-4" />
            <span>2. Delivery Address Requirements</span>
          </div>
          <p className="text-xs text-muted-foreground">
            To ensure your parcel arrives safely and without unnecessary delay, please verify that
            your checkout details include:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              <strong>Recipient Full Name:</strong> The individual who will physically receive and
              inspect the order.
            </li>
            <li>
              <strong>Active Phone Number:</strong> A reachable Nigerian telephone number. Couriers
              typically call before arrival to confirm that you are available.
            </li>
            <li>
              <strong>Detailed Street Address:</strong> Street name, house/building number, and
              prominent nearby landmark (e.g., opposite a known junction, church, mosque, or
              school).
            </li>
            <li>
              <strong>State and City:</strong> Accurate selection of your state and city from our
              checkout options.
            </li>
          </ul>
        </section>

        {/* Section 3: Supported States */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
            3. Supported Nigerian States & FCT
          </h3>
          <p className="text-xs text-muted-foreground">
            JOSPPY GADGETS delivers to customers across all 36 States and the Federal Capital
            Territory (FCT):
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {STATES.map((s) => (
              <span
                key={s}
                className="rounded-lg border border-border bg-secondary/60 px-2 py-1 font-mono text-[10px] text-secondary-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Section 4: Timelines & Variations */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Clock className="size-4" />
            <span>4. Delivery Timelines & Circumstances</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Delivery timelines may vary depending on destination location, regional logistics
            networks, courier schedules, weather conditions, and road transit circumstances.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              <strong>Intra-state Deliveries:</strong> Typically dispatched rapidly once verified.
            </li>
            <li>
              <strong>Interstate Shipments:</strong> Dispatched via reliable logistics channels with
              transit tracking updates provided to the customer.
            </li>
            <li>
              <strong>Unforeseen Delays:</strong> In rare cases of public holidays, fuel scarcity,
              adverse weather, or interstate transit disruptions, delivery times may be extended.
              Our support team will keep you informed.
            </li>
          </ul>
        </section>

        {/* Section 5: Tracking & Support */}
        <section className="space-y-4 rounded-3xl border border-primary/30 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Phone className="size-4" />
            <span>5. Delivery Questions & Order Tracking</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Customers may track existing orders directly via the{" "}
            <Link to="/orders" className="font-bold text-primary underline">
              Orders
            </Link>{" "}
            page, or contact our support team at any time for delivery questions:
          </p>
          <div className="rounded-2xl border border-border bg-secondary/30 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Direct Telephone:</span>
              <a href={SUPPORT_PHONE_CALL} className="font-mono font-bold text-primary underline">
                {SUPPORT_PHONE}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">WhatsApp Chat:</span>
              <a
                href={getWhatsAppSupportUrl(
                  "Hello JOSPPY GADGETS, I have a delivery inquiry regarding my order.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold text-[#128C7E] underline"
              >
                +2349061848821
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={getWhatsAppSupportUrl(
                "Hello JOSPPY GADGETS, I would like to inquire about delivery.",
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
              <span>Call {SUPPORT_PHONE}</span>
            </a>
          </div>
        </section>

        {/* Quick Links Footer */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-muted-foreground">
          <Link to="/privacy-policy" className="hover:text-primary underline">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link to="/terms-and-conditions" className="hover:text-primary underline">
            Terms & Conditions
          </Link>
          <span>·</span>
          <Link to="/returns-policy" className="hover:text-primary underline">
            Returns & Refund Policy
          </Link>
        </div>
      </div>
    </Screen>
  );
}
