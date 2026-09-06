-- Delivery charge. Adds three settings columns, all edited from the admin panel.
-- Run once in the Supabase SQL editor, after schema.sql. Safe to re-run.
--
-- Existing rows get a fee of 0, so the site behaves exactly as before until the
-- owner sets a value under Settings > Ordering.

begin;

alter table site_settings
  add column if not exists delivery_fee numeric(10,2) not null default 0,
  -- Null means the fee always applies; a number waives it once the subtotal
  -- (the items alone) reaches it.
  add column if not exists free_delivery_over numeric(10,2),
  -- Free text shown under the delivery address field, e.g. an area limit.
  add column if not exists delivery_note text;

-- A negative charge is never intended, and the admin form already refuses one.
alter table site_settings drop constraint if exists delivery_fee_not_negative;
alter table site_settings add constraint delivery_fee_not_negative
  check (delivery_fee >= 0);

alter table site_settings drop constraint if exists free_delivery_over_positive;
alter table site_settings add constraint free_delivery_over_positive
  check (free_delivery_over is null or free_delivery_over > 0);

commit;

-- Check the result:
--   select delivery_fee, free_delivery_over, delivery_note
--   from site_settings where id = 1;
