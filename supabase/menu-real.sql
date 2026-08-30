-- Buddies Park Cafe — the real menu, taken from the printed card.
-- Run once in the Supabase SQL editor, after schema.sql.
--
-- This REPLACES the placeholder categories and items. Photos are added
-- afterwards through the admin panel; descriptions are left empty because the
-- printed menu has none, and inventing them is not this file's job.
--
-- Items sold in two sizes are listed as two rows, because an item carries a
-- single price. Rename or delete either row from the admin panel.

begin;

-- 1. Clear the placeholder menu. Cascades to its items.
delete from categories
where slug in (
  'ice-cream', 'shakes', 'chinese', 'burgers', 'wraps-and-fries',
  'pizza', 'fast-bites', 'beverages'
);

-- 2. The nine sections of the printed menu, in card order.
insert into categories (name, slug, sort_order) values
  ('Burger Yard', 'burger-yard', 1),
  ('Wrap & Roll Station', 'wrap-roll-station', 2),
  ('Wing Zone', 'wing-zone', 3),
  ('Wok & Rice', 'wok-rice', 4),
  ('Buddies Fries & Bites', 'fries-bites', 5),
  ('Coffee & Tea', 'coffee-tea', 6),
  ('Shake Bar', 'shake-bar', 7),
  ('Chill Bar', 'chill-bar', 8),
  ('Sweet Park', 'sweet-park', 9)
on conflict (slug) do update
  set name = excluded.name,
      sort_order = excluded.sort_order;

-- 3. Every item. Safe to re-run: existing names are skipped, not duplicated.
insert into menu_items (category_id, name, price, is_featured, sort_order)
select c.id, v.name, v.price, v.is_featured, v.sort_order
from (values
  ('burger-yard', 'Tikka Crunch Burger'                    , 350.00, false,  1),
  ('burger-yard', 'Classic Zinger'                         , 370.00, true ,  2),
  ('burger-yard', 'Anda Shami Classic'                     , 250.00, false,  3),
  ('burger-yard', 'Chicken Patty Burger'                   , 350.00, false,  4),
  ('burger-yard', 'Cheesy Zinger'                          , 400.00, false,  5),
  ('burger-yard', 'Double Zinger Stack'                    , 650.00, true ,  6),
  ('burger-yard', 'Beef Patty Burger'                      , 400.00, false,  7),
  ('wrap-roll-station', 'Tikka Wrap'                             , 380.00, false,  1),
  ('wrap-roll-station', 'Malai Tikka Wrap'                       , 400.00, false,  2),
  ('wrap-roll-station', 'Chicken Shawarma'                       , 280.00, true ,  3),
  ('wrap-roll-station', 'Cheesy Chicken Shawarma'                , 320.00, false,  4),
  ('wrap-roll-station', 'Zinger Roll'                            , 340.00, false,  5),
  ('wrap-roll-station', 'Chicken Mayo Roll'                      , 300.00, false,  6),
  ('wing-zone', 'Honey Glazed Wings (6 pcs)'             , 550.00, true ,  1),
  ('wing-zone', 'Honey Glazed Wings (12 pcs)'            , 880.00, false,  2),
  ('wing-zone', 'Spicy Wings (6 pcs)'                    , 550.00, false,  3),
  ('wing-zone', 'Spicy Wings (12 pcs)'                   , 880.00, false,  4),
  ('wing-zone', 'Classic Chicken Wings (6 pcs)'          , 500.00, false,  5),
  ('wing-zone', 'Classic Chicken Wings (12 pcs)'         , 750.00, false,  6),
  ('wok-rice', 'Classic Fried Rice'                     , 350.00, false,  1),
  ('wok-rice', 'Egg Fried Rice'                         , 400.00, false,  2),
  ('wok-rice', 'Chicken Fried Rice'                     , 450.00, false,  3),
  ('wok-rice', 'Chicken Chow Mein'                      , 750.00, true ,  4),
  ('wok-rice', 'Chicken Chilli Dry'                     , 699.00, false,  5),
  ('wok-rice', 'Chicken Manchurian'                     , 685.00, false,  6),
  ('fries-bites', 'Classic Fries'                          , 299.00, false,  1),
  ('fries-bites', 'Masala Fries'                           , 325.00, false,  2),
  ('fries-bites', 'Garlic Mayo Fries'                      , 370.00, false,  3),
  ('fries-bites', 'BBQ Fries'                              , 370.00, false,  4),
  ('fries-bites', 'Honey Mustard Fries'                    , 400.00, false,  5),
  ('fries-bites', 'Loaded Fries'                           , 499.00, true ,  6),
  ('fries-bites', 'Cheesy Fries'                           , 566.00, false,  7),
  ('fries-bites', 'Chicken Nuggets (6 pcs)'                , 300.00, false,  8),
  ('fries-bites', 'Chicken Nuggets (12 pcs)'               , 600.00, false,  9),
  ('fries-bites', 'Hot Shots (6 pcs)'                      , 500.00, false, 10),
  ('coffee-tea', 'Buddies Cold Coffee'                    , 450.00, true ,  1),
  ('coffee-tea', 'Cappuccino'                             , 500.00, false,  2),
  ('coffee-tea', 'Cold Coffee + Ice Cream'                , 650.00, false,  3),
  ('coffee-tea', 'Iced Vanilla Latte'                     , 500.00, false,  4),
  ('coffee-tea', 'Classic Tea'                            , 150.00, false,  5),
  ('coffee-tea', 'Cardamom Tea'                           , 170.00, false,  6),
  ('shake-bar', 'Oreo Ice Cream Shake'                   , 640.00, true ,  1),
  ('shake-bar', 'Mango Ice Cream Shake'                  , 640.00, false,  2),
  ('shake-bar', 'Strawberry Ice Cream Shake'             , 640.00, false,  3),
  ('shake-bar', 'Chocolate Ice Cream Shake'              , 640.00, false,  4),
  ('shake-bar', 'Vanilla Ice Cream Shake'                , 640.00, false,  5),
  ('shake-bar', 'Classic Chocolate Shake'                , 600.00, false,  6),
  ('chill-bar', 'Mango Slush'                            , 200.00, false,  1),
  ('chill-bar', 'Peach Chiller'                          , 200.00, false,  2),
  ('chill-bar', 'Lychee Chiller'                         , 200.00, false,  3),
  ('chill-bar', 'Blue Lagoon'                            , 200.00, false,  4),
  ('chill-bar', 'Mint Margarita'                         , 250.00, true ,  5),
  ('sweet-park', 'Nutella Mini Pancakes (6 pcs)'          , 280.00, true ,  1),
  ('sweet-park', 'Nutella Mini Pancakes (12 pcs)'         , 540.00, false,  2),
  ('sweet-park', 'Oreo Mini Pancakes (6 pcs)'             , 320.00, false,  3),
  ('sweet-park', 'Oreo Mini Pancakes (12 pcs)'            , 580.00, false,  4),
  ('sweet-park', 'Coco Double Chocolate Pancakes (6 pcs)' , 400.00, false,  5),
  ('sweet-park', 'Coco Double Chocolate Pancakes (12 pcs)', 750.00, false,  6),
  ('sweet-park', 'Oreo Waffle Stick'                      , 420.00, false,  7),
  ('sweet-park', 'Nutella Waffle Stick'                   , 380.00, false,  8),
  ('sweet-park', 'Triple Chocolate Waffle Stick'          , 550.00, false,  9),
  ('sweet-park', 'Coffee Waffle Stick'                    , 490.00, false, 10),
  ('sweet-park', 'Caramel Waffle Stick'                   , 490.00, false, 11),
  ('sweet-park', 'Cadbury Loaded Waffle (single)'         , 450.00, false, 12),
  ('sweet-park', 'Cadbury Loaded Waffle (double)'         , 750.00, false, 13),
  ('sweet-park', 'Nutella Waffle + Ice Cream (single)'    , 520.00, true , 14),
  ('sweet-park', 'Nutella Waffle + Ice Cream (double)'    , 820.00, false, 15),
  ('sweet-park', 'Oreo Waffle + Ice Cream (single)'       , 520.00, false, 16),
  ('sweet-park', 'Oreo Waffle + Ice Cream (double)'       , 820.00, false, 17),
  ('sweet-park', 'Nutty Waffle + Ice Cream (single)'      , 520.00, false, 18),
  ('sweet-park', 'Nutty Waffle + Ice Cream (double)'      , 820.00, false, 19),
  ('sweet-park', 'KitKat Waffle (single)'                 , 520.00, false, 20),
  ('sweet-park', 'KitKat Waffle (double)'                 , 820.00, false, 21)
) as v(slug, name, price, is_featured, sort_order)
join categories c on c.slug = v.slug
where not exists (
  select 1 from menu_items m where m.name = v.name and m.category_id = c.id
);

commit;

-- Check the result:
--   select c.name, count(m.id)
--   from categories c left join menu_items m on m.category_id = c.id
--   group by c.name, c.sort_order order by c.sort_order;
