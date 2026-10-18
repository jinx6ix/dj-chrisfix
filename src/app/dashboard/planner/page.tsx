import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ContentPlannerClient from "./client";

export const metadata = { title: "Content Planner & Publishing Queue" };
export const dynamic = "force-dynamic";

export default async function ContentPlannerPage() {
  await requireRole(["social_manager"]);
  const sb = supabaseAdmin();

  const { data: jobs } = await sb
    .from("publishing_jobs")
    .select(`
      id,
      run_at,
      status,
      attempts,
      error_message,
      external_post_id,
      social_post_targets (
        id,
        scheduled_for,
        display_timezone,
        social_posts (
          id,
          caption
        ),
        social_accounts (
          platform,
          account_name
        )
      )
    `)
    .order("run_at", { ascending: true })
    .limit(100);

  const { data: accounts } = await sb
    .from("social_accounts")
    .select("id, platform, account_name")
    .eq("status", "connected");

  return <ContentPlannerClient jobs={jobs || []} accounts={accounts || []} />;
}
