import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Zap, ShieldCheck, Truck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JOSPPY GADGETS — Welcome" },
      { name: "description", content: "Gadgets, phone accessories, power and electrical products delivered across Nigeria." },
      { property: "og:title", content: "JOSPPY GADGETS — Welcome" },
      { property: "og:description", content: "Gadgets, phone accessories, power and electrical products delivered across Nigeria." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/home", replace: true }), 3200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-hero px-6 text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-sweep absolute top-0 h-full w-24 bg-primary-foreground/15 blur-md" />
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <div className="animate-pulse-glow grid size-24 place-items-center rounded-3xl bg-primary-foreground text-5xl font-black text-primary shadow-glow">J</div>
        <h1 className="animate-rise mt-6 text-4xl font-black tracking-tight">JOSPPY<br />GADGETS</h1>
        <p className="animate-rise mt-3 font-mono text-[11px] uppercase tracking-[0.3em] opacity-80">Power · Light · Phone</p>
        <div className="mt-10 grid w-full grid-cols-3 gap-2 text-[11px]">
          {[{ i: Truck, t: "Nationwide delivery" }, { i: ShieldCheck, t: "Genuine products" }, { i: Zap, t: "Fast checkout" }].map(({ i: I, t }) => (
            <div key={t} className="rounded-2xl bg-primary-foreground/10 p-3"><I className="mx-auto mb-1 size-5" />{t}</div>
          ))}
        </div>
      </div>
      <div className="relative pb-10">
        <Link to="/home" replace className="block w-full rounded-2xl bg-primary-foreground py-4 text-center font-bold text-primary">Start shopping</Link>
      </div>
    </div>
  );
}
