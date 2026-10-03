import { createFileRoute } from "@tanstack/react-router";
import { Screen, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Admin — JOSPPY GADGETS" },
    { name: "description", content: "Admin page at JOSPPY GADGETS." },
    { property: "og:title", content: "Admin — JOSPPY GADGETS" },
    { property: "og:description", content: "Admin page at JOSPPY GADGETS." },
  ] }),
  component: () => (
    <Screen>
      <PageHeader title="Admin" />
      <p className="p-8 text-center text-sm text-muted-foreground">This page is coming soon.</p>
    </Screen>
  ),
});
