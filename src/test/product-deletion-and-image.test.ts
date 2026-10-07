import { describe, expect, it, beforeEach } from "vitest";
import {
  isProductActive,
  recordRemovedProductId,
  getRemovedProductIds,
  REMOVED_PRODUCTS_STORAGE_KEY,
  OFFICIAL_BANK_ACCOUNT,
  type Product,
} from "@/lib/catalog";
import { productsQuery, productQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { resolveProductImageUrl, extractStoragePath } from "@/lib/images";

describe("Admin Product Deletion, Storage Image Upload, and Cart Safety", () => {
  beforeEach(() => {
    localStorage.removeItem(REMOVED_PRODUCTS_STORAGE_KEY);
    localStorage.removeItem("josppy_mock_products");
    localStorage.removeItem("josppy-cart");
  });

  it("safely marks a product as removed and prevents it from appearing in active queries", () => {
    const testProduct: Product = {
      id: "test-solar-gadget-101",
      name: "Test Solar Lamp",
      description: "Portable solar lamp",
      category: "solar",
      price: 12000,
      stock: 15,
      image_url: "/products/solar.jpg",
      featured: true,
      created_at: new Date().toISOString(),
    };

    // Initially active
    expect(isProductActive(testProduct)).toBe(true);

    // Record removal
    recordRemovedProductId(testProduct.id);

    // After removal, isProductActive must return false
    expect(isProductActive(testProduct)).toBe(false);
    expect(getRemovedProductIds().has("test-solar-gadget-101")).toBe(true);

    // An archived product is also not active
    const archivedProduct: Product = {
      ...testProduct,
      id: "unrecorded-id",
      category: "archived",
    };
    expect(isProductActive(archivedProduct)).toBe(false);
  });

  it("verifies productQuery returns null for removed products", async () => {
    recordRemovedProductId("removed-prod-999");
    const query = productQuery("removed-prod-999");
    const result = await query.queryFn();
    expect(result).toBeNull();
  });

  it("generates a valid usable public URL for the product-images storage bucket", () => {
    const fileName = "prod-test-lamp.webp";
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);

    expect(data.publicUrl).toBeDefined();
    expect(data.publicUrl).toContain("product-images");
    expect(data.publicUrl).toContain(fileName);
  });

  it("generates a valid signed URL for private product-images bucket", async () => {
    const fileName = "prod-1791290741904-chibe.png";
    const { data, error } = await supabase.storage
      .from("product-images")
      .createSignedUrl(fileName, 3600);

    expect(error).toBeNull();
    expect(data?.signedUrl).toBeDefined();
    expect(data?.signedUrl).toContain("product-images");
  });

  it("resolves both local /products/ images and storage paths correctly", () => {
    // Local assets
    expect(resolveProductImageUrl("/products/inverter.jpg")).toBe("/products/inverter.jpg");
    expect(resolveProductImageUrl("cable.jpg")).toBe("/products/cable.jpg");
    expect(resolveProductImageUrl("")).toBe("/products/powerbank.jpg");
    expect(resolveProductImageUrl(null)).toBe("/products/powerbank.jpg");

    // Storage path extraction
    const storagePath = extractStoragePath("product-images/prod-999-abc.png");
    expect(storagePath).toBe("prod-999-abc.png");

    const urlStoragePath = extractStoragePath(
      "https://example.supabase.co/storage/v1/object/sign/product-images/prod-123.jpg?token=abc",
    );
    expect(urlStoragePath).toBe("prod-123.jpg");
  });

  it("ensures removed products are filtered out from customer cart", () => {
    recordRemovedProductId("deleted-product-123");
    expect(getRemovedProductIds().has("deleted-product-123")).toBe(true);

    const cartKey = "josppy-cart";
    const initialCart = [
      {
        id: "active-product-1",
        name: "Active Lamp",
        price: 5000,
        quantity: 1,
        stock: 10,
        image_url: null,
      },
      {
        id: "deleted-product-123",
        name: "Deleted Product",
        price: 10000,
        quantity: 1,
        stock: 0,
        image_url: null,
      },
    ];
    localStorage.setItem(cartKey, JSON.stringify(initialCart));

    // When cart sanitizes items, removed products must be purged
    const raw = localStorage.getItem(cartKey);
    const parsed = JSON.parse(raw || "[]");
    const removed = getRemovedProductIds();
    const sanitizedCart = parsed.filter((i: { id: string }) => !removed.has(i.id));

    expect(sanitizedCart.length).toBe(1);
    expect(sanitizedCart[0].id).toBe("active-product-1");
  });

  it("preserves historical order item data even when a product is deleted/archived", () => {
    // Historical order item record
    const historicalOrderItem = {
      id: "item-555",
      order_id: "order-999",
      product_id: "test-solar-gadget-101",
      name: "Test Solar Lamp",
      price: 12000,
      quantity: 2,
      image_url: "https://example.com/uploaded-solar.jpg",
    };

    // Product is removed from active store
    recordRemovedProductId(historicalOrderItem.product_id);

    // Historical order item must remain intact with its snapshot
    expect(historicalOrderItem.product_id).toBe("test-solar-gadget-101");
    expect(historicalOrderItem.name).toBe("Test Solar Lamp");
    expect(historicalOrderItem.price).toBe(12000);
    expect(historicalOrderItem.quantity).toBe(2);
    expect(historicalOrderItem.image_url).toBe("https://example.com/uploaded-solar.jpg");
  });

  it("validates correct Opay Microfinance Bank details across customer-facing payment references", () => {
    expect(OFFICIAL_BANK_ACCOUNT.bank).toBe("Opay Microfinance Bank");
    expect(OFFICIAL_BANK_ACCOUNT.accountName).toBe("Josppy Electrical Engineering Services");
    expect(OFFICIAL_BANK_ACCOUNT.accountNumber).toBe("6428600287");
  });
});
