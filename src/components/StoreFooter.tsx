import { Link } from "@tanstack/react-router";
import { ShieldCheck, Truck, RotateCcw, FileText, Phone } from "lucide-react";
import {
  SUPPORT_PHONE,
  SUPPORT_PHONE_CALL,
  getWhatsAppSupportUrl,
  naira,
  DELIVERY_FEE,
} from "@/lib/catalog";
import { Logo } from "@/components/AppShell";

export function StoreFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-card/60 px-4 py-8 text-foreground">
      {/* Brand header */}
      <div className="flex flex-col items-start gap-2">
        <Logo />
        <p className="text-xs text-muted-foreground">
          Your trusted Nigerian store for genuine electrical accessories, solar power systems,
          inverters, chargers, and mobile gadgets.
        </p>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-2 rounded-2xl bg-secondary/60 p-2.5">
          <Truck className="size-4 shrink-0 text-primary" />
          <span className="leading-tight">All 36 States + FCT ({naira(DELIVERY_FEE)})</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-secondary/60 p-2.5">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          <span className="leading-tight">Tested & Genuine Products</span>
        </div>
      </div>

      {/* Information & Legal Links */}
      <div className="mt-6 border-t border-border/70 pt-5">
        <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Customer & Legal Information
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Link
            to="/privacy-policy"
            className="flex items-center gap-1.5 rounded-xl bg-background/80 p-2.5 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
          >
            <ShieldCheck className="size-3.5 text-primary" />
            <span>Privacy Policy</span>
          </Link>
          <Link
            to="/terms-and-conditions"
            className="flex items-center gap-1.5 rounded-xl bg-background/80 p-2.5 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
          >
            <FileText className="size-3.5 text-primary" />
            <span>Terms & Conditions</span>
          </Link>
          <Link
            to="/delivery-policy"
            className="flex items-center gap-1.5 rounded-xl bg-background/80 p-2.5 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
          >
            <Truck className="size-3.5 text-primary" />
            <span>Delivery Policy</span>
          </Link>
          <Link
            to="/returns-policy"
            className="flex items-center gap-1.5 rounded-xl bg-background/80 p-2.5 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
          >
            <RotateCcw className="size-3.5 text-primary" />
            <span>Returns & Refund</span>
          </Link>
        </div>
      </div>

      {/* Direct Customer Support Block */}
      <div className="mt-6 rounded-3xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Customer Support</span>
          <span className="font-mono text-xs font-bold text-primary">{SUPPORT_PHONE}</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Have questions regarding an order, product compatibility, delivery, or return? Reach out
          to our dedicated support team.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={getWhatsAppSupportUrl("Hello JOSPPY GADGETS, I need customer support.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#25D366]/15 py-2.5 text-xs font-bold text-[#128C7E] transition-colors hover:bg-[#25D366]/25 active:scale-[0.98]"
          >
            <Phone className="size-3.5" />
            <span>WhatsApp Support</span>
          </a>
          <a
            href={SUPPORT_PHONE_CALL}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-accent active:scale-[0.98]"
          >
            <Phone className="size-3.5" />
            <span>Call {SUPPORT_PHONE}</span>
          </a>
        </div>
      </div>

      <div className="mt-6 text-center text-[10px] text-muted-foreground">
        © {new Date().getFullYear()} JOSPPY GADGETS. All rights reserved.
      </div>
    </footer>
  );
}
