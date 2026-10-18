import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  // Find due publishing jobs using FOR UPDATE SKIP LOCKED pattern via RPC or direct query if supported
  // In Supabase JS client, we query for queued jobs where run_at <= now
  const { data: jobs, error: fetchError } = await sb
    .from("publishing_jobs")
    .select("id, target_id, attempts, run_at, social_post_targets(post_id, account_id, caption_override, social_posts(caption))")
    .eq("status", "queued")
    .lte("run_at", now)
    .limit(10);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ processed: 0, message: "No due jobs" });
  }

  const results = [];

  for (const job of jobs) {
    // Claim job by updating status to 'running' and incrementing attempts
    const attempts = (job.attempts || 0) + 1;
    const { error: claimError } = await sb
      .from("publishing_jobs")
      .update({ status: "running", attempts, updated_at: now })
      .eq("id", job.id)
      .eq("status", "queued"); // concurrency guard

    if (claimError) continue;

    // Record attempt start
    const { data: attemptData } = await sb
      .from("publishing_attempts")
      .insert({ job_id: job.id, started_at: now })
      .select("id")
      .single();

    try {
      // Simulate publishing to social platform API based on target account
      // In P6, this calls real platform adapters. Here we verify idempotency and success simulation.
      const target = job.social_post_targets as any;
      const post = target?.social_posts;
      const caption = target?.caption_override || post?.caption || "";

      if (!caption) {
        throw new Error("Missing post caption or content");
      }

      // Simulate successful publish
      const externalPostId = `ext_${Math.random().toString(36).substring(2, 12)}`;

      await sb
        .from("publishing_jobs")
        .update({
          status: "succeeded",
          external_post_id: externalPostId,
          error_code: null,
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      if (attemptData) {
        await sb
          .from("publishing_attempts")
          .update({ finished_at: new Date().toISOString(), ok: true })
          .eq("id", attemptData.id);
      }

      results.push({ jobId: job.id, status: "succeeded", externalPostId });
    } catch (err: any) {
      const errorMessage = err.message || "Unknown publishing error";
      const isAuthOrValidation = errorMessage.includes("auth") || errorMessage.includes("validation") || errorMessage.includes("Missing");

      // Exponential backoff or fail permanently on auth/validation errors
      const newStatus = isAuthOrValidation || attempts >= 3 ? "failed" : "queued";
      const retryMinutes = Math.pow(2, attempts) * 5; // 10m, 20m, 40m...
      const nextRetryAt = newStatus === "queued" ? new Date(Date.now() + retryMinutes * 60000).toISOString() : null;

      await sb
        .from("publishing_jobs")
        .update({
          status: newStatus,
          next_retry_at: nextRetryAt,
          error_code: "PUBLISH_ERR",
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      if (attemptData) {
        await sb
          .from("publishing_attempts")
          .update({ finished_at: new Date().toISOString(), ok: false, error_code: "PUBLISH_ERR", error_message: errorMessage })
          .eq("id", attemptData.id);
      }

      results.push({ jobId: job.id, status: newStatus, error: errorMessage });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
