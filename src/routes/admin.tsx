import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert,
  ShieldCheck,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Upload,
  RefreshCw,
  Loader2,
  Phone,
  MapPin,
  ExternalLink,
  Building2,
  Eye,
  X,
  Save,
  Star,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Screen, PageHeader } from "@/components/AppShell";
import {
  CATEGORIES,
  ORDER_STATUSES,
  type OrderStatus,
  type Product,
  naira,
  DELIVERY_FEE,
  categoryBySlug,
  productMatchesCategory,
} from "@/lib/catalog";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — JOSPPY GADGETS" },
      {
        name: "description",
        content: "Administrative dashboard for managing products, inventory, and customer orders.",
      },
      { property: "og:title", content: "Admin Portal — JOSPPY GADGETS" },
      {
        property: "og:description",
        content: "Administrative dashboard for managing products, inventory, and customer orders.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

type AdminTab = "overview" | "products" | "orders";

type AdminOrder = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  state: string;
  city: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_method?: "pod" | "transfer";
  created_at: string;
  items?: {
    id: string;
    product_id: string | null;
    name: string;
    price: number;
    quantity: number;
    image_url: string | null;
  }[];
};

function StatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/15 px-2 py-0.5 font-mono text-[10px] font-bold text-success">
          <CheckCircle2 className="size-3" /> Delivered
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-500">
          <Truck className="size-3" /> Shipped
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
          <Clock className="size-3" /> Processing
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/15 px-2 py-0.5 font-mono text-[10px] font-bold text-destructive">
          <XCircle className="size-3" /> Cancelled
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
          <Clock className="size-3" /> Pending
        </span>
      );
  }
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="rounded-md border border-destructive/20 bg-destructive/15 px-2 py-0.5 font-mono text-[10px] font-bold text-destructive">
        Out of Stock (0)
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="rounded-md border border-amber-500/20 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
        Low Stock ({stock})
      </span>
    );
  }
  return (
    <span className="rounded-md border border-success/20 bg-success/15 px-2 py-0.5 font-mono text-[10px] font-bold text-success">
      In Stock ({stock})
    </span>
  );
}

function AdminDashboardPage() {
  const { session, loading: authLoading, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loadingData, setLoadingData] = useState(true);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  // Product Filters & Modal
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStockFilter, setProductStockFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Orders Filters & Detail Modal
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch all admin data
  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingData(true);

    try {
      // 1. Fetch Products
      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!prodErr && prodData) {
        setProducts(prodData as Product[]);
      }

      // 2. Fetch Orders (Admin authorized)
      const { data: ordData, error: ordErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      let ordersList: AdminOrder[] = [];
      if (!ordErr && ordData) {
        // Fetch order items for each order
        const fetchedOrders: AdminOrder[] = [];
        for (const o of ordData) {
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", o.id);

          fetchedOrders.push({
            ...o,
            status: o.status as OrderStatus,
            items: (itemsData as AdminOrder["items"]) || [],
          });
        }
        ordersList = fetchedOrders;
      }

      // Also merge with any local recent orders from browser storage
      try {
        const raw = localStorage.getItem("josppy-recent-orders");
        if (raw) {
          const localList = JSON.parse(raw);
          if (Array.isArray(localList)) {
            const map = new Map<string, AdminOrder>();
            for (const item of localList) {
              map.set(item.id, {
                id: item.id,
                user_id: item.userId || item.user_id || "guest",
                full_name: item.fullName || item.full_name || "Customer",
                phone: item.phone || "",
                address: item.address || "",
                state: item.state || "",
                city: item.city || "",
                subtotal: Number(item.subtotal) || 0,
                delivery_fee: Number(item.deliveryFee ?? item.delivery_fee) || DELIVERY_FEE,
                total: Number(item.total) || 0,
                status: (item.status as OrderStatus) || "pending",
                payment_method: item.paymentMethod || item.payment_method,
                created_at: item.createdAt || item.created_at || new Date().toISOString(),
                items: item.items || [],
              });
            }
            for (const o of ordersList) {
              const existing = map.get(o.id);
              map.set(o.id, {
                ...o,
                payment_method: o.payment_method || existing?.payment_method || "pod",
                items: o.items && o.items.length > 0 ? o.items : existing?.items || [],
              });
            }
            ordersList = Array.from(map.values());
            ordersList.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );
          }
        }
      } catch (err) {
        console.warn("Could not parse local orders:", err);
      }

      setOrders(ordersList);
    } catch (err) {
      console.error("Admin data fetch error:", err);
      toast.error("Failed to load some admin data.");
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  // Handle Quick Stock Update
  const handleUpdateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", productId);

      if (error) throw new Error(error.message);

      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Stock updated.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update stock";
      toast.error(msg);
    }
  };

  // Handle Product Save (Add / Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name?.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!editingProduct.category?.trim()) {
      toast.error("Category is required.");
      return;
    }
    if (typeof editingProduct.price !== "number" || editingProduct.price < 0) {
      toast.error("Valid price in NGN is required.");
      return;
    }
    if (typeof editingProduct.stock !== "number" || editingProduct.stock < 0) {
      toast.error("Stock must be 0 or greater.");
      return;
    }

    setSavingProduct(true);
    try {
      const isNew = !editingProduct.id;
      const payload = {
        name: editingProduct.name.trim(),
        description: editingProduct.description?.trim() || "",
        category: editingProduct.category,
        price: Math.round(editingProduct.price),
        stock: Math.round(editingProduct.stock),
        image_url: editingProduct.image_url || "/products/powerbank.jpg",
        featured: !!editingProduct.featured,
      };

      if (isNew) {
        const { data, error } = await supabase.from("products").insert(payload).select().single();

        if (error) throw new Error(error.message);
        if (data) {
          setProducts((prev) => [data as Product, ...prev]);
        }
        toast.success("Product created successfully!");
      } else {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id!);

        if (error) throw new Error(error.message);

        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? ({ ...p, ...payload } as Product) : p)),
        );
        toast.success("Product updated successfully!");
      }

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save product.";
      toast.error(msg);
    } finally {
      setSavingProduct(false);
    }
  };

  // Safe Archive/Delete Product
  const handleDeleteProduct = async (product: Product) => {
    if (
      !confirm(
        `Are you sure you want to remove "${product.name}"? If referenced by past customer orders, it will be marked out of stock to preserve order history.`,
      )
    ) {
      return;
    }

    try {
      // First attempt to delete
      const { error } = await supabase.from("products").delete().eq("id", product.id);

      if (error) {
        // If deletion violates foreign key constraint from order_items, safely zero out stock
        console.warn("Referenced product, setting stock to 0 instead of deletion", error);
        await supabase.from("products").update({ stock: 0, featured: false }).eq("id", product.id);
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: 0, featured: false } : p)),
        );
        toast.info("Product has historical orders. Deactivated and marked out of stock.");
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        toast.success("Product removed from catalog.");
      }

      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error("Failed to remove product.");
    }
  };

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const { data, error } = await supabase.storage.from("product-images").upload(fileName, file);

      if (error) {
        throw new Error(error.message);
      }

      const imageUrl = (data as { url?: string })?.url || `/products/${fileName}`;
      setEditingProduct((prev) => ({ ...prev, image_url: imageUrl }));
      toast.success("Image uploaded!");
    } catch (err) {
      console.warn("Upload fallback to data URL:", err);
      // Fallback: read as Data URL
      const reader = new FileReader();
      reader.onload = () => {
        setEditingProduct((prev) => ({ ...prev, image_url: reader.result as string }));
        toast.success("Image loaded!");
      };
      reader.readAsDataURL(file);
    } finally {
      setImageUploading(false);
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw new Error(error.message);

      // Update state
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      // Also update localStorage so customer immediately sees new status on /orders
      try {
        const raw = localStorage.getItem("josppy-recent-orders");
        if (raw) {
          const list = JSON.parse(raw);
          const updated = list.map((item: { id?: string; status?: string }) =>
            item.id === orderId ? { ...item, status: newStatus } : item,
          );
          localStorage.setItem("josppy-recent-orders", JSON.stringify(updated));
        }
      } catch (e) {
        console.warn("Failed updating local order storage", e);
      }

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`Order status updated to "${newStatus.toUpperCase()}".`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update order status.";
      toast.error(msg);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(productSearch.toLowerCase());
      const matchCategory =
        productCategoryFilter === "all" ||
        productMatchesCategory(p.category, productCategoryFilter);
      const matchStock =
        productStockFilter === "all"
          ? true
          : productStockFilter === "in_stock"
            ? p.stock > 10
            : productStockFilter === "low_stock"
              ? p.stock > 0 && p.stock <= 10
              : p.stock === 0;

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, productSearch, productCategoryFilter, productStockFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const matchSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.full_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.phone.includes(orderSearch);
      return matchStatus && matchSearch;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Metrics
  const metrics = useMemo(() => {
    const totalProd = products.length;
    const lowStock = products.filter((p) => p.stock <= 10).length;
    const totalOrd = orders.length;
    const pendingOrd = orders.filter((o) => o.status === "pending").length;
    const processingOrd = orders.filter((o) => o.status === "processing").length;
    const deliveredOrd = orders.filter((o) => o.status === "delivered").length;
    const revenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);

    return { totalProd, lowStock, totalOrd, pendingOrd, processingOrd, deliveredOrd, revenue };
  }, [products, orders]);

  // 1. Auth Loading State
  if (authLoading) {
    return (
      <Screen nav={false}>
        <PageHeader title="Admin Portal" />
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Checking administrator security…</p>
        </div>
      </Screen>
    );
  }

  // 2. Unauthenticated State
  if (!session) {
    return (
      <Screen nav={false}>
        <PageHeader title="Admin Portal" back />
        <div className="flex flex-col items-center px-6 py-20 text-center">
          <div className="grid size-16 place-items-center rounded-3xl border border-destructive/20 bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-black text-foreground">Sign In Required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You must be signed in with an authorized JOSPPY GADGETS administrator account to access
            the portal.
          </p>
          <Link
            to="/profile"
            className="mt-6 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Go to Sign In
          </Link>
        </div>
      </Screen>
    );
  }

  // 3. Authenticated but NOT Admin
  if (!isAdmin) {
    return (
      <Screen nav={false}>
        <PageHeader title="Admin Portal" back />
        <div className="flex flex-col items-center px-6 py-20 text-center">
          <div className="grid size-16 place-items-center rounded-3xl border border-destructive/20 bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-black text-foreground">Unauthorized Access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account ({session.user.email}) does not have administrator privileges.
          </p>
          <div className="mt-6 flex gap-2">
            <Link
              to="/home"
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow"
            >
              Back to Store
            </Link>
            <Link
              to="/profile"
              className="rounded-2xl border border-input bg-card px-5 py-3 text-sm font-bold text-foreground"
            >
              My Profile
            </Link>
          </div>
        </div>
      </Screen>
    );
  }

  // 4. Authorized Admin Dashboard
  return (
    <Screen nav={false}>
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Link
            to="/profile"
            className="grid size-8 place-items-center rounded-xl bg-secondary text-secondary-foreground"
            aria-label="Back to profile"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-sm font-black tracking-tight text-foreground">Admin Portal</h1>
            <p className="text-[10px] text-muted-foreground">{session.user.email}</p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loadingData}
          className="grid size-8 place-items-center rounded-xl bg-secondary text-secondary-foreground disabled:opacity-50"
          aria-label="Refresh data"
        >
          <RefreshCw className={`size-4 ${loadingData ? "animate-spin" : ""}`} />
        </button>
      </header>

      {/* Admin Tab Switcher */}
      <div className="border-b border-border bg-card px-4 py-2">
        <div className="grid grid-cols-3 rounded-2xl bg-secondary p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "products"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="size-3.5" />
            <span>Products ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "orders"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="size-3.5" />
            <span>Orders ({orders.length})</span>
          </button>
        </div>
      </div>

      <div className="px-4 pb-24 pt-4">
        {/* ======================= TAB 1: OVERVIEW ======================= */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Revenue */}
              <div className="col-span-2 rounded-3xl border border-primary/20 bg-hero p-5 text-primary-foreground shadow-glow">
                <span className="font-mono text-[11px] uppercase tracking-wider opacity-80">
                  Total Sales Revenue
                </span>
                <p className="mt-1 font-mono text-2xl font-black">{naira(metrics.revenue)}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] opacity-90">
                  <span>{metrics.totalOrd} total orders placed</span>
                  <span>{metrics.deliveredOrd} delivered</span>
                </div>
              </div>

              {/* Total Products */}
              <div
                onClick={() => setActiveTab("products")}
                className="cursor-pointer rounded-3xl border border-border bg-card p-4 transition-all hover:border-primary/40 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted-foreground">Products</span>
                  <Package className="size-4 text-primary" />
                </div>
                <p className="mt-1 font-mono text-xl font-black text-foreground">
                  {metrics.totalProd}
                </p>
                <p className="text-[11px] text-muted-foreground">In store catalogue</p>
              </div>

              {/* Low Stock Alerts */}
              <div
                onClick={() => {
                  setActiveTab("products");
                  setProductStockFilter("low_stock");
                }}
                className="cursor-pointer rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 transition-all hover:border-amber-500/40 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400">
                    Low Stock
                  </span>
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="mt-1 font-mono text-xl font-black text-amber-700 dark:text-amber-400">
                  {metrics.lowStock}
                </p>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
                  ≤ 10 units left
                </p>
              </div>

              {/* Pending Orders */}
              <div
                onClick={() => {
                  setActiveTab("orders");
                  setOrderStatusFilter("pending");
                }}
                className="cursor-pointer rounded-3xl border border-border bg-card p-4 transition-all hover:border-primary/40 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted-foreground">Pending</span>
                  <Clock className="size-4 text-amber-500" />
                </div>
                <p className="mt-1 font-mono text-xl font-black text-foreground">
                  {metrics.pendingOrd}
                </p>
                <p className="text-[11px] text-muted-foreground">Awaiting processing</p>
              </div>

              {/* Processing Orders */}
              <div
                onClick={() => {
                  setActiveTab("orders");
                  setOrderStatusFilter("processing");
                }}
                className="cursor-pointer rounded-3xl border border-border bg-card p-4 transition-all hover:border-primary/40 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted-foreground">Processing</span>
                  <Clock className="size-4 text-primary" />
                </div>
                <p className="mt-1 font-mono text-xl font-black text-foreground">
                  {metrics.processingOrd}
                </p>
                <p className="text-[11px] text-muted-foreground">Preparing for dispatch</p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="rounded-3xl border border-border bg-card p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </span>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: "",
                      description: "",
                      category: "power-banks",
                      price: 0,
                      stock: 10,
                      featured: false,
                      image_url: "/products/powerbank.jpg",
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-glow"
                >
                  <Plus className="size-4" />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("orders");
                    setOrderStatusFilter("pending");
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-input bg-background py-3 text-xs font-bold text-foreground hover:bg-muted"
                >
                  <Truck className="size-4" />
                  <span>Manage Orders</span>
                </button>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="rounded-3xl border border-border bg-card p-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Latest Orders
                </span>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="flex items-center gap-0.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>View All</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>

              <div className="mt-3 divide-y divide-border/60">
                {orders.slice(0, 4).map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="flex cursor-pointer items-center justify-between py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {o.full_name} · {o.city}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-primary">
                      {naira(o.total)}
                    </span>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No customer orders yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: PRODUCTS ======================= */}
        {activeTab === "products" && (
          <div className="space-y-3">
            {/* Header with Search and Add */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-2xl border border-input bg-card py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary"
                />
                <Search className="pointer-events-none absolute left-3 top-3 size-3.5 text-muted-foreground" />
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: "",
                    description: "",
                    category: "power-banks",
                    price: 0,
                    stock: 10,
                    featured: false,
                    image_url: "/products/powerbank.jpg",
                  });
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-1 rounded-2xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-glow shrink-0"
              >
                <Plus className="size-4" />
                <span>New</span>
              </button>
            </div>

            {/* Category and Stock Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="rounded-xl border border-input bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={productStockFilter}
                onChange={(e) => setProductStockFilter(e.target.value)}
                className="rounded-xl border border-input bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary"
              >
                <option value="all">All Stock Levels</option>
                <option value="in_stock">In Stock (&gt;10)</option>
                <option value="low_stock">Low Stock (1–10)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>
            </div>

            {/* Product Cards List */}
            <div className="space-y-2.5 pt-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-3xl border border-border bg-card p-3.5 shadow-sm transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={p.image_url || "/products/powerbank.jpg"}
                      alt={p.name}
                      className="size-16 shrink-0 rounded-2xl object-cover border border-border bg-muted"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="truncate text-xs font-bold text-foreground">{p.name}</h3>
                        {p.featured && (
                          <span className="flex items-center gap-0.5 rounded-md bg-amber-500/15 px-1 py-0.5 font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400">
                            <Star className="size-2.5 fill-current" /> Featured
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-primary">
                          {naira(p.price)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[9.5px] font-bold text-secondary-foreground font-mono">
                          {categoryBySlug(p.category)?.name || p.category}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <StockBadge stock={p.stock} />

                        {/* Quick Stock Controls */}
                        <div className="flex items-center gap-1 rounded-xl bg-secondary p-0.5">
                          <button
                            onClick={() => handleUpdateStock(p.id, Math.max(0, p.stock - 1))}
                            className="size-6 rounded-lg bg-card text-xs font-bold text-foreground shadow-sm hover:bg-accent"
                            title="Decrease stock"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-mono text-xs font-bold">
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stock + 1)}
                            className="size-6 rounded-lg bg-card text-xs font-bold text-foreground shadow-sm hover:bg-accent"
                            title="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/60 pt-2.5">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsProductModalOpen(true);
                      }}
                      className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-accent"
                    >
                      <Edit className="size-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p)}
                      className="flex items-center gap-1 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/20"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No products found matching filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================= TAB 3: ORDERS ======================= */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {/* Search and Filter */}
            <div className="relative">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by Order ID, name, or phone…"
                className="w-full rounded-2xl border border-input bg-card py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary"
              />
              <Search className="pointer-events-none absolute left-3 top-3 size-3.5 text-muted-foreground" />
            </div>

            {/* Status Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`rounded-xl px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                    orderStatusFilter === st
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-3 pt-1">
              {filteredOrders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-3xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-foreground">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Quick Status Dropdown for Admin */}
                    <div className="relative">
                      <select
                        value={o.status}
                        disabled={updatingOrderId === o.id}
                        onChange={(e) =>
                          handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)
                        }
                        className="appearance-none rounded-xl border border-border bg-secondary py-1.5 pl-3 pr-7 font-mono text-[10px] font-bold uppercase outline-none focus:border-primary"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-2 size-3 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Customer Preview */}
                  <div className="mt-2.5 text-xs space-y-0.5">
                    <p className="font-bold text-foreground">{o.full_name}</p>
                    <p className="text-muted-foreground">
                      {o.phone} · {o.city}, {o.state}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Method:{" "}
                      {o.payment_method === "transfer" ? "Bank Transfer" : "Pay on Delivery"}
                    </p>
                  </div>

                  {/* Footer with Total and View details */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-2.5">
                    <div>
                      <span className="font-mono text-[11px] text-muted-foreground">Total: </span>
                      <span className="font-mono text-sm font-bold text-primary">
                        {naira(o.total)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground hover:bg-accent"
                    >
                      <Eye className="size-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No orders found in this category.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================= MODAL: ADD / EDIT PRODUCT ======================= */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-black text-foreground">
                {editingProduct.id ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="grid size-8 place-items-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3">
              {/* Product Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Product Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. VoltCore 20000mAh Power Bank"
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={editingProduct.category || "power-banks"}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Price (₦) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.price ?? ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    placeholder="18500"
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Stock Quantity <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock ?? ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    placeholder="25"
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Product Image URL & Upload */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Product Image
                </label>
                <div className="mt-1.5 flex items-center gap-3">
                  <img
                    src={editingProduct.image_url || "/products/powerbank.jpg"}
                    alt="Preview"
                    className="size-14 rounded-xl border border-border object-cover bg-muted shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={editingProduct.image_url || ""}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, image_url: e.target.value })
                      }
                      placeholder="/products/powerbank.jpg or https://…"
                      className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                    />
                    <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-1 text-[11px] font-bold text-secondary-foreground hover:bg-accent">
                      <Upload className="size-3" />
                      <span>{imageUploading ? "Uploading…" : "Upload Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={imageUploading}
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  placeholder="High capacity, fast charging..."
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Featured Switch */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-toggle"
                  checked={!!editingProduct.featured}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, featured: e.target.checked })
                  }
                  className="size-4 accent-primary"
                />
                <label
                  htmlFor="featured-toggle"
                  className="text-xs font-bold text-foreground cursor-pointer"
                >
                  Feature on Home Page showcase
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-50"
                >
                  {savingProduct ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      <span>Save Product</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-2xl border border-input bg-card px-4 py-3 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ORDER DETAILS ======================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-xs text-muted-foreground">Order Reference</span>
                <h2 className="font-mono text-base font-black text-foreground">
                  #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="grid size-8 place-items-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Status Update Control */}
              <div className="rounded-2xl border border-border bg-secondary/50 p-3.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Change Delivery Status
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ORDER_STATUSES.map((st) => (
                    <button
                      key={st}
                      disabled={updatingOrderId === selectedOrder.id}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                      className={`rounded-xl px-2.5 py-1 font-mono text-[10px] font-bold uppercase transition-all ${
                        selectedOrder.status === st
                          ? "bg-primary text-primary-foreground shadow-glow ring-2 ring-primary"
                          : "border border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Contact */}
              <div className="rounded-2xl border border-border bg-card p-3.5 space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Customer & Shipping
                </span>
                <p className="font-bold text-foreground text-sm">{selectedOrder.full_name}</p>
                <p className="text-muted-foreground">{selectedOrder.phone}</p>
                <p className="text-muted-foreground">
                  {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} State
                </p>

                {/* Direct Contact Links */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-secondary py-1.5 font-bold text-foreground hover:bg-accent"
                  >
                    <Phone className="size-3" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedOrder.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-success/15 py-1.5 font-bold text-success hover:bg-success/20"
                  >
                    <ExternalLink className="size-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Items Purchased */}
              <div className="rounded-2xl border border-border bg-card p-3.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Items ({(selectedOrder.items || []).length})
                </span>
                <div className="mt-2 divide-y divide-border/60">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={it.id || idx} className="flex items-center gap-3 py-2">
                      <img
                        src={it.image_url || "/products/powerbank.jpg"}
                        alt={it.name}
                        className="size-11 rounded-xl object-cover bg-muted shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{it.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {it.quantity} × {naira(it.price)}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        {naira(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="mt-3 border-t border-border pt-2.5 space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono">{naira(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="font-mono">{naira(selectedOrder.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-bold text-sm text-foreground">
                    <span>Grand Total</span>
                    <span className="font-mono text-primary">{naira(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="rounded-2xl border border-border bg-card p-3.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Payment Method
                </span>
                <p className="mt-1 font-bold text-foreground">
                  {selectedOrder.payment_method === "transfer"
                    ? "Direct Bank Transfer (Opay Microfinance Bank · 6428600287)"
                    : "Pay on Delivery (Cash or POS)"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 w-full rounded-2xl bg-secondary py-3 text-xs font-bold text-secondary-foreground"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </Screen>
  );
}
