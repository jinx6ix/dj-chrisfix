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

interface NavGroup {
  title: string;
  items: { href: string; label: string; icon: any; roles: Role[] }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard Home", icon: LayoutDashboard, roles: ["editor", "social_manager", "booking_manager"] },
    ],
  },
  {
    title: "Music & Content",
    items: [
      { href: "/dashboard/mixes", label: "Mixes", icon: Music, roles: ["editor"] },
      { href: "/dashboard/events", label: "Events", icon: Calendar, roles: ["editor"] },
      { href: "/dashboard/videos", label: "Videos", icon: Video, roles: ["editor"] },
      { href: "/dashboard/gallery", label: "Gallery", icon: ImageIcon, roles: ["editor"] },
      { href: "/dashboard/media", label: "Media Library", icon: FolderOpen, roles: ["editor"] },
    ],
  },
  {
    title: "Social & Studio",
    items: [
      { href: "/dashboard/social", label: "Social Accounts", icon: Share2, roles: ["social_manager"] },
      { href: "/dashboard/planner", label: "Content Planner", icon: CalendarClock, roles: ["social_manager"] },
      { href: "/dashboard/ai", label: "AI Studio", icon: Wand2, roles: ["social_manager", "editor"] },
    ],
  },
  {
    title: "Audience",
    items: [
      { href: "/dashboard/bookings", label: "Bookings", icon: Users, roles: ["booking_manager"] },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, roles: ["editor", "social_manager", "booking_manager"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/dashboard/settings", label: "Website Settings", icon: Settings, roles: ["editor"] },
      { href: "/dashboard/integrations", label: "Integrations", icon: Plug, roles: ["editor"] },
      { href: "/dashboard/team", label: "Team Settings", icon: ShieldAlert, roles: ["owner"] },
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
