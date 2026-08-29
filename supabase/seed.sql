-- Buddies Park Cafe — seed data (Part 1, step 4).
-- Run once, after schema.sql. Every value here is editable from the admin
-- panel afterwards; nothing below is baked into the application source.

insert into site_settings (
  id, cafe_name, tagline, phone_display, phone_whatsapp, address, hours,
  currency, whatsapp_greeting, announcement_text, announcement_active
) values (
  1,
  'Buddies Park Cafe by BZ',
  'Good food, good company, by the park',
  '0339 6789789',
  '923396789789',
  '37 Street, 18, DHA Serene City Zone 2 DHA III, Rawalpindi, 44000',
  'Daily, 12pm to 12am',
  'Rs',
  'Hello, I would like to place an order.',
  null,
  false
)
on conflict (id) do nothing;

insert into categories (name, slug, sort_order) values
  ('Ice Cream',      'ice-cream',      1),
  ('Shakes',         'shakes',         2),
  ('Chinese',        'chinese',        3),
  ('Burgers',        'burgers',        4),
  ('Wraps and Fries','wraps-and-fries',5)
on conflict (slug) do nothing;

-- Placeholder menu items, three per category, so the site has something to
-- render before the real menu is entered. Names, prices and descriptions are
-- invented: replace or delete them in the admin panel before going live.
-- Re-running this file will not duplicate them.
insert into menu_items
  (category_id, name, description, price, is_available, is_featured, tags, sort_order)
select c.id, v.name, v.description, v.price, v.is_available, v.is_featured, v.tags, v.sort_order
from (values
  -- Ice Cream
  ('ice-cream', 'Chocolate Fudge Sundae', 'Chocolate ice cream, fudge sauce, crushed nuts.', 450.00, true,  true,  array['Cold'],           1),
  ('ice-cream', 'Vanilla Scoop',          'Two scoops of classic vanilla.',                  250.00, true,  false, array[]::text[],         2),
  ('ice-cream', 'Falooda Special',        'Rose syrup, vermicelli, kulfi and basil seeds.',  550.00, true,  false, array['Signature'],      3),

  -- Shakes
  ('shakes',    'Oreo Shake',             'Thick shake blended with Oreo cookies.',          500.00, true,  true,  array['Bestseller'],     1),
  ('shakes',    'Mango Shake',            'Fresh mango blended with milk and ice.',          450.00, true,  false, array['Seasonal'],       2),
  ('shakes',    'Cold Coffee',            'Blended iced coffee topped with cream.',          400.00, true,  false, array[]::text[],         3),

  -- Chinese
  ('chinese',   'Chicken Chow Mein',      'Stir fried noodles with chicken and vegetables.', 750.00, true,  true,  array[]::text[],         1),
  ('chinese',   'Chicken Manchurian',     'Served with a portion of egg fried rice.',        850.00, true,  false, array['Spicy'],          2),
  ('chinese',   'Hot and Sour Soup',      'Classic peppery soup with shredded chicken.',     400.00, false, false, array[]::text[],         3),

  -- Burgers
  ('burgers',   'Zinger Burger',          'Crispy fried chicken fillet, lettuce and mayo.',  650.00, true,  true,  array['Bestseller'],     1),
  ('burgers',   'Beef Cheese Burger',     'Grilled beef patty with melted cheddar.',         750.00, true,  false, array[]::text[],         2),
  ('burgers',   'Chicken Patty Burger',   'Grilled chicken patty with garlic sauce.',        600.00, true,  false, array[]::text[],         3),

  -- Wraps and Fries
  ('wraps-and-fries', 'Chicken Shawarma Wrap', 'Chicken, garlic sauce and pickles in a paratha.', 500.00, true,  true,  array[]::text[],    1),
  ('wraps-and-fries', 'Loaded Fries',          'Fries topped with cheese sauce and jalapenos.',   450.00, true,  false, array['Shareable'], 2),
  ('wraps-and-fries', 'Plain Fries',           'Regular portion of salted fries.',                250.00, true,  false, array[]::text[],    3)
) as v(slug, name, description, price, is_available, is_featured, tags, sort_order)
join categories c on c.slug = v.slug
where not exists (
  select 1 from menu_items m where m.name = v.name and m.category_id = c.id
);
