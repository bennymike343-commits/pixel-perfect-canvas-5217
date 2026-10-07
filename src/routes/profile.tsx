import { createFileRoute, Link } from "@tanstack/react-router";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Edit3,
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Save,
  X,
  ExternalLink,
  FileText,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Screen, PageHeader } from "@/components/AppShell";
import { STATES, SUPPORT_PHONE, SUPPORT_PHONE_CALL, getWhatsAppSupportUrl } from "@/lib/catalog";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Account — JOSPPY GADGETS" },
      {
        name: "description",
        content: "Manage your JOSPPY GADGETS customer profile, addresses, and order history.",
      },
      { property: "og:title", content: "Profile & Account — JOSPPY GADGETS" },
      {
        property: "og:description",
        content: "Manage your JOSPPY GADGETS customer profile, addresses, and order history.",
      },
    ],
  }),
  component: ProfilePage,
});

type AuthTab = "signin" | "signup";

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  city: string;
}

function ProfilePage() {
  const { session, loading: authLoading, signOut, isAdmin } = useAuth();

  // Auth form states
  const [authTab, setAuthTab] = useState<AuthTab>("signin");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up inputs
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  // Authenticated profile states
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    state: "Lagos",
    city: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    state: "Lagos",
    city: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Load profile when session is available
  useEffect(() => {
    if (!session?.user) return;

    setProfileLoading(true);
    const userEmail = session.user.email || "";
    const meta = session.user.user_metadata || {};

    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          const loaded: ProfileData = {
            full_name: data.full_name || (meta["full_name"] as string) || "",
            email: data.email || userEmail,
            phone: data.phone || (meta["phone"] as string) || "",
            address: data.address || "",
            state: data.state || "Lagos",
            city: data.city || "",
          };
          setProfile(loaded);
          setEditForm(loaded);
        } else {
          // Fallback to session user metadata
          const fallback: ProfileData = {
            full_name: (meta["full_name"] as string) || "",
            email: userEmail,
            phone: (meta["phone"] as string) || "",
            address: "",
            state: "Lagos",
            city: "",
          };
          setProfile(fallback);
          setEditForm(fallback);
        }
      })
      .finally(() => setProfileLoading(false));
  }, [session]);

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = signInEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!signInPassword || signInPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: signInPassword,
      });

      if (error) {
        throw new Error(error.message || "Failed to sign in. Please verify your credentials.");
      }

      const name = data.user?.user_metadata?.full_name || cleanEmail.split("@")[0];
      toast.success(`Welcome back, ${name}!`);
      setSignInPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to sign in.";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanName = signUpFullName.trim();
    const cleanEmail = signUpEmail.trim();
    const cleanPhone = signUpPhone.trim();
    const cleanPassword = signUpPassword;
    const cleanConfirmPassword = signUpConfirmPassword;

    if (!cleanName || cleanName.length < 3) {
      setAuthError("Please enter your full name (minimum 3 characters).");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 10) {
      setAuthError("Please enter a valid Nigerian phone number.");
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (cleanPassword !== cleanConfirmPassword) {
      setAuthError("Passwords do not match. Please re-enter both password fields.");
      return;
    }

    setAuthSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
          },
        },
      });

      if (error) {
        throw new Error(error.message || "Sign up failed. Please try again.");
      }

      // If user was created, update profiles table with initial details
      if (data.user?.id) {
        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: cleanName,
            phone: cleanPhone,
            email: cleanEmail,
            state: "Lagos",
          });
        } catch {
          // If database trigger already populated the profile row, continue safely
        }
      }

      if (data.session) {
        toast.success("Account created successfully! Welcome to JOSPPY GADGETS.");
      } else {
        toast.success(
          "Account created! Please check your email to verify your account or sign in.",
        );
      }

      setSignUpPassword("");
      setSignUpConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to create account.";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Handle Edit Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    if (!editForm.full_name.trim() || editForm.full_name.trim().length < 3) {
      toast.error("Please enter a valid full name.");
      return;
    }
    if (!editForm.phone.trim() || editForm.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        id: session.user.id,
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        state: editForm.state,
        city: editForm.city.trim(),
        email: profile.email,
      };

      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) {
        throw new Error(error.message || "Failed to update profile.");
      }

      setProfile({
        ...editForm,
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        city: editForm.city.trim(),
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile.";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully.");
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  // 1. Loading Initial Auth
  if (authLoading) {
    return (
      <Screen>
        <PageHeader title="Account" />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Checking authentication…</p>
        </div>
      </Screen>
    );
  }

  // 2. Authenticated Customer View
  if (session?.user) {
    const displayName = profile.full_name || session.user.email?.split("@")[0] || "Customer";
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <Screen>
        <PageHeader title="My Account" back={false} />

        <div className="px-4 pb-28 pt-3">
          {/* Customer Avatar & Status Card */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-2xl bg-hero text-2xl font-black text-primary-foreground shadow-glow">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-black tracking-tight text-foreground">
                    {displayName}
                  </h2>
                </div>
                <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-success">
                  <ShieldCheck className="size-3" />
                  Verified Customer
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details or Edit Form */}
          <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <User className="size-4 text-primary" />
                Default Delivery Details
              </div>
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditForm(profile);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1 rounded-xl bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground transition-colors hover:bg-accent"
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : isEditing ? (
              /* Edit Profile Form */
              <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
                {/* Full name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    placeholder="e.g. Joshua Sunday"
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                {/* Email (Read only) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address{" "}
                    <span className="text-[10px] lowercase text-muted-foreground">
                      (cannot be changed)
                    </span>
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-input bg-muted px-3 py-2 text-sm text-muted-foreground opacity-70 outline-none"
                  />
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Phone / WhatsApp <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="e.g. 0801 234 5678"
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                {/* State & City */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      State <span className="text-destructive">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      >
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      City / Area
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="e.g. Ikeja"
                      className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Street Address & Landmark
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Street address, nearest bus stop or landmark…"
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="size-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center justify-center gap-1 rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-muted"
                  >
                    <X className="size-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Profile Details Display */
              <div className="mt-3.5 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 text-primary" />
                  <div>
                    <span className="text-muted-foreground">Phone Number</span>
                    <p className="font-semibold text-foreground">
                      {profile.phone || "Not set yet"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 text-primary" />
                  <div>
                    <span className="text-muted-foreground">Delivery Address</span>
                    <p className="font-semibold text-foreground">
                      {profile.address
                        ? `${profile.address}, ${profile.city ? profile.city + ", " : ""}${profile.state} State`
                        : "No default address set"}
                    </p>
                  </div>
                </div>

                <p className="border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                  💡 This address will automatically pre-fill when you check out on JOSPPY GADGETS.
                </p>
              </div>
            )}
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="mt-4 space-y-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-between rounded-3xl border border-primary/30 bg-primary/10 p-4 transition-colors hover:bg-primary/15 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">Admin Dashboard</h3>
                      <span className="rounded-md bg-primary px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary-foreground">
                        Staff
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manage products, stock & customer orders
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-primary" />
              </Link>
            )}

            <Link
              to="/orders"
              className="flex items-center justify-between rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/40 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">My Orders & Tracking</h3>
                  <p className="text-xs text-muted-foreground">Track shipments and order history</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              to="/cart"
              className="flex items-center justify-between rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/40 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingBag className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Shopping Cart</h3>
                  <p className="text-xs text-muted-foreground">View items ready for checkout</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            {/* Customer Support Card */}
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-success/15 text-success">
                  <Phone className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground">Customer Support</h3>
                  <p className="text-xs text-muted-foreground">Chat with JOSPPY customer service</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary/60 px-3.5 py-2">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Phone & WhatsApp:
                </span>
                <span className="font-mono text-xs font-bold text-primary">{SUPPORT_PHONE}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={getWhatsAppSupportUrl("Hello JOSPPY GADGETS, I have an account inquiry.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#25D366]/15 py-2.5 text-xs font-bold text-[#128C7E] transition-colors hover:bg-[#25D366]/25 active:scale-[0.98]"
                >
                  <Phone className="size-3.5" />
                  <span>WhatsApp</span>
                  <ExternalLink className="size-3" />
                </a>
                <a
                  href={SUPPORT_PHONE_CALL}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-accent active:scale-[0.98]"
                >
                  <Phone className="size-3.5" />
                  <span>Call Support</span>
                </a>
              </div>
            </div>

            {/* Store Policies & Legal Information */}
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Store Policies & Legal
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/privacy-policy"
                  className="flex items-center gap-2 rounded-2xl bg-secondary/50 p-3 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
                >
                  <ShieldCheck className="size-4 text-primary shrink-0" />
                  <span>Privacy Policy</span>
                </Link>
                <Link
                  to="/terms-and-conditions"
                  className="flex items-center gap-2 rounded-2xl bg-secondary/50 p-3 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
                >
                  <FileText className="size-4 text-primary shrink-0" />
                  <span>Terms & Conditions</span>
                </Link>
                <Link
                  to="/delivery-policy"
                  className="flex items-center gap-2 rounded-2xl bg-secondary/50 p-3 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
                >
                  <Truck className="size-4 text-primary shrink-0" />
                  <span>Delivery Policy</span>
                </Link>
                <Link
                  to="/returns-policy"
                  className="flex items-center gap-2 rounded-2xl bg-secondary/50 p-3 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
                >
                  <RotateCcw className="size-4 text-primary shrink-0" />
                  <span>Returns & Refund</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="mt-6">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 py-3.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/20"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Screen>
    );
  }

  // 3. Unauthenticated View (Welcoming Account Screen with Sign In / Sign Up)
  return (
    <Screen>
      <PageHeader title="Customer Account" back={false} />

      <div className="px-4 pb-28 pt-2">
        {/* Welcoming Header Card */}
        <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-hero font-black text-primary-foreground shadow-glow">
            <Sparkles className="size-7" />
          </div>
          <h2 className="mt-3 text-xl font-black tracking-tight text-foreground">
            Welcome to JOSPPY GADGETS
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in to unlock faster checkout with saved addresses and live order tracking.
          </p>

          {/* Perks Row */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-left font-mono text-[10px]">
            <div className="rounded-xl bg-secondary/50 p-2">
              <span className="font-bold text-primary">⚡ Fast</span>
              <p className="text-muted-foreground">Auto-fill address</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-2">
              <span className="font-bold text-primary">📦 Track</span>
              <p className="text-muted-foreground">Live order updates</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-2">
              <span className="font-bold text-primary">🛡️ Support</span>
              <p className="text-muted-foreground">Priority warranty</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 grid grid-cols-2 rounded-2xl bg-secondary p-1">
          <button
            onClick={() => {
              setAuthTab("signin");
              setAuthError(null);
            }}
            className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
              authTab === "signin"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthTab("signup");
              setAuthError(null);
            }}
            className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
              authTab === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="mt-3.5 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-destructive" />
            <span>{authError}</span>
          </div>
        )}

        {/* Sign In Form */}
        {authTab === "signin" ? (
          <form
            onSubmit={handleSignIn}
            className="mt-3.5 rounded-3xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="space-y-3">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="email"
                    autoComplete="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <Mail className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showSignInPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showSignInPassword ? "Hide password" : "Show password"}
                  >
                    {showSignInPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {authSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Create Account Form */
          <form
            onSubmit={handleSignUp}
            className="mt-3.5 rounded-3xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    autoComplete="name"
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    placeholder="e.g. Joshua Sunday"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <User className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="email"
                    autoComplete="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <Mail className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Phone / WhatsApp <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="e.g. 0801 234 5678"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <Phone className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  >
                    {showSignUpPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm Password <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showSignUpConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showSignUpConfirmPassword ? "Hide confirm password" : "Show confirm password"
                    }
                  >
                    {showSignUpConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Agreement to Terms & Conditions and Privacy Policy */}
            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link to="/terms-and-conditions" className="font-semibold text-primary underline">
                Terms & Conditions
              </Link>{" "}
              and acknowledge that you have read our{" "}
              <Link to="/privacy-policy" className="font-semibold text-primary underline">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={authSubmitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {authSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <CheckCircle2 className="size-4" />
                </>
              )}
            </button>
          </form>
        )}
        {/* Customer Support Card */}
        <div className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-success/15 text-success">
              <Phone className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-foreground">Need Help?</h3>
              <p className="text-xs text-muted-foreground">
                Have questions about registration or orders?
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary/60 px-3.5 py-2">
            <span className="text-[11px] font-medium text-muted-foreground">Support Line:</span>
            <span className="font-mono text-xs font-bold text-primary">{SUPPORT_PHONE}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={getWhatsAppSupportUrl("Hello JOSPPY GADGETS, I need help with my account.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#25D366]/15 py-2.5 text-xs font-bold text-[#128C7E] transition-colors hover:bg-[#25D366]/25 active:scale-[0.98]"
            >
              <Phone className="size-3.5" />
              <span>WhatsApp</span>
              <ExternalLink className="size-3" />
            </a>
            <a
              href={SUPPORT_PHONE_CALL}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-accent active:scale-[0.98]"
            >
              <Phone className="size-3.5" />
              <span>Call Support</span>
            </a>
          </div>
        </div>

        {/* Store Policies & Legal Links */}
        <div className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Store Policies & Legal
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/privacy-policy"
              className="flex items-center gap-2 rounded-2xl bg-secondary/50 p-3 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
            >
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>Privacy Policy</span>
            </Link>
            <Link
              to="/terms-and-conditions"
              className="flex items-center gap-2 rounded-2xl bg-secondary/50 p-3 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
            >
              <FileText className="size-4 text-primary shrink-0" />
              <span>Terms & Conditions</span>
            </Link>
            <Link
              to="/delivery-policy"
              className="flex items-center gap-2 rounded-2xl bg-secondary/50 p-3 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
            >
              <Truck className="size-4 text-primary shrink-0" />
              <span>Delivery Policy</span>
            </Link>
            <Link
              to="/returns-policy"
              className="flex items-center gap-2 rounded-2xl bg-secondary/50 p-3 font-medium text-foreground transition-colors hover:text-primary active:scale-[0.98]"
            >
              <RotateCcw className="size-4 text-primary shrink-0" />
              <span>Returns & Refund</span>
            </Link>
          </div>
        </div>
      </div>
    </Screen>
  );
}
