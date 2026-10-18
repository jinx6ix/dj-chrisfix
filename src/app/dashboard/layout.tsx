import Link from "next/link";
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
    <div className="flex flex-col gap-6 md:flex-row min-h-[85vh]">
      <aside className="glass p-4 md:w-72 space-y-6 md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:overflow-y-auto flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="px-3 pt-2">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff9f43] inline-block animate-pulse" />
              DJ ChrisFix Portal
            </h1>
            <p className="text-xs text-muted mt-0.5 capitalize font-mono">Role: {role}</p>
          </div>

          <div className="space-y-5">
            {NAV_GROUPS.map((group) => {
              const accessibleItems = group.items.filter((n) => role === "owner" || n.roles.includes(role));
              if (accessibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1">
                  <h2 className="text-[11px] font-semibold tracking-wider uppercase text-muted/80 px-3 mb-1.5">{group.title}</h2>
                  <nav aria-label={group.title} className="space-y-1">
                    {accessibleItems.map((n) => {
                      const Icon = n.icon;
                      return (
                        <Link
                          key={n.href}
                          href={n.href}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-colors group"
                        >
                          <Icon size={18} className="text-[#ff9f43] shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="truncate">{n.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 mt-auto">
          <form action={signOut}>
            <button className="btn btn-ghost w-full justify-center text-sm">Sign out</button>
          </form>
        </div>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
