# Buddies Park Cafe — website

A mobile first cafe site with a WhatsApp based ordering flow, and an admin
panel that controls everything the customer sees. No content is hardcoded: the
cafe name, logo, phone numbers, address, hours, carousel, categories, items and
prices all come from the database.

For the cafe owner, see **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)**.
For the full build plan, see **BUDDIES_PARK_CAFE_PLAN_V2.md**.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router, TypeScript, Server Components) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (radix base) |
| Animation | Framer Motion |
| Carousel | Embla, via the shadcn carousel, with the autoplay plugin |
| Database, auth, file storage | Supabase |
| Hosting | Vercel |

---

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in both values
npm run dev
```

The two variables come from Supabase, under Project Settings → API:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon / publishable key |

Never put the `service_role` / secret key in a `NEXT_PUBLIC_` variable. Those
are compiled into the browser bundle and would bypass every security policy.

---

## Setting up a fresh Supabase project

1. Storage → new **public** bucket named `media`.
2. SQL Editor → run [`supabase/schema.sql`](supabase/schema.sql) (tables, row
   level security, storage policies). The bucket must exist first.
3. SQL Editor → run [`supabase/seed.sql`](supabase/seed.sql) (settings row,
   categories, placeholder items).
4. Authentication → Users → add the admin user. Then turn public sign ups off.

---

## Layout

```
app/
  (public)/          home, menu, and the shared public shell
  admin/
    login/           sign in, outside the admin shell
    (dashboard)/     every protected admin screen
    actions.ts       Server Actions for all writes
components/
  public/            customer facing sections
  admin/             admin screens and the image uploader
  motion/            reusable Framer Motion wrappers
  ui/                shadcn components
context/CartContext  in memory cart
lib/
  supabase/          browser, server and middleware clients
  queries.ts         public reads, each degrading safely
  whatsapp.ts        order message and wa.me link
supabase/            schema, seed and migrations
middleware.ts        protects /admin
```

---

## How security works

- **Row level security** on every table: anyone can read, only signed in users
  can write. Verified by probing with the anon key — reads succeed, writes are
  rejected or affect zero rows.
- **Storage policies** match: public read, authenticated write and delete.
- **`middleware.ts`** guards every `/admin` route and revalidates the token
  with Supabase on each request, rather than trusting the cookie.
- **Server Actions** re-check the session before writing, so an expired session
  gives a clear message instead of a policy error.

---

## Things worth knowing

- **The cart is in memory.** A refresh clears it. This is deliberate; there are
  no accounts and no saved orders.
- **Public pages are dynamic.** They read the database per request, so an admin
  change appears on the next refresh with no rebuild.
- **Prices carry a snapshot.** A cart line stores the name and price from when
  it was added, so an admin edit cannot alter an order already in progress.
- **Images are resized in the browser** before upload, so phone photos do not
  bloat storage.
- **Deleting cleans up storage.** Removing an item, a slide, or replacing a
  logo deletes the old file from the bucket.

---

## Deploying

Pushing to `main` triggers a Vercel deploy. Before pushing:

```bash
npm run lint
npm run build
```

Both environment variables must exist in Vercel under Project Settings →
Environment Variables, for Production, Preview **and** Development. They are
read at build time as well as at runtime.
