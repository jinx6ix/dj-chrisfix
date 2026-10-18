import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encryptToken } from "@/lib/encryption";
import { socialAdapters, SOCIAL_PLATFORMS } from "@/lib/social/registry";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateStr = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code || !stateStr) {
    return NextResponse.redirect(new URL("/dashboard/social?error=oauth_denied", url.origin));
  }

  try {
    const stateData = JSON.parse(Buffer.from(stateStr, "base64").toString("utf-8"));
    const platform = stateData.platform;
    const adapter = socialAdapters[platform];

    if (!adapter) {
      return NextResponse.redirect(new URL("/dashboard/social?error=invalid_platform", url.origin));
    }

    const host = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
    const redirectUri = `${host}/api/social/callback`;

    // Exchange authorization code for access tokens
    const tokenResult = await adapter.exchangeCode(code, redirectUri);

    const sb = supabaseAdmin();
    const expiresAt = new Date(Date.now() + tokenResult.expiresIn * 1000).toISOString();

    // Upsert social account
    const { data: acc, error: accError } = await sb
      .from("social_accounts")
      .upsert({
        platform,
        account_name: tokenResult.accountName,
        external_account_id: tokenResult.externalAccountId,
        status: "connected",
        scopes: SOCIAL_PLATFORMS[platform]?.scopes || [],
        token_expires_at: expiresAt,
      }, { onConflict: "platform,external_account_id" })
      .select("id")
      .single();

    if (accError || !acc) {
      throw new Error(accError?.message || "Failed to save social account");
    }

    // Encrypt and store tokens in service-role-only table (social_account_secrets)
    const accessTokenEnc = encryptToken(tokenResult.accessToken);
    const refreshTokenEnc = tokenResult.refreshToken ? encryptToken(tokenResult.refreshToken) : null;

    await sb
      .from("social_account_secrets")
      .upsert({
        account_id: acc.id,
        access_token_enc: accessTokenEnc,
        refresh_token_enc: refreshTokenEnc,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.redirect(new URL("/dashboard/social?ok=connected", url.origin));
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/dashboard/social?error=callback_failed", url.origin));
  }
}
