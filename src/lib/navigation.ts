import {
  Home,
  Calendar,
  MessageSquare,
  FileText,
  Bot,
  Landmark,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavItem {
  name: string;
  href: string;
  icon: IconType;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Messages", href: "/messages", icon: MessageSquare },
//   { name: "Documents", href: "/documents", icon: FileText },
//   { name: "Expenses", href: "/expenses", icon: Landmark },
//   { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
//   { name: "Skills", href: "/skills", icon: Target },
//   { name: "Profile", href: "/profile", icon: User },
];

// helper used by both header + mobile nav
export const isActivePath = (current: string, href: string) =>
  href === "/" ? current === "/" : current.startsWith(href);
