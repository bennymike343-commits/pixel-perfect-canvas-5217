import { describe, expect, it } from "vitest";
import {
  SUPPORT_PHONE,
  SUPPORT_PHONE_CALL,
  SUPPORT_WHATSAPP_NUMBER,
  SUPPORT_WHATSAPP_LINK,
  getWhatsAppSupportUrl,
} from "@/lib/catalog";

describe("JOSPPY GADGETS Support & WhatsApp Configuration", () => {
  it("has the exact correct local phone display 09061848821", () => {
    expect(SUPPORT_PHONE).toBe("09061848821");
  });

  it("has the exact tel: protocol target for calling support", () => {
    expect(SUPPORT_PHONE_CALL).toBe("tel:09061848821");
  });

  it("has the exact international WhatsApp format +2349061848821", () => {
    expect(SUPPORT_WHATSAPP_NUMBER).toBe("+2349061848821");
    expect(SUPPORT_WHATSAPP_LINK).toBe("https://wa.me/2349061848821");
  });

  it("generates WhatsApp URLs targeting +2349061848821 with optional encoded inquiry text", () => {
    const defaultUrl = getWhatsAppSupportUrl();
    expect(defaultUrl).toBe("https://wa.me/2349061848821");

    const orderUrl = getWhatsAppSupportUrl("Hello, I need help with order #ABC");
    expect(orderUrl).toContain("https://wa.me/2349061848821?text=");
    expect(orderUrl).toContain(encodeURIComponent("Hello, I need help with order #ABC"));
  });
});
