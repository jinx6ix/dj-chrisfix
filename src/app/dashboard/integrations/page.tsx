import { requireRole } from "@/lib/auth";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { Plug, CheckCircle2, AlertCircle, Mail, Database, Share2, ShieldCheck } from "lucide-react";

export const metadata = { title: "Integrations Marketplace" };
export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  await requireRole(["editor"]);

  const integrations = [
    {
      name: "Supabase Database & Auth",
      category: "Database & Backend",
      status: "connected",
      description: "PostgreSQL database, Row Level Security, and secure authentication.",
      icon: Database,
    },
    {
      name: "Resend Email API",
      category: "Transactional Email",
      status: process.env.RESEND_API_KEY ? "connected" : "disconnected",
      description: "Delivers booking confirmation and contact form notification emails.",
      icon: Mail,
    },
    {
      name: "SoundCloud & Mixcloud",
      category: "Audio Streaming",
      status: "disconnected",
      description: "Embeds tracks, fetches duration and waveform metadata.",
      icon: Share2,
    },
    {
      name: "Meta / Instagram / TikTok APIs",
      category: "Social Publisher",
      status: "disconnected",
      description: "Automated cross-platform publishing and media scheduling.",
      icon: Share2,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="glass p-8 space-y-2">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Plug} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Platform Extensions</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations Marketplace</h1>
        <p className="text-muted text-sm">
          Manage connected external services, database storage, email transport, and social publisher APIs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((item) => {
          const Icon = item.icon;
          const isConnected = item.status === "connected";
          return (
            <GlassCard key={item.name} className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GlassIcon icon={Icon} variant={isConnected ? "amber" : "violet"} size={20} />
                    <h3 className="text-lg font-bold">{item.name}</h3>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-muted border border-white/10'}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-muted uppercase tracking-wide">{item.category}</p>
                <p className="text-sm text-muted">{item.description}</p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-muted flex items-center gap-1.5">
                  {isConnected ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-amber-400" />}
                  {isConnected ? "Active & Configured" : "Requires API Keys"}
                </span>
                <span className="text-xs font-medium text-[#ff9f43] hover:underline cursor-pointer">Configure →</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
