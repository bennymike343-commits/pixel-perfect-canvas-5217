import { createFileRoute } from "@tanstack/react-router";
import { Screen, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [
    { title: "Orders — JOSPPY GADGETS" },
    { name: "description", content: "Orders page at JOSPPY GADGETS." },
    { property: "og:title", content: "Orders — JOSPPY GADGETS" },
    { property: "og:description", content: "Orders page at JOSPPY GADGETS." },
  ] }),
  component: () => (
    <Screen>
      <PageHeader title="Orders" />
      <p className="p-8 text-center text-sm text-muted-foreground">This page is coming soon.</p>
    </Screen>
  ),
});
