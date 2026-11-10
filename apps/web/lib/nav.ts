import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  Database,
  FileText,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  ScrollText,
  Send,
  Settings,
  ShieldOff,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Navigation mirrors the grouping in ProjectOverview §8.1.
 */
export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/prospects", label: "Prospects", icon: Users },
      { href: "/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/drafts", label: "Drafts", icon: FileText },
      { href: "/approval", label: "Approval Queue", icon: ClipboardCheck },
      { href: "/sent", label: "Sent Emails", icon: Send },
      { href: "/inbox", label: "Replies / Inbox", icon: Inbox },
      { href: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/accounts", label: "Email Accounts", icon: Mail },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/suppression", label: "Suppression List", icon: ShieldOff },
      { href: "/activity", label: "Activity Log", icon: ScrollText },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/data", label: "Backups & Data", icon: Database },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavItem(pathname: string): NavItem | undefined {
  return navGroups
    .flatMap((group) => group.items)
    .find((item) => isActive(pathname, item.href));
}
