"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
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
import { type Role } from "@/lib/auth";
import { type NavGroupConfig } from "@/app/dashboard/layout";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Music,
  Calendar,
  Video,
  ImageIcon,
  FolderOpen,
  Share2,
  CalendarClock,
  Wand2,
  Users,
  BarChart3,
  Settings,
  Plug,
  ShieldAlert,
};

interface DashboardSidebarClientProps {
  role: Role;
  navGroups: NavGroupConfig[];
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}

export function DashboardSidebarClient({
  role,
  navGroups,
  signOutAction,
  children,
}: DashboardSidebarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape key, outside click, and handle body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("#dashboard-menu-button")
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const renderNavContent = () => (
    <div className="space-y-6 flex flex-col justify-between h-full">
      <div className="space-y-6">
        <div className="px-3 pt-2 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff9f43] inline-block animate-pulse" />
              DJ ChrisFix Portal
            </h1>
            <p className="text-xs text-muted mt-0.5 capitalize font-mono">Role: {role}</p>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="md:hidden p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-[#ff9f43]" />
          </button>
        </div>

        <div className="space-y-5">
          {navGroups.map((group) => {
            const accessibleItems = group.items.filter(
              (n) => role === "owner" || n.roles.includes(role)
            );
            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <h2 className="text-[11px] font-semibold tracking-wider uppercase text-muted/80 px-3 mb-1.5">
                  {group.title}
                </h2>
                <nav aria-label={group.title} className="space-y-1">
                  {accessibleItems.map((n) => {
                    const Icon = ICON_MAP[n.iconName] || LayoutDashboard;
                    const isActive = pathname === n.href;
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setIsOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors group ${
                          isActive
                            ? "bg-white/10 text-white font-semibold border border-white/15"
                            : "text-muted hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={`shrink-0 transition-transform ${
                            isActive ? "text-[#ff9f43]" : "text-[#ff9f43] group-hover:scale-110"
                          }`}
                        />
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
        <form action={signOutAction}>
          <button className="btn btn-ghost w-full justify-center text-sm">Sign out</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 md:flex-row min-h-[85vh]">
      {/* Mobile Header Bar with Menu Toggle */}
      <div className="md:hidden glass p-4 flex items-center justify-between sticky top-4 z-40 bg-[#121218]/95 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff9f43] animate-pulse" />
          <span className="text-sm font-bold tracking-tight text-white">Dashboard Portal</span>
        </div>
        <button
          id="dashboard-menu-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-sidebar-drawer"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#ff9f43]"
        >
          <Menu className="w-6 h-6 text-[#ff9f43]" />
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <aside
        id="mobile-sidebar-drawer"
        aria-label="Mobile Navigation Drawer"
        className={`fixed inset-y-0 left-0 z-50 w-72 glass p-4 flex flex-col justify-between overflow-y-auto bg-[#121218] border-r border-white/15 transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* Desktop Permanent Sidebar */}
      <aside
        ref={sidebarRef}
        className="hidden md:flex glass p-4 md:w-72 space-y-6 md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:overflow-y-auto flex-col justify-between shrink-0"
      >
        {renderNavContent()}
      </aside>

      {/* Main Content */}
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
