import { clean } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/**
 * Thin bar above everything else. Renders nothing at all unless the owner has
 * both written an announcement and switched it on.
 */
export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const text = clean(settings.announcement_text);

  if (!settings.announcement_active || !text) return null;

  return (
    <div className="bg-park-2 text-white">
      <p className="mx-auto max-w-6xl px-4 py-2 text-center text-xs font-semibold sm:text-sm">
        {text}
      </p>
    </div>
  );
}
