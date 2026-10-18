import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AnalyticsClient from "./client";

export const metadata = { title: "Analytics & Metrics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsDashboard() {
  await requireRole(["editor", "social_manager", "booking_manager"]);
  const sb = supabaseAdmin();

  // Fetch real database counts
  const { count: mixesCount } = await sb.from("mixes").select("*", { count: "exact", head: true });
  const { count: eventsCount } = await sb.from("events").select("*", { count: "exact", head: true });
  const { count: bookingsCount } = await sb.from("booking_inquiries").select("*", { count: "exact", head: true });
  const { count: socialAccountsCount } = await sb.from("social_accounts").select("*", { count: "exact", head: true }).eq("status", "connected");
  const { count: publishingJobsCount } = await sb.from("publishing_jobs").select("*", { count: "exact", head: true });
  const { count: publishingSucceededCount } = await sb.from("publishing_jobs").select("*", { count: "exact", head: true }).eq("status", "succeeded");

  const gaConnected = !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const data = {
    range: "30d",
    mixesCount: mixesCount || 0,
    eventsCount: eventsCount || 0,
    bookingsCount: bookingsCount || 0,
    socialAccountsCount: socialAccountsCount || 0,
    publishingJobsCount: publishingJobsCount || 0,
    publishingSucceededCount: publishingSucceededCount || 0,
    gaConnected,
    socialConnectedCount: socialAccountsCount || 0,
  };

  return <AnalyticsClient data={data} />;
}
