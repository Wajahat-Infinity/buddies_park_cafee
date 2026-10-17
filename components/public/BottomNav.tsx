"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ShoppingBag, Tag, UtensilsCrossed } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const TABS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/menu", label: "Menu", Icon: UtensilsCrossed },
  { href: "/deals", label: "Deals", Icon: Tag },
] as const;

/**
 * Phone navigation, at the bottom where a thumb reaches it. The last tab is
 * the order itself; it is also where a thrown item lands when the order bar
 * is not showing yet (see FlyToCart).
 */
export function BottomNav() {
  const pathname = usePathname();
  const { itemCount, setCartOpen } = useCart();

  const tab =
    "flex flex-col items-center gap-1 pt-2.5 pb-2 text-[0.7rem] font-semibold transition-colors";

  return (
    <nav
      aria-label="Main"
      className="bg-park fixed inset-x-0 bottom-0 z-40 border-t border-white/10 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ href, label, Icon }) => {
          const current = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? "page" : undefined}
              className={cn(tab, current ? "text-lime" : "text-white/60")}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}

        <button
          id="cart-tab"
          type="button"
          onClick={() => setCartOpen(true)}
          className={cn(tab, "relative text-white/60")}
        >
          <span className="relative">
            <ShoppingBag className="size-5" />
            {itemCount > 0 ? (
              <span className="bg-lime text-park absolute -top-1.5 -right-2.5 min-w-4.5 rounded-full px-1 py-0.5 text-center text-[0.6rem] leading-none font-extrabold tabular-nums">
                {itemCount}
              </span>
            ) : null}
          </span>
          Order
        </button>
      </div>
    </nav>
  );
}
