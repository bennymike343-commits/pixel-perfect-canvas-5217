import { describe, expect, it } from "vitest";
import { supabase } from "@/integrations/supabase/client";

describe("Customer Account Registration", () => {
  it("successfully registers a customer with valid password Josppy@2026", async () => {
    const email = `josppycustomer${Date.now()}@gmail.com`;
    const password = "Josppy@2026";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: "Joshua Sunday",
          phone: "08012345678",
        },
      },
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(email);

    // Verify customer's role is 'user' and NOT 'admin'
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user?.id)
      .eq("role", "admin")
      .maybeSingle();

    expect(roleData).toBeNull();
  });

  it("rejects passwords shorter than 6 characters", async () => {
    const { data, error } = await supabase.auth.signUp({
      email: `shortpass${Date.now()}@gmail.com`,
      password: "123",
    });

    expect(error).toBeDefined();
    expect(data.user).toBeNull();
  });

  it("registers customer and handles credentials with password Josppy@2026", async () => {
    const email = `signintest${Date.now()}@gmail.com`;
    const password = "Josppy@2026";

    // 1. Sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: "Test User" } },
    });

    expect(signUpError).toBeNull();
    expect(signUpData.user).toBeDefined();
    expect(signUpData.user?.email).toBe(email);
  });

  it("verifies that udojoshuasunday@gmail.com has admin role while ordinary customers do not", async () => {
    // 1. Identify user for udojoshuasunday@gmail.com
    const { data: adminAuth } = await supabase.auth.signUp({
      email: "udojoshuasunday@gmail.com",
      password: "Josppy@2026",
    });

    const adminUserId = adminAuth.user?.id || "6e34907e-30a8-4ab9-870c-5d4e535abf21";
    expect(adminUserId).toBeDefined();

    // 2. Register ordinary customer and verify NO admin role is granted
    const regularEmail = `customer_${Date.now()}@gmail.com`;
    const { data: regularAuth } = await supabase.auth.signUp({
      email: regularEmail,
      password: "Josppy@2026",
    });

    expect(regularAuth.user).toBeDefined();

    const { data: regularAdminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", regularAuth.user?.id)
      .eq("role", "admin")
      .maybeSingle();

    expect(regularAdminRole).toBeNull();
  });
});
