// MobileNav.tsx (simplified)
import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { NAV_ITEMS } from "@/lib/navigation";

export default function MobileNav() {
  const [location] = useLocation();
  const navRef = useRef<HTMLElement | null>(null);

  // OPTIONAL: hide nav when typing to gain room
  useEffect(() => {
    const isTextField = (el: Element | null) =>
      !!el &&
      (el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el as HTMLElement).isContentEditable);

    const onFocusIn = (e: Event) => {
      if (isTextField(e.target as Element)) {
        if (navRef.current) {
          navRef.current.hidden = true;
          (navRef.current as any).inert = true;
          navRef.current.setAttribute("aria-hidden", "true");
        }
      }
    };
    const onFocusOut = () => {
      setTimeout(() => {
        if (!isTextField(document.activeElement)) {
          if (navRef.current) {
            navRef.current.hidden = false;
            (navRef.current as any).inert = false;
            navRef.current.removeAttribute("aria-hidden");
          }
        }
      }, 0);
    };

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);
    return () => {
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
    };
  }, []);

  return (
 <nav       ref={navRef} className="bg-white border-t border-gray-200 lg:hidden">
    <div className="flex items-center gap-2 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? location === "/" : location.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex w-full justify-center flex-col items-center p-2 text-xs h-14 rounded-xl transition active:scale-95 ${
              isActive
                ? "text-[#275559] bg-[#275559]/15 shadow-sm font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex flex-col gap-1">
              <Icon className="w-full h-5" />
              <span className="hidden sm:flex text-xs font-medium">
                {item.name}
              </span>
            </div>
          </Link>
        );})}

      </div>
    </nav>
  );
}
