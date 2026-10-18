import { requireRole, type Role } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import {
  LayoutDashboard,
  Music,
  Calendar,
  Video,
  Image as ImageIcon,
  FolderOpen,
  Share2,
  CalendarClock,
  Wand2,
  Users,
  BarChart3,
  Settings,
  Plug,
  ShieldAlert
} from "lucide-react";
import { DashboardSidebarClient } from "@/components/dashboard-sidebar-client";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export interface NavItemConfig {
  href: string;
  label: string;
  iconName: string;
  roles: Role[];
}

export interface NavGroupConfig {
  title: string;
  items: NavItemConfig[];
}

const NAV_GROUPS: NavGroupConfig[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard Home", iconName: "LayoutDashboard", roles: ["editor", "social_manager", "booking_manager"] },
    ],
  },
  {
    title: "Music & Content",
    items: [
      { href: "/dashboard/mixes", label: "Mixes", iconName: "Music", roles: ["editor"] },
      { href: "/dashboard/events", label: "Events", iconName: "Calendar", roles: ["editor"] },
      { href: "/dashboard/videos", label: "Videos", iconName: "Video", roles: ["editor"] },
      { href: "/dashboard/gallery", label: "Gallery", iconName: "ImageIcon", roles: ["editor"] },
      { href: "/dashboard/media", label: "Media Library", iconName: "FolderOpen", roles: ["editor"] },
    ],
  },
  {
    title: "Social & Studio",
    items: [
      { href: "/dashboard/social", label: "Social Accounts", iconName: "Share2", roles: ["social_manager"] },
      { href: "/dashboard/planner", label: "Content Planner", iconName: "CalendarClock", roles: ["social_manager"] },
      { href: "/dashboard/ai", label: "AI Studio", iconName: "Wand2", roles: ["social_manager", "editor"] },
    ],
  },
  {
    title: "Audience",
    items: [
      { href: "/dashboard/bookings", label: "Bookings", iconName: "Users", roles: ["booking_manager"] },
      { href: "/dashboard/analytics", label: "Analytics", iconName: "BarChart3", roles: ["editor", "social_manager", "booking_manager"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/dashboard/settings", label: "Website Settings", iconName: "Settings", roles: ["editor"] },
      { href: "/dashboard/integrations", label: "Integrations", iconName: "Plug", roles: ["editor"] },
      { href: "/dashboard/team", label: "Team Settings", iconName: "ShieldAlert", roles: ["owner"] },
    ],
  },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireRole(["editor", "social_manager", "booking_manager"]);

  return (
    <DashboardSidebarClient role={role} navGroups={NAV_GROUPS} signOutAction={signOut}>
      {children}
    </DashboardSidebarClient>
  );
}
