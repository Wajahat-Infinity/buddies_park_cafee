"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Images,
  LayoutDashboard,
  ListTree,
  LogOut,
  Settings,
  SquareMenu,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu", icon: SquareMenu },
  { href: "/admin/categories", label: "Categories", icon: ListTree },
  { href: "/admin/carousel", label: "Carousel", icon: Images },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav({ email }: { email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="bg-card hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="p-4">
          <p className="text-sm font-semibold">Admin</p>
          {email ? (
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              {email}
            </p>
          ) : null}
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive(pathname, href)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              View live site
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={signOut}
            disabled={signingOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="bg-card fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 border-b px-3 md:hidden">
        <p className="text-sm font-semibold">Admin</p>
        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="View live site">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={signOut}
            disabled={signingOut}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="bg-card fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t md:hidden">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[11px] transition-colors",
              isActive(pathname, href)
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
