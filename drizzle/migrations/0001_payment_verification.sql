-- JOSPPY GADGETS: Payment verification and customer profile photos.
-- Safe to run more than once.

-- 1. Add payment verification fields to existing orders.
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'transfer',
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'awaiting_payment',
ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz,
ADD COLUMN IF NOT EXISTS payment_verified_by uuid;

-- 2. Add optional customer profile photo URL.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 3. Document the manual verification rule.
COMMENT ON COLUMN public.orders.payment_status IS
'Payment status: awaiting_payment, verification_required, or paid. Only an authorized administrator may mark payment as paid after confirming receipt.';

COMMENT ON COLUMN public.orders.payment_verified_at IS
'Timestamp when an administrator confirmed receipt of payment.';

COMMENT ON COLUMN public.orders.payment_verified_by IS
'ID of the administrator who verified payment.';

COMMENT ON COLUMN public.profiles.avatar_url IS
'Optional customer profile photo URL.';
