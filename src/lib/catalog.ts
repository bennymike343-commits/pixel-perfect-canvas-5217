import { BatteryCharging, Cable, Plug, Zap, Lightbulb, PlugZap, Spline, Satellite, Sun, Smartphone, type LucideIcon } from "lucide-react";

export type Category = { slug: string; name: string; short: string; icon: LucideIcon };

export const CATEGORIES: Category[] = [
  { slug: "phone-accessories", name: "Phone Accessories", short: "Phone", icon: Smartphone },
  { slug: "chargers", name: "Chargers", short: "Chargers", icon: Plug },
  { slug: "cables", name: "Cables", short: "Cables", icon: Cable },
  { slug: "power-banks", name: "Power Banks", short: "Power Banks", icon: BatteryCharging },
  { slug: "electrical", name: "Electrical Accessories", short: "Electrical", icon: Zap },
  { slug: "bulbs", name: "Bulbs & Lighting", short: "Bulbs", icon: Lightbulb },
  { slug: "sockets", name: "Sockets & Extensions", short: "Sockets", icon: PlugZap },
  { slug: "wires", name: "Wires & Electrical Materials", short: "Wires", icon: Spline },
  { slug: "dstv", name: "DSTV/GOTV Accessories", short: "DSTV/GOTV", icon: Satellite },
  { slug: "solar", name: "Solar Products", short: "Solar", icon: Sun },
];

export const categoryBySlug = (s: string) => CATEGORIES.find((c) => c.slug === s);

export const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

export const DELIVERY_FEE = 2500;

export const STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Product = {
  id: string; name: string; description: string; category: string;
  price: number; stock: number; image_url: string | null; featured: boolean; created_at: string;
};
