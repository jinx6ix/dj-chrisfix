"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { CalendarClock, Plus, CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw, Calendar, List, Filter } from "lucide-react";
import { cancelPublishingJob, rescheduleJob, createAndSchedulePost } from "./actions";

interface JobItem {
  id: string;
  run_at: string;
  status: string;
  attempts: number;
  error_message?: string;
  external_post_id?: string;
  social_post_targets: any;
}

interface SocialAccountOption {
  id: string;
  platform: string;
  account_name: string;
}

export default function ContentPlannerClient({ jobs, accounts }: { jobs: JobItem[]; accounts: SocialAccountOption[] }) {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = jobs.filter((j) => {
    const target = Array.isArray(j.social_post_targets) ? j.social_post_targets[0] : j.social_post_targets;
    const platform = target?.social_accounts?.platform;
    if (filterPlatform !== "all" && platform !== filterPlatform) return false;
    if (filterStatus !== "all" && j.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="glass p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <GlassIcon icon={CalendarClock} variant="amber" size={24} />
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">Visual Content Calendar</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Content Planner & Publishing Queue</h1>
            <p className="text-muted text-sm">
              Manage automated multi-platform posts, view scheduled queues, handle retries, and reschedule content.
            </p>
          </div>

          <button onClick={() => setShowNewModal(true)} className="btn btn-primary flex items-center gap-2 text-xs py-2 px-4">
            <Plus size={16} /> Schedule New Post
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition ${viewMode === 'list' ? 'bg-[#ff9f43] text-black' : 'glass text-muted hover:text-white'}`}
            >
              <List size={14} className="inline mr-1" /> List View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition ${viewMode === 'calendar' ? 'bg-[#ff9f43] text-black' : 'glass text-muted hover:text-white'}`}
            >
              <Calendar size={14} className="inline mr-1" /> Calendar View
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted">Platform:</span>
              <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="field text-xs py-1">
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="x">X (Twitter)</option>
                <option value="soundcloud">SoundCloud</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted">Status:</span>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="field text-xs py-1">
                <option value="all">All Statuses</option>
                <option value="queued">Queued</option>
                <option value="running">Running</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {showNewModal && (
        <GlassCard className="p-6 space-y-4 border border-[#ff9f43]/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Schedule New Multi-Platform Post</h3>
            <button onClick={() => setShowNewModal(false)} className="text-muted hover:text-white text-xs">✕ Close</button>
          </div>

          <form action={createAndSchedulePost} className="space-y-4">
            <div>
              <label className="text-xs mb-1 block text-muted">Post Caption / Content</label>
              <textarea name="caption" rows={3} required placeholder="Write caption with hashtags and links..." className="field text-xs" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs mb-1 block text-muted">Scheduled UTC Time</label>
                <input type="datetime-local" name="scheduled_for" required className="field text-xs" />
              </div>
              <div>
                <label className="text-xs mb-1 block text-muted">Timezone</label>
                <input type="text" name="display_timezone" defaultValue="Africa/Nairobi" className="field text-xs" />
              </div>
            </div>

            <div>
              <label className="text-xs mb-2 block text-muted font-medium">Select Target Social Accounts</label>
              <div className="grid gap-2 sm:grid-cols-3 max-h-40 overflow-y-auto p-2 bg-black/30 rounded-lg border border-white/10">
                {accounts.map((acc) => (
                  <label key={acc.id} className="flex items-center gap-2 text-xs text-white cursor-pointer p-1.5 hover:bg-white/5 rounded">
                    <input type="checkbox" name="account_ids" value={acc.id} className="rounded border-white/20 text-[#ff9f43]" />
                    <span className="uppercase font-semibold text-[#ff9f43]">{acc.platform}</span>
                    <span className="text-muted truncate">({acc.account_name})</span>
                  </label>
                ))}
                {!accounts.length && (
                  <p className="text-xs text-muted col-span-3 p-2">No accounts connected. Connect accounts in Social Accounts first.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-ghost text-xs">Cancel</button>
              <button type="submit" className="btn btn-primary text-xs">Save to Publishing Queue</button>
            </div>
          </form>
        </GlassCard>
      )}

      {viewMode === "list" ? (
        <div className="space-y-3">
          {filtered.map((j) => {
            const target = Array.isArray(j.social_post_targets) ? j.social_post_targets[0] : j.social_post_targets;
            const post = target?.social_posts;
            const acc = target?.social_accounts;

            return (
              <GlassCard key={j.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {acc?.platform || "Platform"}
                    </span>
                    <span className="text-xs text-muted font-medium">Account: {acc?.account_name || "—"}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                      j.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      j.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      j.status === 'running' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                      j.status === 'cancelled' ? 'bg-white/5 text-muted line-through' :
                      'bg-white/5 text-amber-300 border border-amber-500/20'
                    }`}>
                      {j.status} {j.attempts > 0 && `(Attempt ${j.attempts})`}
                    </span>
                  </div>

                  <p className="text-sm text-white/90 font-medium">{post?.caption || "No caption"}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-muted">
                    <div>Scheduled: <strong className="text-white">{new Date(j.run_at).toLocaleString()}</strong></div>
                    {j.external_post_id && <div>External ID: <code className="text-cyan-300">{j.external_post_id}</code></div>}
                    {j.error_message && <div className="text-red-400">Error: {j.error_message}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {j.status === "queued" && (
                    <button
                      onClick={async () => {
                        await cancelPublishingJob(j.id);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 glass px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                  {j.status === "failed" && (
                    <button
                      onClick={async () => {
                        const newTime = new Date(Date.now() + 60000).toISOString();
                        await rescheduleJob(j.id, newTime);
                      }}
                      className="text-xs text-[#ff9f43] hover:underline glass px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <RefreshCw size={14} /> Retry / Requeue
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}

          {filtered.length === 0 && (
            <GlassCard className="p-12 text-center text-muted text-sm">
              No publishing queue items matching your filter.
            </GlassCard>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split("T")[0];
            const dayJobs = filtered.filter((j) => j.run_at.startsWith(dateStr));

            return (
              <GlassCard key={dateStr} className="p-4 space-y-3 min-h-[280px] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[#ff9f43] uppercase tracking-wider">{d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  <div className="text-xs text-muted pt-1">{dayJobs.length} scheduled item{dayJobs.length === 1 ? '' : 's'}</div>
                </div>

                <div className="space-y-2 flex-1">
                  {dayJobs.map((j) => {
                    const target = Array.isArray(j.social_post_targets) ? j.social_post_targets[0] : j.social_post_targets;
                    return (
                      <div key={j.id} className="bg-black/40 p-2.5 rounded-lg border border-white/10 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="uppercase font-bold text-cyan-400 text-[10px]">{target?.social_accounts?.platform}</span>
                          <span className={`text-[10px] px-1.5 rounded uppercase ${j.status === 'succeeded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{j.status}</span>
                        </div>
                        <p className="text-white truncate font-medium">{target?.social_posts?.caption}</p>
                      </div>
                    );
                  })}
                  {dayJobs.length === 0 && (
                    <div className="text-[11px] text-muted/50 text-center py-8">No posts</div>
                  )}
                </div>

                <button onClick={() => setShowNewModal(true)} className="w-full text-center text-[11px] text-muted hover:text-white pt-2 border-t border-white/10">
                  + Add Post
                </button>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
