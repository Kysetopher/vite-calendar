import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { isActivePath } from "@/lib/navigation";
import liaizenLogo from "@assets/liaizen-logo.svg";
import ProfileNavigation from "@/components/ProfileNavigation"; 
import { NAV_ITEMS } from "@/lib/navigation";

export default function Header() {
  const [location] = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="hidden sm:block sticky bg-white shadow-sm border-b border-gray-200  top-0 z-50 select-none">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* left */}
          <div className="w-80 flex justify-start">
            <a
              href="https://liaizen.com/"
              target="_blank"
              rel="noreferrer"
              className="flex w-fit px-4"
            >
              <div className="flex w-fit gap-3 items-center">
                <img src={liaizenLogo} alt="LiaiZen Logo" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-serif font-semibold text-gray-900 block lg:hidden xl:block">
                  LiaiZen
                </span>
              </div>
            </a>
          </div>

          {/* center (desktop nav) */}
          <nav className="w-full max-w-7xl mx-auto justify-center hidden lg:flex 2xl:justify-between">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location, item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`flex items-center p-2 text-sm font-medium transition-colors cursor-pointer px-4 ${
                      active
                        ? "text-[#275559] border-b-2 border-[#275559]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <div className="whitespace-nowrap">{item.name}</div>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* right (profile) */}
          <div className="w-80 justify-end flex items-center space-x-4">
            <ProfileNavigation/>
          </div>
        </div>
      </div>
    </header>
  );
}
