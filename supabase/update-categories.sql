-- Replace the placeholder seed categories with the cafe's real ones.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Deleting a category cascades to its menu_items. Any photos those items used
-- stay in the media bucket; remove them from Storage by hand if you had
-- uploaded real ones (the seed items had none).

begin;

-- 1. Drop the placeholder categories that are not on the real menu.
delete from categories where slug in ('pizza', 'fast-bites', 'beverages');

-- 2. Add the real categories. Existing slugs are left untouched.
insert into categories (name, slug, sort_order) values
  ('Ice Cream',      'ice-cream',      1),
  ('Shakes',         'shakes',         2),
  ('Chinese',        'chinese',        3),
  ('Burgers',        'burgers',        4),
  ('Wraps and Fries','wraps-and-fries',5)
on conflict (slug) do nothing;

-- 3. Force the display order, so a pre-existing row (Burgers) sits correctly.
update categories set sort_order = 1 where slug = 'ice-cream';
update categories set sort_order = 2 where slug = 'shakes';
update categories set sort_order = 3 where slug = 'chinese';
update categories set sort_order = 4 where slug = 'burgers';
update categories set sort_order = 5 where slug = 'wraps-and-fries';

commit;

-- Check the result:
--   select name, slug, sort_order, is_active from categories order by sort_order;
