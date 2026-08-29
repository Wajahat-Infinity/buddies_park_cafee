/** Row shapes for every table in supabase/schema.sql. */

export type SiteSettings = {
  id: number;
  cafe_name: string;
  tagline: string | null;
  logo_url: string | null;
  phone_display: string | null;
  phone_whatsapp: string | null;
  address: string | null;
  hours: string | null;
  currency: string;
  instagram_url: string | null;
  facebook_url: string | null;
  whatsapp_greeting: string | null;
  announcement_text: string | null;
  announcement_active: boolean;
  updated_at: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string | null;
};

export type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  tags: string[];
  sort_order: number;
  created_at: string | null;
};

export type CarouselSlide = {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string | null;
};

/** A category with its menu items nested, as the public menu renders it. */
export type CategoryWithItems = Category & { items: MenuItem[] };

/**
 * Used when settings are missing or unreachable, so the public site renders
 * something safe instead of crashing. Deliberately generic: the real values
 * live in the database and are edited from the admin panel.
 */
export const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  cafe_name: "Cafe",
  tagline: null,
  logo_url: null,
  phone_display: null,
  phone_whatsapp: null,
  address: null,
  hours: null,
  currency: "Rs",
  instagram_url: null,
  facebook_url: null,
  whatsapp_greeting: null,
  announcement_text: null,
  announcement_active: false,
  updated_at: null,
};
