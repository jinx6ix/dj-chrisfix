import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { Share2, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Trash2, ShieldCheck } from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/lib/social/registry";
import { initiateOAuth, disconnectAccount } from "./actions";

export const metadata = { title: "Social Accounts & Integrations" };
export const dynamic = "force-dynamic";

export default async function SocialAccountsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireRole(["social_manager"]);
  const sp = await searchParams;
  const sb = supabaseAdmin();

  const { data: connectedAccounts } = await sb
    .from("social_accounts")
    .select("id, platform, account_name, external_account_id, status, token_expires_at, created_at");

  const connectedMap = new Map((connectedAccounts || []).map((acc) => [acc.platform, acc]));

  return (
    <div className="space-y-8">
      <div className="glass p-8 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Share2} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">Social Publisher & Streaming Hub</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Social Accounts & Integrations</h1>
        <p className="text-muted text-sm max-w-3xl">
          Connect official accounts for Instagram, Facebook, TikTok, YouTube, X (Twitter), SoundCloud, Mixcloud, and Spotify.
          Tokens are securely encrypted at rest in service-role-only storage with automatic queue publishing.
        </p>

        {sp.ok && <p role="status" className="glass p-3 text-sm text-emerald-300">Social account connected successfully.</p>}
        {sp.error && <p role="alert" className="text-red-300 text-sm">Social authentication or callback failed. Please check credentials.</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(SOCIAL_PLATFORMS).map((p) => {
          const linked = connectedMap.get(p.id);
          const isConnected = !!linked && linked.status === "connected";

          return (
            <GlassCard key={p.id} className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                    isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    linked?.status === 'expired' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-white/5 text-muted border border-white/10'
                  }`}>
                    {isConnected ? "Connected" : linked?.status || "Not Connected"}
                  </span>
                </div>
                <p className="text-xs text-[#ff9f43] uppercase tracking-wide font-medium">{p.category} {p.autoPublish ? "• Auto-Publish" : "• Embeds/API"}</p>
                <p className="text-xs text-muted leading-relaxed">{p.description}</p>

                {linked && (
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/10 text-xs space-y-1">
                    <div className="text-white font-medium truncate">Account: {linked.account_name || linked.external_account_id}</div>
                    {linked.token_expires_at && (
                      <div className="text-muted text-[11px]">Expires: {new Date(linked.token_expires_at).toLocaleDateString()}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <a href={p.docsUrl} target="_blank" rel="noreferrer" className="text-xs text-muted hover:text-white flex items-center gap-1">
                  API Docs <ExternalLink size={12} />
                </a>

                {isConnected ? (
                  <form action={async () => {
                    "use server";
                    await disconnectAccount(linked.id);
                  }}>
                    <button className="text-xs font-medium text-red-400 hover:underline flex items-center gap-1">
                      <Trash2 size={12} /> Disconnect
                    </button>
                  </form>
                ) : (
                  <form action={async () => {
                    "use server";
                    await initiateOAuth(p.id);
                  }}>
                    <button className="btn btn-ghost text-xs py-1.5 px-3">
                      Connect Account →
                    </button>
                  </form>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
