"use server";

import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encryptToken } from "@/lib/encryption";
import { socialAdapters, SOCIAL_PLATFORMS } from "@/lib/social/registry";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function initiateOAuth(platform: string) {
  await requireRole(["social_manager"]);
  const adapter = socialAdapters[platform];
  if (!adapter) {
    throw new Error(`Unsupported social platform: ${platform}`);
  }

  const host = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUri = `${host}/api/social/callback`;
  const state = Buffer.from(JSON.stringify({ platform, nonce: Math.random().toString() })).toString("base64");

  const authUrl = adapter.getAuthUrl(state, redirectUri);
  redirect(authUrl);
}

export async function disconnectAccount(accountId: string) {
  const { user } = await requireRole(["social_manager"]);
  const sb = supabaseAdmin();

  // Delete secrets (cascade will remove account or we delete both)
  await sb.from("social_account_secrets").delete().eq("account_id", accountId);
  await sb.from("social_accounts").delete().eq("id", accountId);

  await sb.from("audit_logs").insert({
    actor: user.id,
    action: "social_account.disconnect",
    entity: "social_accounts",
    entity_id: accountId,
  });

  revalidatePath("/dashboard/social");
}
