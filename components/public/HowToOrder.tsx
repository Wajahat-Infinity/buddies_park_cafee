import { MessageCircle, ShoppingBag, UtensilsCrossed } from "lucide-react";

import { SectionHeading } from "@/components/public/SectionHeading";
import { clean } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

const STEPS = [
  {
    Icon: UtensilsCrossed,
    title: "Pick your food",
    text: "Add items and deals from the menu. No account, no app.",
  },
  {
    Icon: MessageCircle,
    title: "Send it on WhatsApp",
    text: "Your order opens in WhatsApp, already written out. Just press send.",
  },
  {
    Icon: ShoppingBag,
    title: "Pick up or get it delivered",
    text: "We confirm on WhatsApp and start cooking.",
  },
] as const;

/**
 * Answers a new customer's first question: how does ordering here work?
 * Only shown when orders actually go to WhatsApp.
 */
export function HowToOrder({ settings }: { settings: SiteSettings }) {
  if (!clean(settings.phone_whatsapp)) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading eyebrow="Order in a minute">How ordering works</SectionHeading>

      <ol className="mt-9 grid gap-4 md:grid-cols-3">
        {STEPS.map(({ Icon, title, text }, index) => (
          <li
            key={title}
            className="shadow-card text-park flex gap-4 rounded-2xl bg-white p-5"
          >
            <span className="bg-park text-lime font-poster grid size-12 shrink-0 place-items-center rounded-2xl text-3xl font-black">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 font-bold">
                <Icon className="text-park/50 size-4 shrink-0" />
                {title}
              </h3>
              <p className="text-park/65 mt-1 text-sm text-pretty">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
