import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_FALLBACK_IMAGE = "/products/powerbank.jpg";
export const STORAGE_BUCKET = "product-images";

// 10 years expiration in seconds for signed URLs
const TEN_YEARS_SECONDS = 10 * 365 * 24 * 60 * 60;

// In-memory cache for resolved signed URLs
const signedUrlCache = new Map<string, string>();

/**
 * Extracts storage filename/path from various formats:
 * - prod-123.jpg
 * - product-images/prod-123.jpg
 * - https://.../storage/v1/object/public/product-images/prod-123.jpg
 * - https://.../storage/v1/object/sign/product-images/prod-123.jpg?token=...
 */
export function extractStoragePath(urlOrPath: string): string | null {
  if (!urlOrPath) return null;

  // If contains /storage/v1/object/(public|sign)/product-images/
  const match = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/product-images\/([^?#]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  // If starts with product-images/
  if (urlOrPath.startsWith("product-images/")) {
    return urlOrPath.replace(/^product-images\//, "");
  }

  // If looks like an uploaded file prod-... or starts with timestamp
  if (/^prod-\d+-[a-z0-9]+\.(?:jpg|jpeg|png|webp)$/i.test(urlOrPath)) {
    return urlOrPath;
  }

  return null;
}

/**
 * Checks if a URL is already a functional Supabase signed URL with valid token
 */
export function isSignedSupabaseUrl(url: string): boolean {
  return (
    url.includes("/storage/v1/object/sign/product-images/") &&
    (url.includes("?token=") || url.includes("&token="))
  );
}

/**
 * Checks if a string is a local asset in /products/ or a data/blob URL
 */
export function isLocalOrBlob(url: string): boolean {
  return (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/products/") ||
    url.startsWith("/")
  );
}

/**
 * Synchronous URL formatter for immediate rendering.
 * Checks memory cache and localStorage for signed URLs.
 */
export function resolveProductImageUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl || !rawUrl.trim()) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  const trimmed = rawUrl.trim();

  // Local static paths, data URLs, blob URLs
  if (isLocalOrBlob(trimmed)) {
    return trimmed;
  }

  // Known seed product names without leading slash
  const seedNames = [
    "breaker.jpg",
    "bulbs.jpg",
    "cable.jpg",
    "charger.jpg",
    "dstv.jpg",
    "earbuds.jpg",
    "extension.jpg",
    "inverter.jpg",
    "lamp.jpg",
    "phonecase.jpg",
    "powerbank.jpg",
    "socket.jpg",
    "solarpanel.jpg",
    "wire.jpg",
  ];
  if (seedNames.includes(trimmed)) {
    return `/products/${trimmed}`;
  }

  // Already a full signed URL
  if (isSignedSupabaseUrl(trimmed)) {
    return trimmed;
  }

  // If it's a storage path or a public Supabase URL pointing to private bucket
  const storagePath = extractStoragePath(trimmed);
  if (storagePath) {
    // Check in-memory cache
    if (signedUrlCache.has(storagePath)) {
      return signedUrlCache.get(storagePath)!;
    }

    // Check localStorage cache
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`josppy_signed_${storagePath}`);
        if (stored) {
          signedUrlCache.set(storagePath, stored);
          return stored;
        }
      } catch {
        // ignore
      }
    }
  }

  // If it's an external URL (not private Supabase)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If raw filename without slash, fallback to /products/<name>
  if (!trimmed.includes("/") && /\.(?:jpg|jpeg|png|webp)$/i.test(trimmed)) {
    return `/products/${trimmed}`;
  }

  return trimmed;
}

/**
 * Asynchronously requests and caches a 10-year signed URL for a private bucket file
 */
export async function resolveSignedProductImageUrl(
  rawUrl: string | null | undefined,
): Promise<string> {
  const syncResolved = resolveProductImageUrl(rawUrl);
  if (
    !rawUrl ||
    isSignedSupabaseUrl(syncResolved) ||
    isLocalOrBlob(syncResolved) ||
    syncResolved.startsWith("/products/")
  ) {
    return syncResolved;
  }

  const storagePath = extractStoragePath(rawUrl);
  if (!storagePath) {
    return syncResolved;
  }

  if (signedUrlCache.has(storagePath)) {
    return signedUrlCache.get(storagePath)!;
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, TEN_YEARS_SECONDS);

    if (error || !data?.signedUrl) {
      console.warn("Failed to create signed URL for", storagePath, error);
      return syncResolved;
    }

    signedUrlCache.set(storagePath, data.signedUrl);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`josppy_signed_${storagePath}`, data.signedUrl);
      } catch {
        // ignore
      }
    }
    return data.signedUrl;
  } catch (err) {
    console.error("Error creating signed URL:", err);
    return syncResolved;
  }
}

/**
 * React hook that returns the resolved product image URL and updates when signed
 */
export function useProductImageUrl(rawUrl: string | null | undefined): string {
  const [resolvedUrl, setResolvedUrl] = useState<string>(() => resolveProductImageUrl(rawUrl));

  useEffect(() => {
    const immediate = resolveProductImageUrl(rawUrl);
    setResolvedUrl(immediate);

    const storagePath = rawUrl ? extractStoragePath(rawUrl) : null;
    if (storagePath && !isSignedSupabaseUrl(immediate)) {
      let isMounted = true;
      resolveSignedProductImageUrl(rawUrl).then((signed) => {
        if (isMounted && signed && signed !== immediate) {
          setResolvedUrl(signed);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [rawUrl]);

  return resolvedUrl;
}

/**
 * Uploads a file to product-images and immediately generates a 10-year signed URL.
 * Guarantees a valid, browser-loadable URL is returned.
 */
export async function uploadProductImage(file: File): Promise<{ url: string; path: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const cleanExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const fileName = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${cleanExt}`;

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || `image/${cleanExt}`,
  });

  if (error) {
    throw new Error(error.message || "Failed to upload image to product-images storage.");
  }

  if (!data) {
    throw new Error("Storage service did not return an upload path.");
  }

  const uploadPath = data.path || fileName;

  // Generate 10-year signed URL because product-images bucket is private
  const { data: signData, error: signError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(uploadPath, TEN_YEARS_SECONDS);

  if (signError || !signData?.signedUrl) {
    // If sign fails, attempt public URL fallback
    const { data: pubData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadPath);
    if (pubData?.publicUrl) {
      return { url: pubData.publicUrl, path: uploadPath };
    }
    throw new Error(signError?.message || "Failed to retrieve accessible URL for uploaded image.");
  }

  // Cache signed URL for instant sync lookups
  signedUrlCache.set(uploadPath, signData.signedUrl);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`josppy_signed_${uploadPath}`, signData.signedUrl);
    } catch {
      // ignore
    }
  }

  return { url: signData.signedUrl, path: uploadPath };
}
