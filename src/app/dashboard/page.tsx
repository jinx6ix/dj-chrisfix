import { requireRole } from "@/lib/auth";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { LayoutDashboard, Music, Calendar, Users, Share2, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard Overview" };
export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const { sb, role } = await requireRole(["editor", "social_manager", "booking_manager"]);
  const head = { count: "exact" as const, head: true };

  const [
    mixesRes,
    eventsRes,
    inquiriesRes,
    postsRes,
    failedJobsRes,
    recentInquiriesRes,
    upcomingEventsRes
  ] = await Promise.all([
    sb.from("mixes").select("*", head).eq("status", "published"),
    sb.from("events").select("*", head).eq("status", "published").gte("starts_at", new Date().toISOString()),
    sb.from("booking_inquiries").select("*", head).eq("status", "new"),
    sb.from("social_posts").select("*", head).eq("status", "scheduled"),
    sb.from("publishing_jobs").select("*", head).eq("status", "failed"),
    sb.from("booking_inquiries").select("id, name, event_type, event_date, status, created_at").order("created_at", { ascending: false }).limit(5),
    sb.from("events").select("id, title, starts_at, venue_name, city, status").gte("starts_at", new Date().toISOString()).order("starts_at", { ascending: true }).limit(5),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass p-8 space-y-2">
        <div className="flex items-center gap-3">
          <GlassIcon icon={LayoutDashboard} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Management Portal</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted text-sm">
          Real-time platform metrics, upcoming schedule, and priority actions. Role: <span className="text-white font-medium capitalize">{role}</span>
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">Published Mixes</span>
            <Music size={20} className="text-[#ff9f43]" />
          </div>
          <p className="text-3xl font-bold tabular-nums">{mixesRes.count ?? 0}</p>
          <Link href="/dashboard/mixes" className="text-xs text-[#ff9f43] hover:underline inline-block">Manage mixes →</Link>
        </GlassCard>

        <GlassCard className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">Upcoming Shows</span>
            <Calendar size={20} className="text-violet-400" />
          </div>
          <p className="text-3xl font-bold tabular-nums">{eventsRes.count ?? 0}</p>
          <Link href="/dashboard/events" className="text-xs text-violet-400 hover:underline inline-block">Manage events →</Link>
        </GlassCard>

        <GlassCard className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">New Inquiries</span>
            <Users size={20} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold tabular-nums">{inquiriesRes.count ?? 0}</p>
          <Link href="/dashboard/bookings" className="text-xs text-emerald-400 hover:underline inline-block">Review bookings →</Link>
        </GlassCard>

        <GlassCard className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">Scheduled Posts</span>
            <Share2 size={20} className="text-cyan-400" />
          </div>
          <p className="text-3xl font-bold tabular-nums">{postsRes.count ?? 0}</p>
          <Link href="/dashboard/planner" className="text-xs text-cyan-400 hover:underline inline-block">Content planner →</Link>
        </GlassCard>
      </div>

      {/* Warnings & Alerts */}
      {(failedJobsRes.count ?? 0) > 0 && (
        <GlassCard className="p-6 bg-red-500/10 border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={24} />
            <div>
              <p className="font-semibold text-red-200">Publishing Job Failures Detected</p>
              <p className="text-xs text-muted">{failedJobsRes.count} social publishing job(s) failed and require review.</p>
            </div>
          </div>
          <Link href="/dashboard/planner" className="btn bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs py-2 px-4">View Queue</Link>
        </GlassCard>
      )}

      {/* Quick Lists */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Booking Inquiries</h3>
            <Link href="/dashboard/bookings" className="text-xs text-[#ff9f43] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentInquiriesRes.data?.map((inq) => (
              <div key={inq.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="font-medium text-sm">{inq.name} · <span className="text-muted">{inq.event_type}</span></p>
                  <p className="text-xs text-muted">Date: {inq.event_date}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold ${inq.status === 'new' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-muted'}`}>
                  {inq.status}
                </span>
              </div>
            ))}
            {!recentInquiriesRes.data?.length && (
              <p className="text-sm text-muted py-6 text-center">No recent booking inquiries.</p>
            )}
          </div>
        </GlassCard>

        {/* Upcoming Events */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Upcoming Tour Dates</h3>
            <Link href="/dashboard/events" className="text-xs text-[#ff9f43] hover:underline">Manage events</Link>
          </div>
          <div className="space-y-3">
            {upcomingEventsRes.data?.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="font-medium text-sm">{ev.title}</p>
                  <p className="text-xs text-muted">{ev.venue_name}, {ev.city} · {new Date(ev.starts_at).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {ev.status}
                </span>
              </div>
            ))}
            {!upcomingEventsRes.data?.length && (
              <p className="text-sm text-muted py-6 text-center">No upcoming events scheduled.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
