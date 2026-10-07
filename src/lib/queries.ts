import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isProductActive, getRemovedProductIds, type Product } from "./catalog";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Product[]).filter(isProductActive);
  },
});

export const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const removed = getRemovedProductIds();
      if (removed.has(id)) return null;

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) return null;
        if (!data || !isProductActive(data as Product)) return null;
        return data as Product;
      } catch {
        return null;
      }
    },
  });
