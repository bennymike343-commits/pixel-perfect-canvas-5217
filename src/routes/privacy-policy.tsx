import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Database,
  UserCheck,
  Server,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Screen, PageHeader } from "@/components/AppShell";
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL, getWhatsAppSupportUrl } from "@/lib/catalog";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — JOSPPY GADGETS" },
      {
        name: "description",
        content:
          "Read how JOSPPY GADGETS collects, uses, and safeguards customer data for orders and customer support across Nigeria.",
      },
      { property: "og:title", content: "Privacy Policy — JOSPPY GADGETS" },
      {
        property: "og:description",
        content:
          "Read how JOSPPY GADGETS collects, uses, and safeguards customer data for orders and customer support.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <Screen>
      <PageHeader title="Privacy Policy" back />

      <div className="space-y-6 px-4 py-5 text-sm leading-relaxed text-foreground">
        {/* Intro Banner */}
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                JOSPPY GADGETS Privacy Policy
              </h2>
              <p className="text-xs text-muted-foreground">
                Your privacy and data protection are fundamental to our store operations.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Database className="size-4" />
            <span>1. Information We Collect</span>
          </div>
          <p className="text-muted-foreground text-xs">
            To provide a seamless shopping experience, fulfill deliveries across Nigeria, and assist
            you with inquiries, JOSPPY GADGETS collects the following customer details:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              <strong className="text-foreground">Full Name:</strong> To identify you as the
              customer and address delivery parcels correctly.
            </li>
            <li>
              <strong className="text-foreground">Email Address:</strong> Used for account login,
              password management, and sending order confirmation updates.
            </li>
            <li>
              <strong className="text-foreground">Phone Number:</strong> Critical for order
              coordination, dispatch riders, delivery status alerts, and WhatsApp assistance.
            </li>
            <li>
              <strong className="text-foreground">Delivery Address, State, and City:</strong>{" "}
              Essential for transporting and dispatching ordered gadgets to your doorstep or pickup
              point across Nigerian states.
            </li>
            <li>
              <strong className="text-foreground">Order Information:</strong> Items purchased,
              quantities, pricing in Nigerian Naira (₦), chosen payment method (Pay on Delivery or
              Bank Transfer), and order fulfillment status.
            </li>
            <li>
              <strong className="text-foreground">Customer Support Communications:</strong>{" "}
              Messages, feedback, or delivery questions sent via WhatsApp or telephone calls.
            </li>
            <li>
              <strong className="text-foreground">App Usage & Technical Data:</strong> Browser
              session information, device viewport data, and basic diagnostic information to
              maintain responsive shopping on mobile and desktop devices.
            </li>
          </ul>
        </section>

        {/* Section 2: Why and How Information Is Used */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <UserCheck className="size-4" />
            <span>2. How We Use Your Information</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We use your personal data strictly for lawful e-commerce purposes, specifically:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>Processing, verifying, and dispatching your orders accurately.</li>
            <li>
              Communicating with you regarding delivery timing, dispatch status, or order changes.
            </li>
            <li>Verifying proof of payment when you choose Direct Bank Transfer.</li>
            <li>Providing prompt customer care and technical support through our support line.</li>
            <li>
              Maintaining account profiles for returning customers so you do not have to retype
              shipping details on each checkout.
            </li>
            <li>
              Detecting and preventing fraudulent orders or abusive activity on the store platform.
            </li>
          </ul>
        </section>

        {/* Section 3: No Sale of Customer Information */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Lock className="size-4" />
            <span>3. No Selling of Customer Data</span>
          </div>
          <div className="rounded-2xl bg-accent/40 p-3.5 text-xs text-foreground">
            <p className="font-semibold text-primary">Strict Privacy Commitment:</p>
            <p className="mt-1 text-muted-foreground">
              JOSPPY GADGETS does not sell, rent, trade, or monetize your personal information to
              third-party advertisers or external marketing brokers. Your data is used exclusively
              to fulfill your orders and provide store support.
            </p>
          </div>
        </section>

        {/* Section 4: Third-Party Infrastructure */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Server className="size-4" />
            <span>4. Third-Party Services & Storage</span>
          </div>
          <p className="text-xs text-muted-foreground">
            To provide reliable cloud infrastructure and secure authentication, JOSPPY GADGETS
            utilizes reputable enterprise providers:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>
              <strong className="text-foreground">Supabase / PostgreSQL Cloud Database:</strong>{" "}
              Used to securely store user credentials, product catalog, customer delivery profiles,
              and orders behind strict Row-Level Security (RLS) policies.
            </li>
            <li>
              <strong className="text-foreground">Logistics & Courier Partners:</strong> Necessary
              shipping information (recipient name, phone number, destination address) is shared
              only with the assigned delivery driver or courier handling your parcel.
            </li>
            <li>
              <strong className="text-foreground">Opay Microfinance Bank Transfer:</strong> For
              orders paid via bank transfer, transaction references are verified against our bank
              account records. We do not store debit or credit card PINs or online banking passwords
              on our servers.
            </li>
          </ul>
        </section>

        {/* Section 5: Security & Account Protection */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="size-4" />
            <span>5. Account Security & Protection</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We implement database-level access controls and encrypted authentication to safeguard
            your information.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs text-foreground/90">
            <li>Passphrases are salted and hashed cryptographically before storage.</li>
            <li>
              Access to customer records is restricted: only authorized store administration can
              review orders for fulfillment.
            </li>
            <li>
              You are responsible for keeping your login credentials confidential. If you suspect
              unauthorized access to your account, please contact support immediately.
            </li>
          </ul>
        </section>

        {/* Section 6: Data Retention & Deletion */}
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Trash2 className="size-4" />
            <span>6. Data Retention & Deletion</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We retain customer account and order records for as long as necessary to fulfill
            purchases, maintain tax/accounting records for business operations, and resolve
            potential customer return inquiries.
          </p>
          <p className="text-xs text-muted-foreground">
            If you wish to update your profile details or request the deletion of your customer
            account, contact our customer support team via WhatsApp or telephone call. We will
            review and process your request in accordance with applicable requirements.
          </p>
        </section>

        {/* Section 7: Contact Us */}
        <section className="space-y-4 rounded-3xl border border-primary/30 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <Mail className="size-4" />
            <span>7. Contact JOSPPY GADGETS Regarding Privacy</span>
          </div>
          <p className="text-xs text-muted-foreground">
            If you have any questions, concerns, or requests regarding this Privacy Policy or how
            your personal information is handled, please contact us directly:
          </p>
          <div className="rounded-2xl border border-border bg-secondary/30 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Support Telephone:</span>
              <a href={SUPPORT_PHONE_CALL} className="font-mono font-bold text-primary underline">
                {SUPPORT_PHONE}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">WhatsApp Channel:</span>
              <a
                href={getWhatsAppSupportUrl(
                  "Hello JOSPPY GADGETS, I have a question regarding my privacy and personal data.",
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
                "Hello JOSPPY GADGETS, I have a question regarding my privacy.",
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
          <Link to="/terms-and-conditions" className="hover:text-primary underline">
            Terms & Conditions
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
