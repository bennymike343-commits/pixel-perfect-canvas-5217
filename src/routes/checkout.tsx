import { createFileRoute } from "@tanstack/react-router";
import { Screen, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [
    { title: "Checkout — JOSPPY GADGETS" },
    { name: "description", content: "Checkout page at JOSPPY GADGETS." },
    { property: "og:title", content: "Checkout — JOSPPY GADGETS" },
    { property: "og:description", content: "Checkout page at JOSPPY GADGETS." },
  ] }),
  component: () => (
    <Screen>
      <PageHeader title="Checkout" />
      <p className="p-8 text-center text-sm text-muted-foreground">This page is coming soon.</p>
    </Screen>
  ),
});
