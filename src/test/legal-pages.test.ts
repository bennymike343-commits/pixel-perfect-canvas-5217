import { describe, expect, it } from "vitest";
import {
  SUPPORT_PHONE,
  SUPPORT_PHONE_CALL,
  SUPPORT_WHATSAPP_NUMBER,
  SUPPORT_WHATSAPP_LINK,
  getWhatsAppSupportUrl,
  DELIVERY_FEE,
  naira,
  STATES,
} from "@/lib/catalog";
import { Route as PrivacyRoute } from "@/routes/privacy-policy";
import { Route as TermsRoute } from "@/routes/terms-and-conditions";
import { Route as DeliveryRoute } from "@/routes/delivery-policy";
import { Route as ReturnsRoute } from "@/routes/returns-policy";

describe("JOSPPY GADGETS Customer Information & Legal Pages", () => {
  it("exports valid TanStack Router routes with accurate meta titles and descriptions", () => {
    expect(PrivacyRoute).toBeDefined();
    expect(TermsRoute).toBeDefined();
    expect(DeliveryRoute).toBeDefined();
    expect(ReturnsRoute).toBeDefined();

    // Check Privacy Policy meta
    type HeadMetaItem = { title?: string; name?: string; content?: string; property?: string };
    const dummyCtx = {} as Parameters<NonNullable<typeof PrivacyRoute.options.head>>[0];

    const privacyMeta = (PrivacyRoute.options.head?.(dummyCtx)?.meta || []) as HeadMetaItem[];
    const privacyTitle = privacyMeta.find((m) => m.title)?.title;
    expect(privacyTitle).toContain("Privacy Policy — JOSPPY GADGETS");

    // Check Terms & Conditions meta
    const termsMeta = (TermsRoute.options.head?.(dummyCtx)?.meta || []) as HeadMetaItem[];
    const termsTitle = termsMeta.find((m) => m.title)?.title;
    expect(termsTitle).toContain("Terms & Conditions — JOSPPY GADGETS");

    // Check Delivery Policy meta
    const deliveryMeta = (DeliveryRoute.options.head?.(dummyCtx)?.meta || []) as HeadMetaItem[];
    const deliveryTitle = deliveryMeta.find((m) => m.title)?.title;
    expect(deliveryTitle).toContain("Delivery Policy — JOSPPY GADGETS");

    // Check Returns Policy meta
    const returnsMeta = (ReturnsRoute.options.head?.(dummyCtx)?.meta || []) as HeadMetaItem[];
    const returnsTitle = returnsMeta.find((m) => m.title)?.title;
    expect(returnsTitle).toContain("Returns & Refund Policy — JOSPPY GADGETS");
  });

  it("verifies official centralized support credentials", () => {
    expect(SUPPORT_PHONE).toBe("09061848821");
    expect(SUPPORT_PHONE_CALL).toBe("tel:09061848821");
    expect(SUPPORT_WHATSAPP_NUMBER).toBe("+2349061848821");
    expect(SUPPORT_WHATSAPP_LINK).toBe("https://wa.me/2349061848821");

    const customWhatsApp = getWhatsAppSupportUrl("Inquiry regarding return policy");
    expect(customWhatsApp).toContain("https://wa.me/2349061848821?text=");
  });

  it("verifies delivery policy configurations (₦2,500 nationwide, all 36 states + FCT)", () => {
    expect(DELIVERY_FEE).toBe(2500);
    expect(naira(DELIVERY_FEE)).toBe("₦2,500");
    expect(STATES.length).toBe(37); // 36 states + FCT Abuja
    expect(STATES).toContain("Lagos");
    expect(STATES).toContain("FCT - Abuja");
    expect(STATES).toContain("Rivers");
    expect(STATES).toContain("Kano");
  });
});
