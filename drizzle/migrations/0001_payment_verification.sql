-- JOSPPY GADGETS: Payment verification and customer profile photos.
-- Safe to rerun for the schema changes below.

-- 1. Add payment verification fields.
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'transfer',
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'awaiting_payment',
ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz,
ADD COLUMN IF NOT EXISTS payment_verified_by uuid;

-- 2. Validate payment status values.
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_status_check
CHECK (payment_status IN (
  'awaiting_payment',
  'verification_required',
  'paid'
));

-- 3. Add optional profile photo URL.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 4. Document the payment verification rule.
COMMENT ON COLUMN public.orders.payment_status IS
'Payment status: awaiting_payment, verification_required, or paid. Payment must be manually verified by an authorized administrator.';

COMMENT ON COLUMN public.orders.payment_verified_at IS
'Timestamp when an administrator confirmed receipt of payment.';

COMMENT ON COLUMN public.orders.payment_verified_by IS
'ID of the administrator who verified payment.';

COMMENT ON COLUMN public.profiles.avatar_url IS
'Optional customer profile photo URL.';

-- 5. Create a private bucket for customer profile photos.
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Allow authenticated users to upload photos into their own folder.
DROP POLICY IF EXISTS "Users upload own profile photos"
ON storage.objects;

CREATE POLICY "Users upload own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. Allow users to update photos in their own folder.
DROP POLICY IF EXISTS "Users update own profile photos"
ON storage.objects;

CREATE POLICY "Users update own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 8. Allow users to delete photos in their own folder.
DROP POLICY IF EXISTS "Users delete own profile photos"
ON storage.objects;

CREATE POLICY "Users delete own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 9. Allow users to read their own photos and administrators
-- to read customer photos for order management.
DROP POLICY IF EXISTS "Users and admins read profile photos"
ON storage.objects;

CREATE POLICY "Users and admins read profile photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);
