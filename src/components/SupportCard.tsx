import { Phone, ExternalLink, MessageCircle } from "lucide-react";
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL, getWhatsAppSupportUrl } from "@/lib/catalog";

interface SupportCardProps {
  title?: string;
  description?: string;
  inquiryContext?: string;
  compact?: boolean;
  className?: string;
}

export function SupportCard({
  title = "Customer Support",
  description = "Have questions about an order or products?",
  inquiryContext,
  compact = false,
  className = "",
}: SupportCardProps) {
  const whatsappUrl = getWhatsAppSupportUrl(
    inquiryContext ? `Hello JOSPPY GADGETS, ${inquiryContext}` : undefined,
  );

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <Phone className="size-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-foreground">Support Line</p>
            <p className="font-mono text-[11px] font-semibold text-primary">{SUPPORT_PHONE}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Support"
            className="flex items-center gap-1 rounded-xl bg-[#25D366]/15 px-2.5 py-1.5 text-[11px] font-bold text-[#128C7E] transition-colors hover:bg-[#25D366]/25"
          >
            <MessageCircle className="size-3.5" />
            <span>WhatsApp</span>
          </a>
          <a
            href={SUPPORT_PHONE_CALL}
            aria-label="Call Support"
            className="flex items-center gap-1 rounded-xl bg-secondary px-2.5 py-1.5 text-[11px] font-bold text-secondary-foreground transition-colors hover:bg-accent"
          >
            <Phone className="size-3.5" />
            <span>Call</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border border-border bg-card p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-success/15 text-success">
          <Phone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary/60 px-3.5 py-2">
        <span className="text-[11px] font-medium text-muted-foreground">Phone & WhatsApp:</span>
        <span className="font-mono text-xs font-bold text-primary">{SUPPORT_PHONE}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#25D366]/15 py-2.5 text-xs font-bold text-[#128C7E] transition-colors hover:bg-[#25D366]/25 active:scale-[0.98]"
        >
          <MessageCircle className="size-3.5" />
          <span>WhatsApp Support</span>
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
  );
}
