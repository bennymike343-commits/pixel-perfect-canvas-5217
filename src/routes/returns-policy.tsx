import { createFileRoute, Link } from "@tanstack/react-router";
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Phone,
  FileQuestion,
  ExternalLink,
} from "lucide-react";
import { Screen, PageHeader } from "@/components/AppShell";
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL, getWhatsAppSupportUrl } from "@/lib/catalog";

export const Route = createFileRoute("/returns-policy")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — JOSPPY GADGETS" },
      {
        name: "description",
        content:
          "Read JOSPPY GADGETS guidelines for returns, replacements, faulty or incorrect products, and refund procedures across Nigeria.",
      },
      { property: "og:title", content: "Returns & Refund Policy — JOSPPY GADGETS" },
      {
        property: "og:description",
        content:
          "Guidelines for returns, replacements, faulty or incorrect products, and refunds at JOSPPY GADGETS.",
      },
    ],
  }),
  component: ReturnsPolicyPage,
});

function ReturnsPolicyPage() {
  return (
    <Screen>
      <PageHeader title="Returns & Refunds" back />

      <div className="space-y-6 px-4 py-5 text-sm leading-relaxed text-foreground">
        {/* Intro Banner */}
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <RotateCcw className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Returns & Refund Policy</h2>
              <p className="text-xs text-muted-foreground">
                Fair, transparent procedures for damaged, faulty, or incorrect items.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Damaged, Faulty, or Incorrect Items */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <AlertTriangle className="size-4" />
            <span>1. Damaged, Faulty, or Wrong Items Received</span>
          </div>
          <p className="text-xs text-muted-foreground">
            At JOSPPY GADGETS, we test products and package them carefully. However, if your package
            arrives with an issue:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              <strong>Damaged in Transit:</strong> If the outer package or gadget displays physical
              damage upon delivery, please document the condition with clear photos and notify
              support promptly.
            </li>
            <li>
              <strong>Faulty Products:</strong> If an electronic or electrical device fails to power
              on or perform its advertised function, reach out to our team immediately for
              troubleshooting and return evaluation.
            </li>
            <li>
              <strong>Incorrect Product Received:</strong> If the model, color, or type delivered
              differs from what you ordered, we will arrange to replace it with the correct item.
            </li>
          </ul>
        </section>

        {/* Section 2: Contact Support Before Returning */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Phone className="size-4" />
            <span>2. Contact Support Prior to Any Return</span>
          </div>
          <div className="rounded-2xl bg-amber-500/10 p-3.5 text-xs border border-amber-500/20 text-foreground">
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              Important Instruction:
            </p>
            <p className="mt-1 text-muted-foreground">
              Do not send an item back to a courier or transit hub without contacting JOSPPY GADGETS
              customer support first. Unauthorized packages cannot be tracked or processed for
              refund.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            To initiate an inspection, contact our support team with:
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-foreground/90">
            <li>Your JOSPPY GADGETS Order ID (e.g., from your order history).</li>
            <li>Clear photos or a brief video displaying the issue or fault.</li>
            <li>A concise description of what occurred.</li>
          </ol>
        </section>

        {/* Section 3: Condition Required for Returns */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <CheckCircle2 className="size-4" />
            <span>3. Condition Required for Returned Products</span>
          </div>
          <p className="text-xs text-muted-foreground">
            To qualify for an exchange, replacement, or refund:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              The item must be in its original packaging along with all bundled accessories (cables,
              manuals, plugs, adapters).
            </li>
            <li>
              The product must not bear evidence of physical tampering, unauthorized dismantling, or
              altered internal circuitry.
            </li>
            <li>Serial numbers or identification marks must remain legible and intact.</li>
          </ul>
        </section>

        {/* Section 4: Situations Where Returns Are Not Accepted */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-destructive">
            <XCircle className="size-4" />
            <span>4. Non-Returnable Situations</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Returns, replacements, or refunds will not be accepted under the following
            circumstances:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              Damage caused by severe electrical power surges, high voltage fluctuations, or
              improper wiring/phase connection.
            </li>
            <li>
              Physical damage resulting from dropping, water submersion (unless device is rated
              waterproof), or external force.
            </li>
            <li>Attempted unauthorized repairs or modification by third-party technicians.</li>
            <li>Normal wear and tear resulting from prolonged usage.</li>
            <li>
              Change of mind after an item has been unboxed, used, and the product is functioning
              strictly according to manufacturer specifications.
            </li>
          </ul>
        </section>

        {/* Section 5: Return Timeframes & Instructions */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <FileQuestion className="size-4" />
            <span>5. Return Timeframes & Instructions</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Because return arrangements depend on the product category, courier logistics, and your
            state location, please contact JOSPPY GADGETS support for the applicable return
            instructions and dispatch drop-off guidance.
          </p>
        </section>

        {/* Section 6: Refund Handling */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
            6. Refund Handling
          </h3>
          <p className="text-xs text-muted-foreground">
            Once a returned item is received and inspected at our inspection station:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              <strong>Direct Replacement:</strong> If a replacement is requested and stock is
              available, a new unit will be dispatched promptly.
            </li>
            <li>
              <strong>Bank Transfer Refund:</strong> If a refund is approved, funds will be refunded
              directly to the customer's verified Nigerian bank account via electronic transfer.
            </li>
          </ul>
        </section>

        {/* Section 7: Support Contact */}
        <section className="space-y-4 rounded-3xl border border-primary/30 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Phone className="size-4" />
            <span>7. Contact Support for Returns</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Need help with a product, return, or refund? Our team is available on WhatsApp and
            phone:
          </p>
          <div className="rounded-2xl border border-border bg-secondary/30 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Customer Support Line:</span>
              <a href={SUPPORT_PHONE_CALL} className="font-mono font-bold text-primary underline">
                {SUPPORT_PHONE}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">WhatsApp Return Desk:</span>
              <a
                href={getWhatsAppSupportUrl(
                  "Hello JOSPPY GADGETS, I need assistance with a return or refund.",
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
                "Hello JOSPPY GADGETS, I need to discuss a return or refund.",
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
          <Link to="/delivery-policy" className="hover:text-primary underline">
            Delivery Policy
          </Link>
        </div>
      </div>
    </Screen>
  );
}
