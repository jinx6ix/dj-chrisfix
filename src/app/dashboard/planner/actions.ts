"use server";

import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { socialAdapters } from "@/lib/social/registry";
import { decryptToken } from "@/lib/encryption";

const postSchema = z.object({
  caption: z.string().min(1, "Caption is required").max(2200),
  account_ids: z.array(z.string().uuid()).min(1, "Select at least one social account"),
  scheduled_for: z.string().min(1, "Schedule time is required"),
  display_timezone: z.string().default("Africa/Nairobi"),
});

export async function createAndSchedulePost(formData: FormData) {
  const { user } = await requireRole(["social_manager"]);
  const sb = supabaseAdmin();

  const caption = formData.get("caption") as string;
  const scheduledFor = formData.get("scheduled_for") as string;
  const timezone = (formData.get("display_timezone") as string) || "Africa/Nairobi";
  const accountIdsRaw = formData.getAll("account_ids") as string[];

  const parsed = postSchema.parse({
    caption,
    account_ids: accountIdsRaw,
    scheduled_for: scheduledFor,
    display_timezone: timezone,
  });

  // 1. Create social post
  const { data: post, error: postErr } = await sb
    .from("social_posts")
    .insert({
      caption: parsed.caption,
      status: "scheduled",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (postErr || !post) {
    throw new Error(postErr?.message || "Failed to create social post");
  }

  // 2. Create targets and publishing jobs for each selected account
  for (const accountId of parsed.account_ids) {
    const { data: target, error: targetErr } = await sb
      .from("social_post_targets")
      .insert({
        post_id: post.id,
        account_id: accountId,
        scheduled_for: parsed.scheduled_for,
        display_timezone: parsed.display_timezone,
      })
      .select("id")
      .single();

    if (targetErr || !target) continue;

    await sb.from("publishing_jobs").insert({
      target_id: target.id,
      run_at: parsed.scheduled_for,
      status: "queued",
    });
  }

  await sb.from("audit_logs").insert({
    actor: user.id,
    action: "social_post.schedule",
    entity: "social_posts",
    entity_id: post.id,
  });

  revalidatePath("/dashboard/planner");
  redirect("/dashboard/planner?ok=1");
}

export async function cancelPublishingJob(jobId: string) {
  const { user } = await requireRole(["social_manager"]);
  const sb = supabaseAdmin();

  await sb.from("publishing_jobs").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", jobId).eq("status", "queued");

  await sb.from("audit_logs").insert({
    actor: user.id,
    action: "publishing_job.cancel",
    entity: "publishing_jobs",
    entity_id: jobId,
  });

  revalidatePath("/dashboard/planner");
}

export async function rescheduleJob(jobId: string, newRunAt: string) {
  const { user } = await requireRole(["social_manager"]);
  const sb = supabaseAdmin();

  await sb.from("publishing_jobs").update({ run_at: newRunAt, status: "queued", attempts: 0, error_message: null, updated_at: new Date().toISOString() }).eq("id", jobId);

  await sb.from("audit_logs").insert({
    actor: user.id,
    action: "publishing_job.reschedule",
    entity: "publishing_jobs",
    entity_id: jobId,
    meta: { new_run_at: newRunAt },
  });

  revalidatePath("/dashboard/planner");
}
