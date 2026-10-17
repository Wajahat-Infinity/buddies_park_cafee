-- Deals. Adds a `deals` table, edited from the admin panel under Deals, and
-- fills it with the seven deals from the printed posters.
-- Run once in the Supabase SQL editor, after schema.sql. Safe to re-run.
--
-- A deal is sold as one line at one price. Its contents are plain text lines
-- (`items`), not links to menu items, so a deal keeps reading correctly even
-- when a menu item is renamed or removed.

begin;

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- One line per thing in the box, e.g. '2 Chicken Shawarmas'.
  items text[] not null default '{}',
  price numeric(10,2) not null,
  -- A short highlight on the photo, e.g. 'Serves 4-5'. Optional.
  badge text,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  constraint deal_price_not_negative check (price >= 0)
);

create index if not exists deals_sort_idx on deals (sort_order, created_at);

alter table deals enable row level security;

drop policy if exists "public read deals" on deals;
drop policy if exists "admin write deals" on deals;

create policy "public read deals" on deals for select using (true);
create policy "admin write deals" on deals for all
  to authenticated using (true) with check (true);

-- The posters. Photos ship with the site under /deals/ and can be replaced
-- from the admin panel. Existing names are skipped, not duplicated.
insert into deals (name, items, price, badge, image_url, sort_order)
select v.name, v.items, v.price, v.badge, v.image_url, v.sort_order
from (values
  ('Solo Crunch',
    array['1 Classic Zinger', '1 Classic Fries', '1 Mango Slush'],
    699.00, null, '/deals/solo-crunch.jpg', 1),
  ('Shawarma Duo',
    array['2 Chicken Shawarmas', '1 Classic Fries', '2 Mango Slush'],
    999.00, null, '/deals/shawarma-duo.jpg', 2),
  ('Duo Delight',
    array['2 Zinger Burgers', '1 Garlic Mayo Fries', '2 Mango Slush'],
    1299.00, null, '/deals/duo-delight.jpg', 3),
  ('Wrap Duo',
    array['2 Tikka Wraps', '1 Garlic Mayo Fries', '2 Mango Slush'],
    1299.00, null, '/deals/wrap-duo.jpg', 4),
  ('Friends Feast',
    array['2 Chicken Patty Burgers', '2 Chicken Shawarmas',
          '12 pcs Classic Chicken Wings', '2 Classic Fries', '4 Mango Slush'],
    2899.00, 'Serves 4', '/deals/friends-feast.jpg', 5),
  ('Wrap & Shawarma Feast',
    array['2 Malai Tikka Wraps', '2 Cheesy Chicken Shawarmas',
          '12 pcs Classic Chicken Wings', '2 Classic Fries', '4 Mango Slush'],
    2999.00, 'Serves 4', '/deals/wrap-shawarma-feast.jpg', 6),
  ('Family Fest Deal',
    array['4 Zinger Burgers', '4 Chicken Shawarmas', '6 Spicy Wings',
          '1.5 L Next Cola'],
    2999.00, 'Serves 4-5', '/deals/family-fest.jpg', 7)
) as v(name, items, price, badge, image_url, sort_order)
where not exists (select 1 from deals d where d.name = v.name);

commit;

-- Check the result:
--   select name, price, badge, is_active from deals order by sort_order;
