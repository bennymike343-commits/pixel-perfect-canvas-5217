-- Add separate payment verification fields without changing existing order statuses.
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'transfer',
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'awaiting_payment',
ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz,
ADD COLUMN IF NOT EXISTS payment_verified_by uuid;
-- Restrict payment methods and statuses to supported values.
ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_method_check
CHECK (payment_method IN ('transfer', 'pod'));
ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_status_check
CHECK (payment_status IN ('awaiting_payment', 'verification_required', 'paid'));
-- Existing orders remain unpaid until an administrator verifies payment.
COMMENT ON COLUMN public.orders.payment_status IS
'Payment status. Receipt uploads alone must never set this to paid.';
COMMENT ON COLUMN public.orders.payment_verified_at IS
'Timestamp when an administrator verified the payment.';
COMMENT ON COLUMN public.orders.payment_verified_by IS
'Authenticated administrator who verified the payment.';
