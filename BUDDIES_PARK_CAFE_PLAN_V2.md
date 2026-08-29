# Buddies Park Cafe by BZ — Web App Project Plan (v2, fully dynamic)

Version 2.0
Supersedes v1. The key change: **everything the customer sees is managed from an admin panel.** Logo, cafe name, WhatsApp number, address, hours, carousel slides, categories and menu items are all stored in the database and edited through a login protected admin area. No code change is needed to update the site.

---

## 0. RULES FOR CLAUDE CODE (READ FIRST)

1. **NEVER run `git push`.** The developer pushes to GitHub manually. Claude Code may commit locally only when asked. Pushing is always done by the developer.
2. **NEVER run `git remote add`, `git push --force`, or any command that changes the remote.**
3. Build one Part at a time. Stop at the end of each Part, print the suggested commit message, and wait for review. Do not run ahead.
4. **Nothing on the public site may be hardcoded.** No cafe name, phone number, address, logo, price, or item name in the source code. Every one of those values comes from the database. If a value is missing, render a safe fallback, never a hardcoded literal.
5. Do not install libraries outside the approved stack in section 3 without asking.
6. Mobile first always. Test at 375px width before anything else.
7. Never commit `.env.local` or any Supabase service role key. The service role key must never appear in client side code.

---

## 1. Business Context

From the Google Business listing. **These are seed values only.** They go into the database once, then become editable from the admin panel.

* Business name: Buddies Park Cafe by BZ
* Type: Cafe
* Address: 37 Street, 18, DHA Serene City Zone 2 DHA III, Rawalpindi, 44000
* Phone display: 0339 6789789
* WhatsApp format: `923396789789`
* Rating: 5.0 from 7 Google reviews
* Nearby landmarks: Serene Park, Laa Caasa, DHA Serene City Zone 3

---

## 2. Requirements

### 2.1 Public site (customer facing)

1. Animated hero section with a carousel of slides (photos of the cafe, specials, offers), all slides managed from the admin panel.
2. A featured items carousel showing items flagged as featured in the admin panel.
3. Menu grouped into categories, with animated tab or filter switching.
4. Menu item cards with photo, name, description, price, availability state and optional badges. Cards animate in on scroll and respond to interaction.
5. Cart: add item, change quantity, remove item, running total.
6. Sticky animated cart bar and a slide in cart drawer.
7. A single primary action that builds a formatted WhatsApp message from the cart and opens WhatsApp using the number stored in settings.
8. Location section with an embedded map driven by the address in settings, plus tap to call and directions.
9. Header and footer showing the logo, cafe name, phone and hours pulled from settings.
10. Optional announcement bar (for example "Closed today" or "New winter menu") toggled from the admin panel.

### 2.2 Admin panel

Reachable at `/admin`, protected by email and password login.

1. **Settings:** cafe name, tagline, logo upload, WhatsApp number, display phone, address, opening hours, currency symbol, Instagram and Facebook links, announcement text with an on or off toggle.
2. **Carousel:** add, edit, reorder, activate or deactivate slides. Each slide has an image, optional title and subtitle.
3. **Categories:** add, rename, reorder, activate or deactivate.
4. **Menu items:** add, edit, delete. Fields: category, name, description, price, photo upload, available toggle, featured toggle, tags, sort order.
5. **Image uploads** go to object storage, not the repository.
6. Changes appear on the public site immediately or within a short revalidation window.
7. Admin screens are usable on a phone, since the owner will often edit from a phone.

### 2.3 Non functional

1. Mobile first, tested at 375px.
2. Animations must be smooth on a mid range Android phone. Prefer transform and opacity. Respect `prefers-reduced-motion`.
3. Images optimised and lazy loaded. Uploaded images resized before or on upload.
4. Fast first load on a slow connection.
5. Warm cafe aesthetic, not a generic template.
6. Public pages readable and orderable with no login.

### 2.4 Out of scope for this version

* Online payment
* Customer accounts or saved order history
* Automated WhatsApp replies or a chatbot (needs the WhatsApp Business API)
* Table reservations, delivery tracking, multi branch

---

## 3. Technology Stack

**Framework:** Next.js 14, App Router, TypeScript. Server Components for public pages, Server Actions for admin mutations.

**Styling:** Tailwind CSS.

**Components:** shadcn/ui. Provides card, tabs, sheet, dialog, form, input, select, switch, table, toast, and importantly `carousel`.

**Carousel:** the shadcn `carousel` component, which wraps Embla Carousel, plus `embla-carousel-autoplay` for the hero.

**Animation:** Framer Motion for scroll reveals, card entrance, cart transitions and page level motion. Tailwind transitions for simple hover and tap states.

**Database:** Supabase (hosted Postgres). Free tier. This is required from Part 1 now, not optional, because everything is dynamic.

**Auth:** Supabase Auth with email and password. One admin user, created manually in the Supabase dashboard. No public sign up.

**Object storage: yes, required.** Supabase Storage, one public bucket named `media` with folders `logo/`, `menu/`, and `carousel/`. This is what makes logo and photo uploads possible from the admin panel.

**Icons:** lucide-react (installed with shadcn).

**Map:** Google Maps iframe embed built from the address in settings. No API key needed.

**Ordering:** WhatsApp click to chat link `wa.me`. Free, no API key, no approval.

**Hosting:** Vercel for the app, Supabase for database, auth and storage. Both free tiers are ample for one cafe.

**Version control:** Git and GitHub. Pushing done manually by the developer.

### Direct answers

**Do I need a database?** Yes, now that the admin panel drives everything. Supabase.

**Do I need object storage?** Yes. The owner uploads a logo, menu photos and carousel images from the admin panel, so those files cannot live in the repository. Supabase Storage handles this and sits next to the database.

**Where do I host?** App on Vercel, data and files on Supabase.

---

## 4. Project Structure

```
buddies-park-cafe/
  app/
    layout.tsx
    page.tsx
    globals.css
    admin/
      layout.tsx
      page.tsx
      login/page.tsx
      settings/page.tsx
      carousel/page.tsx
      categories/page.tsx
      menu/page.tsx
      menu/[id]/page.tsx
      actions.ts
  components/
    public/
      AnnouncementBar.tsx
      Header.tsx
      HeroCarousel.tsx
      FeaturedCarousel.tsx
      MenuSection.tsx
      MenuItemCard.tsx
      CartBar.tsx
      CartDrawer.tsx
      LocationSection.tsx
      Footer.tsx
    admin/
      AdminNav.tsx
      ImageUploader.tsx
      MenuItemForm.tsx
      CategoryForm.tsx
      SlideForm.tsx
      SettingsForm.tsx
    motion/
      FadeIn.tsx
      StaggerGroup.tsx
  context/
    CartContext.tsx
  lib/
    supabase/client.ts
    supabase/server.ts
    queries.ts
    whatsapp.ts
    format.ts
    types.ts
  middleware.ts
  public/
    fallback/
```

---

## 5. Database Schema

Run this in the Supabase SQL editor.

```sql
create table site_settings (
  id int primary key default 1,
  cafe_name text not null default 'Buddies Park Cafe by BZ',
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

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table menu_items (
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

create table carousel_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  subtitle text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);
```

### Row Level Security

Public read for everyone, write only for authenticated users.

```sql
alter table site_settings enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table carousel_slides enable row level security;

create policy "public read settings" on site_settings for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read items" on menu_items for select using (true);
create policy "public read slides" on carousel_slides for select using (true);

create policy "admin write settings" on site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write categories" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write items" on menu_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write slides" on carousel_slides for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

### Storage

Create a public bucket named `media`. Allow public read. Allow insert, update and delete only for authenticated users.

---

## 6. Implementation Plan

Give Claude Code one Part at a time. Review, test, then commit and push yourself.

---

### PART 0 — Scaffold and Deployment Pipeline

**Goal:** An empty but live app on Vercel, so deployment is proven before real work begins.

**Tasks**

1. `npx create-next-app@latest buddies-park-cafe --typescript --tailwind --app --eslint`
2. `npx shadcn@latest init`
3. `npx shadcn@latest add button card tabs sheet dialog form input textarea select switch table badge separator carousel toast skeleton label`
4. `npm install embla-carousel-autoplay framer-motion`
5. Replace the boilerplate in `app/page.tsx` with a placeholder heading.
6. Add `.env.local` to `.gitignore` and create `.env.example` listing the Supabase variable names with empty values.

**Test:** `npm run dev` loads the placeholder. `npm run build` passes.

**Commit:** `Part 0: scaffold Next.js with Tailwind, shadcn, carousel and framer motion`

**Developer actions:** create the GitHub repo, push, then import it on vercel.com. Leave build settings on default. Confirm the live URL loads.

---

### PART 1 — Supabase Setup and Data Layer

**Goal:** Database, storage, auth and typed query helpers in place. Nothing visible yet.

**Tasks**

1. Create a Supabase project. Run the schema and RLS policies from section 5.
2. Create the public `media` bucket with folders `logo/`, `menu/`, `carousel/`.
3. Create one admin user in the Supabase dashboard under Authentication, Users. Disable public sign up in the auth settings.
4. Seed `site_settings` with the values from section 1, and seed three or four categories with a few sample items so later Parts have something to render.
5. `npm install @supabase/supabase-js @supabase/ssr`
6. Build `lib/supabase/client.ts` (browser client) and `lib/supabase/server.ts` (server client with cookie handling).
7. Build `lib/types.ts` with TypeScript types matching every table.
8. Build `lib/queries.ts` with `getSettings()`, `getActiveSlides()`, `getCategoriesWithItems()`, `getFeaturedItems()`. Each returns typed data and handles the error case gracefully.
9. Add environment variables to `.env.local`: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
10. Add the Supabase storage hostname to `images.remotePatterns` in `next.config.js`.

**Test**

* A temporary server component rendering `getSettings()` prints the seeded cafe name
* `getCategoriesWithItems()` returns categories in `sort_order` with their items nested
* Inactive categories and slides are excluded by the queries
* Nothing breaks if a table is empty

**Commit:** `Part 1: Supabase schema, storage, auth setup and typed data layer`

**Developer action:** add the two environment variables in Vercel under Project Settings, Environment Variables.

---

### PART 2 — Dynamic Shell: Announcement, Header, Footer

**Goal:** The site chrome renders entirely from `site_settings`.

**Tasks**

1. `components/public/AnnouncementBar.tsx`: renders only when `announcement_active` is true. Slides down on mount.
2. `components/public/Header.tsx`: logo image from `logo_url`, cafe name, a call link built from `phone_display`, and a WhatsApp link built from `phone_whatsapp`. Sticky, with a subtle shadow that appears on scroll.
3. `components/public/Footer.tsx`: cafe name, address, hours, phone, and social links rendered only when their URLs exist.
4. Fallbacks: if `logo_url` is empty show the cafe name as text. If a social URL is empty hide that icon. Never render an empty broken image.
5. Fetch settings once in `app/page.tsx` and pass down, rather than querying in every component.

**Test**

* Changing the cafe name in the Supabase table changes the header and footer after refresh
* Uploading a logo URL into the settings row shows the logo
* Clearing `announcement_text` and toggling the flag off removes the bar entirely
* No cafe name, number or address appears anywhere in the source code

**Commit:** `Part 2: dynamic announcement bar, header and footer from settings`

---

### PART 3 — Hero Carousel

**Goal:** An animated, autoplaying hero carousel driven by the `carousel_slides` table.

**Tasks**

1. `components/public/HeroCarousel.tsx` using the shadcn carousel with the autoplay plugin. Loop enabled, roughly five seconds per slide, autoplay pausing on hover or touch.
2. Each slide: full width image with a soft dark gradient overlay, plus the title and subtitle animated in with Framer Motion.
3. Dot indicators, and arrows on desktop only.
4. A call to action button that smooth scrolls to the menu section.
5. If there are no active slides, fall back to a plain hero with the cafe name and tagline from settings. If there is exactly one slide, disable autoplay and hide the dots.
6. Fixed aspect ratio so the layout does not jump while images load. Skeleton placeholder during load.

**Test**

* Adding a slide row in Supabase makes it appear in the carousel
* Reordering by `sort_order` changes the display order
* Setting `is_active` to false removes the slide
* Swipe works on a touch device
* Autoplay stops when the user interacts
* No layout shift when images load

**Commit:** `Part 3: animated autoplay hero carousel driven by database slides`

---

### PART 4 — Menu Display and Featured Carousel

**Goal:** The menu itself, animated, plus a horizontal carousel of featured items.

**Tasks**

1. `components/public/MenuItemCard.tsx`: photo, name, description, formatted price, tag badges, availability state, and an add action. Hover lift on desktop, press feedback on mobile, image zoom on hover.
2. `components/public/FeaturedCarousel.tsx`: a horizontally scrolling carousel of items where `is_featured` is true, showing partial cards at the edge so it is obvious it scrolls. Hidden entirely when there are no featured items.
3. `components/public/MenuSection.tsx`: animated category tabs, with the panel cross fading on change.
4. `components/motion/FadeIn.tsx` and `StaggerGroup.tsx`: reusable Framer Motion wrappers so cards reveal in a staggered sequence as they enter the viewport.
5. Responsive grid: one column on mobile, two on tablet, three on desktop.
6. Unavailable items are greyed with a "Sold out" badge and the add action disabled.
7. `lib/format.ts` builds prices using the `currency` value from settings, never a hardcoded symbol.
8. Respect `prefers-reduced-motion` by disabling entrance animation for users who ask for it.

**Test**

* Adding an item in Supabase makes it appear under the right category
* Toggling `is_featured` adds or removes it from the featured carousel
* Toggling `is_available` greys the card and blocks adding it
* Changing `currency` in settings changes every price symbol
* Long names and descriptions do not break the card
* Animation is smooth on a real phone, not just the laptop

**Commit:** `Part 4: menu cards, featured carousel and scroll reveal animation`

---

### PART 5 — Cart

**Goal:** The customer can build an order.

**Tasks**

1. `context/CartContext.tsx`: in memory cart with `addItem`, `increment`, `decrement`, `removeItem`, `clearCart`, plus derived `itemCount` and `total`. Store the item snapshot (name and price at the time of adding) so a later price edit does not corrupt an open cart.
2. `components/public/CartBar.tsx`: sticky bottom bar that slides up when the first item is added and slides away when the cart empties. Item count animates on change.
3. `components/public/CartDrawer.tsx`: shadcn `Sheet` listing items with animated quantity steppers, remove actions, subtotal and total.
4. In `MenuItemCard`, swap the add button for a quantity stepper once the item is in the cart, with a smooth transition between the two states.
5. Empty cart state with a friendly message.

**Test**

* Totals recalculate correctly on every action
* The cart survives category tab switching
* The sticky bar is completely hidden and non interactive when the cart is empty
* Removing the last item transitions cleanly rather than snapping
* Adding the same item from the featured carousel and from the menu grid increments the same line, not two lines

**Commit:** `Part 5: animated cart context, sticky bar and drawer`

---

### PART 6 — WhatsApp Ordering

**Goal:** The core conversion step, using the number from settings.

**Tasks**

1. `lib/whatsapp.ts` with `buildOrderMessage(cart, settings)` producing:

   ```
   Hello Buddies Park Cafe by BZ, I would like to place an order.

   2 x Zinger Burger .......... Rs 1300
   1 x Cold Coffee ............ Rs 450

   Total: Rs 1750

   Name:
   Pickup or delivery:
   Address (if delivery):
   ```

   The greeting line comes from `whatsapp_greeting`, the cafe name from `cafe_name`, the symbol from `currency`.
2. `buildWhatsAppUrl(message, phone)` runs `encodeURIComponent` and returns `https://wa.me/{phone_whatsapp}?text={encoded}`.
3. Wire the drawer button to open that URL in a new tab, with a brief loading or success animation.
4. Disable the button when the cart is empty. Guard against a missing WhatsApp number in settings by hiding the button and showing the call link instead.
5. Optionally clear the cart afterwards and show a thank you state.

**Test**

* On a real Android and a real iPhone, the WhatsApp app opens with the message intact
* On desktop, WhatsApp Web opens with the same message
* Line breaks and the currency symbol survive URL encoding
* Changing `phone_whatsapp` in the admin table sends the next order to the new number
* An order with ten or more lines still produces a link that opens

**Commit:** `Part 6: WhatsApp order builder using settings driven number and currency`

**Checkpoint:** push here and test the entire flow on a real phone against the live Vercel URL. WhatsApp behaves differently on a device than in a desktop browser.

---

### PART 7 — Location and Map

**Goal:** Map and contact details, all driven by settings.

**Tasks**

1. `components/public/LocationSection.tsx` with a Google Maps iframe whose `src` is built from the `address` field, URL encoded:
   `https://www.google.com/maps?q={encoded address}&output=embed`
2. Below the map: address, hours, and phone as a `tel:` link for tap to call.
3. A "Get Directions" button linking to `https://www.google.com/maps/dir/?api=1&destination={encoded address}`.
4. A "Chat on WhatsApp" link for general enquiries with no order attached.
5. The whole section fades in on scroll. The iframe is lazy loaded.
6. Hide the section gracefully if the address is empty.

**Test**

* Changing the address in settings moves the map pin and updates the directions link
* Tap to call opens the dialer with the correct number
* Directions opens the Maps app on mobile
* The lazy loaded iframe does not slow the first paint

**Commit:** `Part 7: location section with settings driven map, directions and call link`

---

### PART 8 — Admin Authentication and Shell

**Goal:** A protected admin area with navigation. No editing yet.

**Tasks**

1. `app/admin/login/page.tsx`: email and password form using Supabase Auth. Clear error states. No sign up link.
2. `middleware.ts`: protect every route under `/admin` except `/admin/login`, redirecting unauthenticated visitors to the login page.
3. `app/admin/layout.tsx`: sidebar on desktop, bottom or drawer navigation on mobile. Links to Dashboard, Settings, Carousel, Categories, Menu. Sign out button.
4. `app/admin/page.tsx`: simple dashboard with counts of categories, items, active slides, and a link to view the live site.
5. Toast notifications set up globally for later use.

**Test**

* Visiting `/admin` while logged out redirects to login
* Correct credentials land on the dashboard, wrong credentials show a clear error
* Sign out clears the session and blocks `/admin` again
* Admin navigation is usable on a 375px screen
* The session survives a page refresh

**Commit:** `Part 8: admin authentication, route protection and admin shell`

**Security note:** only the anon key is used in the browser. The service role key must never appear in client code or in the repository.

---

### PART 9 — Admin: Categories and Menu Items

**Goal:** Full menu management with image upload.

**Tasks**

1. `components/admin/ImageUploader.tsx`: file picker with preview, client side resize and compression before upload, upload into the `media` bucket under the correct folder, returns the public URL. Show upload progress and a clear error state.
2. `app/admin/categories/page.tsx`: table listing categories with inline add, rename, active toggle and reordering via `sort_order` up and down controls.
3. `app/admin/menu/page.tsx`: table of items grouped or filterable by category, showing thumbnail, name, price, available and featured toggles, plus edit and delete actions.
4. `app/admin/menu/[id]/page.tsx` and a "new item" route using `components/admin/MenuItemForm.tsx`: category select, name, description, price, image upload, available switch, featured switch, tags input, sort order.
5. `app/admin/actions.ts`: Server Actions for every create, update and delete, each calling `revalidatePath('/')` so the public site reflects the change immediately.
6. Deleting an item should also delete its image from storage.
7. Confirmation dialog before any delete. Toast on every success and failure.

**Test**

* Creating a category then an item inside it shows both on the public site after refresh
* Uploading a photo stores it in the bucket and displays it on the public card
* Toggling available or featured updates the public site
* Deleting a category removes its items through the cascade, and the public page does not crash
* Reordering categories changes the public tab order
* All admin forms are usable on a phone
* An unauthenticated request cannot write, verified by the RLS policy

**Commit:** `Part 9: admin category and menu item management with image upload`

---

### PART 10 — Admin: Settings and Carousel

**Goal:** Branding, contact details and hero slides all editable.

**Tasks**

1. `app/admin/settings/page.tsx` with `SettingsForm.tsx`: cafe name, tagline, logo upload, display phone, WhatsApp number, address, hours, currency, Instagram, Facebook, WhatsApp greeting, announcement text and its toggle.
2. Validate the WhatsApp number format: digits only, country code included, no plus sign, no leading zero. Show a live preview of the resulting `wa.me` link and a helper note explaining the format.
3. Show a live preview of the order message so the owner sees exactly what customers will send.
4. `app/admin/carousel/page.tsx` with `SlideForm.tsx`: add a slide with image, title, subtitle, order and active toggle. List existing slides with thumbnails, reorder controls, edit and delete.
5. Every mutation is a Server Action that revalidates the home page.
6. Deleting a slide removes its image from storage. Replacing the logo deletes the old file.

**Test**

* Changing the cafe name updates the header, footer, page title and WhatsApp message
* Uploading a new logo replaces it everywhere
* Changing the WhatsApp number routes the next order to the new number
* Changing the address moves the map pin
* Adding a slide makes it appear in the hero carousel
* Turning the announcement on and off shows and hides the bar
* An invalid WhatsApp number is rejected with a clear message before saving

**Commit:** `Part 10: admin settings and carousel management`

---

### PART 11 — Animation and Visual Polish

**Goal:** Make it feel like this specific cafe and make the motion feel intentional rather than decorative.

**Tasks**

1. Define a warm palette as CSS variables in `globals.css`. Suggested direction based on the storefront banner and park setting: cream or off white background, deep forest green primary, warm terracotta or amber accent, charcoal text.
2. Choose a display typeface for headings and a clean readable face for body text.
3. Page level entrance: header, hero and first menu section animate in on load with a short stagger.
4. Scroll reveals on every major section using the `FadeIn` wrapper, triggering once rather than repeatedly.
5. Micro interactions: button press scale, add to cart pulse, cart badge count animation, smooth drawer easing.
6. Skeleton loaders for images and for the menu grid on first paint.
7. Global `prefers-reduced-motion` handling that reduces everything to simple opacity changes.
8. Favicon and page metadata pulled from settings: title, description and an Open Graph image so shared WhatsApp and Instagram links preview nicely.
9. A custom 404 page and an error boundary that fails gracefully if Supabase is unreachable.

**Test**

* Full walkthrough on a real mid range Android phone: hero, browse, add, cart, WhatsApp, map, call
* Animations stay smooth, no visible jank while scrolling
* Enable reduced motion in the operating system and confirm animation is toned down
* Lighthouse on mobile settings, aiming for performance above 90 and accessibility above 95
* Share the live link in a WhatsApp chat and confirm the preview renders correctly

**Commit:** `Part 11: branding, motion system, metadata and error states`

---

### PART 12 — Handover

**Goal:** The owner can run the site without you.

**Tasks**

1. Write `ADMIN_GUIDE.md` in plain language with screenshots: how to log in, add an item, change a price, upload a photo, change the WhatsApp number, add a carousel slide, turn the announcement on.
2. Set up the owner's admin account with a strong password and confirm they can log in on their own phone.
3. Generate a QR code pointing to the live URL for table tents and the counter.
4. Add the site URL to the Google Business listing under "Add website" and to the Instagram bio.

**Commit:** `Part 12: admin guide and handover documentation`

---

## 7. Sequence Summary

* Part 0: scaffold, Vercel connected. Deploy.
* Part 1: Supabase schema, storage, auth, data layer.
* Part 2: dynamic header, footer, announcement.
* Part 3: hero carousel.
* Part 4: menu cards and featured carousel.
* Part 5: cart.
* Part 6: WhatsApp ordering. **Deploy and test on a real phone.**
* Part 7: map and location.
* Part 8: admin login and shell.
* Part 9: admin categories and menu items.
* Part 10: admin settings and carousel.
* Part 11: animation and polish.
* Part 12: handover docs.

Parts 0 to 7 give a complete working public site. Parts 8 to 10 give the owner control. Parts 11 and 12 make it presentable and self serviceable.

---

## 8. Deployment Runbook

**One time**

1. Create the GitHub repository. Push the Part 0 commit yourself.
2. On vercel.com, New Project, import the repository. Framework preset Next.js, all build settings default. Deploy.
3. In Vercel Project Settings, Environment Variables, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Redeploy.

**Every deployment after that**

1. Review what Claude Code built.
2. Run `npm run build` locally to confirm it compiles.
3. Commit and push to `main` yourself.
4. Vercel builds and deploys automatically.

**Custom domain, when ready**

1. Buy the domain.
2. Vercel, Project Settings, Domains, add it.
3. Update nameservers or add the DNS records Vercel shows.
4. HTTPS is issued automatically.

---

## 9. Launch Checklist

* WhatsApp number confirmed with the owner and tested end to end from a customer phone
* Every item has a correct price and a real photo uploaded through the admin panel
* Item and category names spelled correctly, including local names
* Opening hours match reality
* Map pin verified against the physical location
* Logo uploaded and visible in the header, footer and social preview
* At least three carousel slides added
* Tested on Android Chrome, iPhone Safari and desktop
* Tested with network throttling enabled
* Owner has logged into the admin panel successfully on their own phone
* QR code printed for tables and counter
* Link added to the Google Business listing and the Instagram bio

---

## 10. Ideas for Later

* Daily specials driven by a date field on menu items
* Order form fields captured on site (name, table number) and injected into the WhatsApp message
* Instagram feed embed
* Discount codes appended to the order message
* Basic analytics on which items get added most
* WhatsApp Business API for automated confirmations, once order volume justifies the cost

---

## 11. Reminder

Claude Code builds and commits locally. **The developer pushes to GitHub.** Never let an automated tool push to the remote on this project.
