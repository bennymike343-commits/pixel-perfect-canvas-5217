-- Add payment tracking fields to existing orders. ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'awaiting_payment', ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz, ADD COLUMN IF NOT EXISTS payment_verified_by uuid;
-- Document the manual verification requirement. COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: awaiting_payment, verification_required, or paid. Only an authorized administrator should mark an order as paid.';
COMMENT ON COLUMN public.orders.payment_verified_at IS 'Time an administrator verified receipt of payment.';
COMMENT ON COLUMN public.orders.payment_verified_by IS 'Authenticated administrator who verified payment.';
