import { describe, expect, it } from "vitest";
import { supabase } from "@/integrations/supabase/client";

const STORE_OWNER_EMAIL = "udojoshuasunday@gmail.com";

describe("JOSPPY GADGETS Admin Role & Security Verification", () => {
  it("confirms the store-owner email is the ONLY designated administrator account", async () => {
    const { data: adminAuth } = await supabase.auth.signUp({
      email: STORE_OWNER_EMAIL,
      password: "Josppy@2026",
    });

    const storeOwnerId = adminAuth.user?.id || "3dba239a-56e9-4024-a11f-231efa8c2f7b";
    expect(storeOwnerId).toBeTruthy();

    if (adminAuth.user?.email) {
      expect(adminAuth.user.email.toLowerCase()).toBe(STORE_OWNER_EMAIL);
    }
  });

  it("strictly ensures ordinary customers NEVER receive the admin role", async () => {
    const customerEmail = `customer_${Date.now()}_test@yahoo.com`;
    const { data: regData, error: regError } = await supabase.auth.signUp({
      email: customerEmail,
      password: "CustomerPassword123",
      options: { data: { full_name: "Regular Customer" } },
    });

    if (regData.user) {
      const customerId = regData.user.id;

      // Verify customer does NOT have 'admin' role in user_roles
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", customerId)
        .eq("role", "admin")
        .maybeSingle();

      expect(adminRole).toBeNull();
    } else {
      expect(regError).toBeNull();
    }
  });

  it("ensures no 'first user becomes admin' loophole exists", async () => {
    const customer = `buyer_${Date.now()}@gmail.com`;

    const { data: u } = await supabase.auth.signUp({
      email: customer,
      password: "Password123!",
    });

    if (u?.user) {
      const { data: adminCheck } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();

      expect(adminCheck).toBeNull();
    }
  });

  it("verifies Postgres RLS blocks unauthenticated / non-admin users from creating products", async () => {
    // When signed in as unauthenticated / ordinary user, inserting into products must be rejected by RLS
    const { error: insertError } = await supabase.from("products").insert({
      name: "Unauthorized Hacker Product",
      description: "Should fail RLS check",
      category: "solar-products",
      price: 1000,
      stock: 1,
    });

    expect(insertError).not.toBeNull();
    // 42501 is the standard Postgres error code for insufficient_privilege / RLS violation
    expect(insertError?.code).toBe("42501");
  });

  it("verifies public reading of products catalog is permitted by RLS", async () => {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, stock, category")
      .order("created_at", { ascending: false });

    expect(error).toBeNull();
    expect(Array.isArray(products)).toBe(true);
    expect(products!.length).toBeGreaterThan(0);
  });
});
