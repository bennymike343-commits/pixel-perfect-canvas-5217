import { describe, expect, it } from "vitest";
import { CATEGORIES, categoryBySlug, productMatchesCategory } from "@/lib/catalog";

const EXPECTED_CATEGORY_NAMES = [
  "Electrical Accessories",
  "Bulbs & Lighting",
  "Sockets & Extensions",
  "Wires & Electrical Materials",
  "Plugs, Fuses & Switches",
  "Electrical Tools",
  "Solar Products",
  "Inverters & Power Solutions",
  "Batteries & Rechargeable Batteries",
  "Phone Accessories",
  "Chargers & Adapters",
  "Cables",
  "Power Banks",
  "Earphones & Headsets",
  "Bluetooth Speakers",
  "Smart Watches & Wearables",
  "Phone Holders & Stands",
  "Memory Cards & Flash Drives",
  "Computer & Laptop Accessories",
  "Networking Accessories",
  "CCTV & Security Accessories",
  "DSTV/GOTV Accessories",
  "Cleaning & Gadget Care",
  "Other Accessories",
];

describe("JOSPPY GADGETS Store Category System", () => {
  it("contains exactly 24 categories in the exact requested order", () => {
    expect(CATEGORIES).toHaveLength(24);
    const categoryNames = CATEGORIES.map((c) => c.name);
    expect(categoryNames).toEqual(EXPECTED_CATEGORY_NAMES);
  });

  it("ensures each category has unique slug, non-empty short name, and valid icon", () => {
    const slugs = new Set<string>();
    for (const cat of CATEGORIES) {
      expect(cat.slug).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.short).toBeTruthy();
      expect(cat.icon).toBeDefined();
      expect(slugs.has(cat.slug)).toBe(false);
      slugs.add(cat.slug);
    }
  });

  it("resolves categories by primary slug, legacy alias, and normalized name", () => {
    // Primary slug
    expect(categoryBySlug("electrical-accessories")?.name).toBe("Electrical Accessories");
    expect(categoryBySlug("solar-products")?.name).toBe("Solar Products");
    expect(categoryBySlug("chargers-adapters")?.name).toBe("Chargers & Adapters");

    // Legacy aliases
    expect(categoryBySlug("electrical")?.name).toBe("Electrical Accessories");
    expect(categoryBySlug("solar")?.name).toBe("Solar Products");
    expect(categoryBySlug("chargers")?.name).toBe("Chargers & Adapters");
    expect(categoryBySlug("bulbs")?.name).toBe("Bulbs & Lighting");
    expect(categoryBySlug("sockets")?.name).toBe("Sockets & Extensions");
    expect(categoryBySlug("wires")?.name).toBe("Wires & Electrical Materials");
    expect(categoryBySlug("dstv")?.name).toBe("DSTV/GOTV Accessories");
  });

  it("correctly matches products to categories via productMatchesCategory", () => {
    // Direct matches
    expect(productMatchesCategory("power-banks", "power-banks")).toBe(true);
    expect(productMatchesCategory("cables", "cables")).toBe(true);

    // Matches with canonical slug vs legacy product category
    expect(productMatchesCategory("solar", "solar-products")).toBe(true);
    expect(productMatchesCategory("chargers", "chargers-adapters")).toBe(true);
    expect(productMatchesCategory("bulbs", "bulbs-lighting")).toBe(true);

    // Negative matches
    expect(productMatchesCategory("cables", "solar-products")).toBe(false);
    expect(productMatchesCategory("power-banks", "bulbs-lighting")).toBe(false);
  });
});
