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
  ('Burgers',   'burgers',   1),
  ('Pizza',     'pizza',     2),
  ('Fast Bites','fast-bites',3),
  ('Beverages', 'beverages', 4)
on conflict (slug) do nothing;

insert into menu_items (category_id, name, description, price, is_featured, sort_order)
select c.id, v.name, v.description, v.price, v.is_featured, v.sort_order
from (values
  ('burgers',    'Zinger Burger',   'Crispy fried chicken fillet, lettuce, mayo.',        650.00, true,  1),
  ('burgers',    'Beef Cheese Burger','Grilled beef patty with melted cheddar.',          750.00, false, 2),
  ('pizza',      'Chicken Fajita Pizza','Fajita chicken, peppers, onion, mozzarella.',   1200.00, true,  1),
  ('pizza',      'Creamy Malai Boti Pizza','Malai boti, garlic sauce, mozzarella.',      1350.00, false, 2),
  ('fast-bites', 'Loaded Fries',    'Fries topped with cheese sauce and jalapenos.',      450.00, false, 1),
  ('fast-bites', 'Chicken Wings',   'Six pieces, buffalo or BBQ.',                        550.00, false, 2),
  ('beverages',  'Cold Coffee',     'Blended iced coffee with cream.',                    400.00, true,  1),
  ('beverages',  'Fresh Lime Soda', 'Lime, soda, mint.',                                  250.00, false, 2)
) as v(slug, name, description, price, is_featured, sort_order)
join categories c on c.slug = v.slug
where not exists (
  select 1 from menu_items m where m.name = v.name and m.category_id = c.id
);
