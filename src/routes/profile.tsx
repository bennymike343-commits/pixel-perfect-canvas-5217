import { createFileRoute } from "@tanstack/react-router";
import { Screen, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Profile — JOSPPY GADGETS" },
    { name: "description", content: "Profile page at JOSPPY GADGETS." },
    { property: "og:title", content: "Profile — JOSPPY GADGETS" },
    { property: "og:description", content: "Profile page at JOSPPY GADGETS." },
  ] }),
  component: () => (
    <Screen>
      <PageHeader title="Profile" />
      <p className="p-8 text-center text-sm text-muted-foreground">This page is coming soon.</p>
    </Screen>
  ),
});
