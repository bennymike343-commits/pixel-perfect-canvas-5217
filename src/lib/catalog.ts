import {
  Zap,
  Lightbulb,
  PlugZap,
  Spline,
  ToggleRight,
  Wrench,
  Sun,
  Cpu,
  Battery,
  Smartphone,
  Plug,
  Cable,
  BatteryCharging,
  Headphones,
  Speaker,
  Watch,
  Tv,
  HardDrive,
  Laptop,
  Wifi,
  Camera,
  Satellite,
  Sparkles,
  Package,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  slug: string;
  name: string;
  short: string;
  icon: LucideIcon;
  aliases?: string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "electrical-accessories",
    name: "Electrical Accessories",
    short: "Electrical",
    icon: Zap,
    aliases: ["electrical"],
  },
  {
    slug: "bulbs-lighting",
    name: "Bulbs & Lighting",
    short: "Bulbs",
    icon: Lightbulb,
    aliases: ["bulbs", "lighting"],
  },
  {
    slug: "sockets-extensions",
    name: "Sockets & Extensions",
    short: "Sockets",
    icon: PlugZap,
    aliases: ["sockets", "extensions"],
  },
  {
    slug: "wires-electrical-materials",
    name: "Wires & Electrical Materials",
    short: "Wires",
    icon: Spline,
    aliases: ["wires", "electrical-materials"],
  },
  {
    slug: "plugs-fuses-switches",
    name: "Plugs, Fuses & Switches",
    short: "Switches",
    icon: ToggleRight,
    aliases: ["switches", "fuses", "plugs"],
  },
  {
    slug: "electrical-tools",
    name: "Electrical Tools",
    short: "Tools",
    icon: Wrench,
    aliases: ["tools"],
  },
  {
    slug: "solar-products",
    name: "Solar Products",
    short: "Solar",
    icon: Sun,
    aliases: ["solar"],
  },
  {
    slug: "inverters-power-solutions",
    name: "Inverters & Power Solutions",
    short: "Inverters",
    icon: Cpu,
    aliases: ["inverters", "power-solutions"],
  },
  {
    slug: "batteries-rechargeable-batteries",
    name: "Batteries & Rechargeable Batteries",
    short: "Batteries",
    icon: Battery,
    aliases: ["batteries", "rechargeable-batteries"],
  },
  {
    slug: "phone-accessories",
    name: "Phone Accessories",
    short: "Phone Acc.",
    icon: Smartphone,
    aliases: ["phone"],
  },
  {
    slug: "chargers-adapters",
    name: "Chargers & Adapters",
    short: "Chargers",
    icon: Plug,
    aliases: ["chargers", "adapters"],
  },
  {
    slug: "cables",
    name: "Cables",
    short: "Cables",
    icon: Cable,
    aliases: ["cable"],
  },
  {
    slug: "power-banks",
    name: "Power Banks",
    short: "Power Banks",
    icon: BatteryCharging,
    aliases: ["powerbank", "powerbanks"],
  },
  {
    slug: "earphones-headsets",
    name: "Earphones & Headsets",
    short: "Earphones",
    icon: Headphones,
    aliases: ["earbuds", "headphones", "headsets", "earphones"],
  },
  {
    slug: "bluetooth-speakers",
    name: "Bluetooth Speakers",
    short: "Speakers",
    icon: Speaker,
    aliases: ["speakers", "bluetooth-speaker"],
  },
  {
    slug: "smart-watches-wearables",
    name: "Smart Watches & Wearables",
    short: "Smart Watches",
    icon: Watch,
    aliases: ["smart-watches", "wearables", "smartwatches"],
  },
  {
    slug: "phone-holders-stands",
    name: "Phone Holders & Stands",
    short: "Holders",
    icon: Tv,
    aliases: ["holders", "stands", "phone-holders"],
  },
  {
    slug: "memory-cards-flash-drives",
    name: "Memory Cards & Flash Drives",
    short: "Flash Drives",
    icon: HardDrive,
    aliases: ["memory-cards", "flash-drives", "storage"],
  },
  {
    slug: "computer-laptop-accessories",
    name: "Computer & Laptop Accessories",
    short: "Computer",
    icon: Laptop,
    aliases: ["computer-accessories", "laptop-accessories", "computer"],
  },
  {
    slug: "networking-accessories",
    name: "Networking Accessories",
    short: "Networking",
    icon: Wifi,
    aliases: ["networking", "network"],
  },
  {
    slug: "cctv-security-accessories",
    name: "CCTV & Security Accessories",
    short: "CCTV",
    icon: Camera,
    aliases: ["cctv", "security", "security-accessories"],
  },
  {
    slug: "dstv-gotv-accessories",
    name: "DSTV/GOTV Accessories",
    short: "DSTV/GOTV",
    icon: Satellite,
    aliases: ["dstv", "gotv", "dstv-gotv"],
  },
  {
    slug: "cleaning-gadget-care",
    name: "Cleaning & Gadget Care",
    short: "Gadget Care",
    icon: Sparkles,
    aliases: ["cleaning", "gadget-care"],
  },
  {
    slug: "other-accessories",
    name: "Other Accessories",
    short: "Other",
    icon: Package,
    aliases: ["other", "accessories"],
  },
];

export const categoryBySlug = (s?: string) => {
  if (!s) return undefined;
  const normalized = s.toLowerCase().trim();
  return CATEGORIES.find(
    (c) =>
      c.slug === normalized ||
      c.name.toLowerCase() === normalized ||
      (c.aliases && c.aliases.includes(normalized)),
  );
};

export const productMatchesCategory = (
  productCategory?: string,
  categorySlug?: string,
): boolean => {
  if (!productCategory || !categorySlug) return false;
  const normProd = productCategory.toLowerCase().trim();
  const normCat = categorySlug.toLowerCase().trim();
  if (normProd === normCat) return true;

  const target = categoryBySlug(normCat);
  if (!target) return normProd === normCat;
  if (normProd === target.slug) return true;
  if (target.aliases && target.aliases.includes(normProd)) return true;

  const source = categoryBySlug(normProd);
  if (source && source.slug === target.slug) return true;

  return false;
};

export const SUPPORT_PHONE = "09061848821";
export const SUPPORT_PHONE_CALL = "tel:09061848821";
export const SUPPORT_WHATSAPP_NUMBER = "+2349061848821";
export const SUPPORT_WHATSAPP_RAW = "2349061848821";
export const SUPPORT_WHATSAPP_LINK = "https://wa.me/2349061848821";

export const getWhatsAppSupportUrl = (message?: string) => {
  if (!message) return SUPPORT_WHATSAPP_LINK;
  return `https://wa.me/2349061848821?text=${encodeURIComponent(message)}`;
};

export const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

export const DELIVERY_FEE = 2500;

export const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
  featured: boolean;
  created_at: string;
};
