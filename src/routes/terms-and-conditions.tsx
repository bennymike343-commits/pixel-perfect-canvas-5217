import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  CreditCard,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Screen, PageHeader } from "@/components/AppShell";
import {
  SUPPORT_PHONE,
  SUPPORT_PHONE_CALL,
  getWhatsAppSupportUrl,
  naira,
  DELIVERY_FEE,
} from "@/lib/catalog";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — JOSPPY GADGETS" },
      {
        name: "description",
        content:
          "Read the official Terms & Conditions governing orders, payments, delivery, cancellations, and customer accounts at JOSPPY GADGETS.",
      },
      { property: "og:title", content: "Terms & Conditions — JOSPPY GADGETS" },
      {
        property: "og:description",
        content:
          "Official Terms & Conditions governing orders, payments, and delivery at JOSPPY GADGETS.",
      },
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  return (
    <Screen>
      <PageHeader title="Terms & Conditions" back />

      <div className="space-y-6 px-4 py-5 text-sm leading-relaxed text-foreground">
        {/* Intro Banner */}
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <FileText className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Terms & Conditions</h2>
              <p className="text-xs text-muted-foreground">
                Please read these terms before purchasing or registering on JOSPPY GADGETS.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Overview & Acceptance */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
            1. Agreement to Terms
          </h3>
          <p className="text-xs text-muted-foreground">
            By accessing, browsing, registering an account, or placing an order on JOSPPY GADGETS,
            you agree to be bound by these Terms and Conditions and our related policies. If you do
            not agree to these terms, please do not use the store.
          </p>
        </section>

        {/* Section 2: Account Registration & Guest Checkout */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
            2. Customer Account Registration & Guest Checkout
          </h3>
          <p className="text-xs text-muted-foreground">
            Customers may browse and purchase items as a registered user or via guest checkout.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              When registering an account, you must provide accurate, current, and complete personal
              information (full name, valid email, and active Nigerian phone number).
            </li>
            <li>
              You are responsible for safeguarding your login credentials and are accountable for
              all activities conducted through your account.
            </li>
            <li>
              Ordinary registered customers receive standard user access. Administrative privileges
              are strictly reserved for authorized store personnel.
            </li>
            <li>
              Guest checkout is fully supported for customers who prefer completing purchases
              without creating a permanent account profile.
            </li>
          </ul>
        </section>

        {/* Section 3: Product Information & Pricing */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
            3. Product Information, Pricing & Availability
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              <strong>Naira Currency:</strong> All prices displayed on JOSPPY GADGETS are
              denominated in Nigerian Naira (₦).
            </li>
            <li>
              <strong>Accuracy:</strong> We endeavor to display accurate product names,
              specifications, descriptions, and photographs. However, slight variations in
              manufacturer packaging or color may occur.
            </li>
            <li>
              <strong>Stock & Availability:</strong> All orders are subject to product availability.
              If an item becomes out of stock after your order is submitted, our support team will
              notify you promptly to offer a replacement, backorder, or cancellation.
            </li>
            <li>
              <strong>Price Adjustments:</strong> Prices may be adjusted over time without prior
              notice; however, any confirmed order will be honored at the price quoted at the time
              of order placement.
            </li>
          </ul>
        </section>

        {/* Section 4: Ordering & Payment Methods */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <CreditCard className="size-4" />
            <span>4. Ordering & Payment Options</span>
          </div>
          <p className="text-xs text-muted-foreground">
            JOSPPY GADGETS provides two convenient, reliable payment options:
          </p>
          <div className="space-y-2.5 text-xs">
            <div className="rounded-2xl border border-border bg-secondary/30 p-3.5">
              <span className="font-bold text-foreground">Option A: Pay on Delivery (POD)</span>
              <p className="mt-1 text-muted-foreground">
                Pay with cash or POS transfer upon physical receipt and inspection of your parcel
                from the delivery courier. Available across supported locations.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/30 p-3.5">
              <span className="font-bold text-foreground">Option B: Direct Bank Transfer</span>
              <p className="mt-1 text-muted-foreground">
                Transfer the exact order total to our official store account:
              </p>
              <div className="mt-2 rounded-xl bg-card p-2.5 font-mono text-[11px] space-y-1 border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-bold text-foreground">Opay Microfinance Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-bold text-foreground">
                    Josppy Electrical Engineering Services
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-bold text-primary">6428600287</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                After making the transfer, please send your payment receipt/proof via WhatsApp to{" "}
                <span className="font-bold text-foreground">{SUPPORT_PHONE}</span> for prompt
                confirmation and dispatch.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Order Cancellation */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
            5. Order Cancellation
          </h3>
          <p className="text-xs text-muted-foreground">
            You may request cancellation of an order before it has been dispatched from our store
            facility.
          </p>
          <p className="text-xs text-muted-foreground">
            To cancel an order, contact our support team immediately via WhatsApp or telephone call
            with your Order ID. Once an item is dispatched to a transit courier, standard return and
            delivery procedures apply.
          </p>
        </section>

        {/* Section 6: Delivery & Customer Responsibilities */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Truck className="size-4" />
            <span>6. Delivery & Customer Responsibilities</span>
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              Standard nationwide delivery charge is <strong>{naira(DELIVERY_FEE)}</strong> across
              all 36 States and the FCT.
            </li>
            <li>
              <strong>Customer Address Accuracy:</strong> You are responsible for providing an
              accurate street address, state, city, and an active phone number where the courier can
              reach you.
            </li>
            <li>
              <strong>Availability for Delivery:</strong> The customer or an authorized
              representative must be present to receive the goods and complete payment (if POD).
            </li>
            <li>
              If delivery cannot be completed due to incorrect address information, inaccessible
              location, or unanswered calls, repeat delivery attempts may incur courier coordination
              charges.
            </li>
          </ul>
        </section>

        {/* Section 7: Limitation of Liability */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <AlertTriangle className="size-4" />
            <span>7. Limitation of Liability</span>
          </div>
          <p className="text-xs text-muted-foreground">
            To the fullest extent permitted by applicable law:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              JOSPPY GADGETS shall not be liable for any indirect, incidental, or consequential
              damages resulting from product misuse, improper electrical installation, irregular
              voltage spikes or surges, or delayed delivery due to transit conditions or unforeseen
              events.
            </li>
            <li>
              Our total liability in connection with any product purchased through the store is
              strictly limited to the amount paid for that specific item.
            </li>
          </ul>
        </section>

        {/* Section 8: Support & Inquiries */}
        <section className="space-y-4 rounded-3xl border border-primary/30 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Phone className="size-4" />
            <span>8. Official Support Contact</span>
          </div>
          <p className="text-xs text-muted-foreground">
            For any inquiries, clarifications regarding these Terms & Conditions, or order
            assistance, please reach out to JOSPPY GADGETS:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={getWhatsAppSupportUrl(
                "Hello JOSPPY GADGETS, I have a question regarding your store Terms & Conditions.",
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
          <Link to="/delivery-policy" className="hover:text-primary underline">
            Delivery Policy
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
