import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { User, Users, LogOut } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

const handleLogout = async () => {
  await authService.logout();
  window.location.href = "/";
};

type ProfileNavigationProps = {
  /** Direction the menu should expand: "up" or "down" */
  direction?: "up" | "down";
};

export default function ProfileNavigation({ direction = "down" }: ProfileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const panelPosition =
  direction === "up"
    // anchor at top-right of the button, translate the panel above it
    ? "top-0 -translate-y-full -mt-2 origin-bottom-right"
    // anchor at top-right and translate the panel below it
    : "top-full mt-2 origin-top-right";

  return (
    <div className="relative flex" ref={menuRef}>
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center rounded-full hover:bg-gray-200 hover:bg-opacity-50 p-1 transition-colors"
        variant="ghost"
        size="icon"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open profile menu"
      >
        {profile?.profile_image_url ? (
          <img
            src={profile.profile_image_url}
            alt="User avatar"
            className="w-8 h-8 rounded-full border-gray-500"
          />
        ) : (
          <User className="w-8 h-8 text-gray-500 p-1" />
        )}
      </Button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute right-0 ${panelPosition} w-56 bg-white rounded-md shadow-lg z-50 border flex flex-col py-2`}
        >
          <div className="px-4 py-3 border-b border-gray-200 pt-2">
            <p className="text-sm font-semibold text-gray-800">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <User className="w-4 h-4 text-gray-500" />
            <span>Profile</span>
          </Link>

          <Link
            href="/circle"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Users className="w-4 h-4 text-gray-500" />
            <span>Circle</span>
          </Link>

          <Button
            onClick={async () => {
              setIsOpen(false);
              await handleLogout();
            }}
            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            variant="ghost"
            role="menuitem"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </div>
  );
}
