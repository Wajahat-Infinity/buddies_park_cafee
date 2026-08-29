-- Buddies Park Cafe — database schema, row level security and storage policies.
-- Run this once in the Supabase SQL editor (Part 1, step 1).

-- ---------------------------------------------------------------- tables ----

create table if not exists site_settings (
  id int primary key default 1,
  cafe_name text not null default 'Cafe',
  tagline text,
  logo_url text,
  phone_display text,
  phone_whatsapp text,
  address text,
  hours text,
  currency text not null default 'Rs',
  instagram_url text,
  facebook_url text,
  whatsapp_greeting text default 'Hello, I would like to place an order.',
  announcement_text text,
  announcement_active boolean not null default false,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  tags text[] default '{}',
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table if not exists carousel_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  subtitle text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- Indexes for the ordering the public queries rely on.
create index if not exists categories_sort_idx on categories (sort_order, name);
create index if not exists menu_items_category_sort_idx on menu_items (category_id, sort_order, name);
create index if not exists carousel_slides_sort_idx on carousel_slides (sort_order, created_at);

-- ------------------------------------------------------ row level security ---

alter table site_settings enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table carousel_slides enable row level security;

drop policy if exists "public read settings" on site_settings;
drop policy if exists "public read categories" on categories;
drop policy if exists "public read items" on menu_items;
drop policy if exists "public read slides" on carousel_slides;

create policy "public read settings" on site_settings for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read items" on menu_items for select using (true);
create policy "public read slides" on carousel_slides for select using (true);

drop policy if exists "admin write settings" on site_settings;
drop policy if exists "admin write categories" on categories;
drop policy if exists "admin write items" on menu_items;
drop policy if exists "admin write slides" on carousel_slides;

create policy "admin write settings" on site_settings for all
  to authenticated using (true) with check (true);
create policy "admin write categories" on categories for all
  to authenticated using (true) with check (true);
create policy "admin write items" on menu_items for all
  to authenticated using (true) with check (true);
create policy "admin write slides" on carousel_slides for all
  to authenticated using (true) with check (true);

-- ------------------------------------------------------------- storage ------
-- Create a PUBLIC bucket named `media` in the Storage tab first, then run this.
-- Folders (logo/, menu/, carousel/) are created implicitly on first upload.

drop policy if exists "public read media" on storage.objects;
drop policy if exists "admin upload media" on storage.objects;
drop policy if exists "admin update media" on storage.objects;
drop policy if exists "admin delete media" on storage.objects;

create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');
create policy "admin upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "admin update media" on storage.objects
  for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
create policy "admin delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
