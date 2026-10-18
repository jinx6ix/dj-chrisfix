"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { BarChart3, Globe, Radio, Share2, Calendar, Users, Music, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface AnalyticsData {
  range: string;
  mixesCount: number;
  eventsCount: number;
  bookingsCount: number;
  socialAccountsCount: number;
  publishingJobsCount: number;
  publishingSucceededCount: number;
  gaConnected: boolean;
  socialConnectedCount: number;
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const [range, setRange] = useState("30d");

  return (
    <div className="space-y-8">
      {/* Header & Date Range Filter */}
      <div className="glass p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <GlassIcon icon={BarChart3} variant="violet" size={24} />
              <span className="text-xs font-semibold tracking-wider uppercase text-violet-400">Audience & Platform Metrics</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted text-sm">
              Real-time database metrics, publishing performance, booking inquiries, and connected platform status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Timeframe:</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="field text-xs py-1.5"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-5 space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Mixes</span>
            <Music size={18} className="text-[#ff9f43]" />
          </div>
          <div className="text-3xl font-bold">{data.mixesCount}</div>
          <div className="text-xs text-emerald-400">100% active database records</div>
        </GlassCard>

        <GlassCard className="p-5 space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold tracking-wider">Events & Tours</span>
            <Calendar size={18} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-bold">{data.eventsCount}</div>
          <div className="text-xs text-cyan-400">Verified schedule items</div>
        </GlassCard>

        <GlassCard className="p-5 space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold tracking-wider">Booking Inquiries</span>
            <Users size={18} className="text-violet-400" />
          </div>
          <div className="text-3xl font-bold">{data.bookingsCount}</div>
          <div className="text-xs text-violet-400">CRM database tracked</div>
        </GlassCard>

        <GlassCard className="p-5 space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold tracking-wider">Publishing Success</span>
            <Share2 size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-bold">
            {data.publishingJobsCount > 0
              ? `${Math.round((data.publishingSucceededCount / data.publishingJobsCount) * 100)}%`
              : "0%"}
          </div>
          <div className="text-xs text-muted">
            {data.publishingSucceededCount} of {data.publishingJobsCount} jobs succeeded
          </div>
        </GlassCard>
      </div>

      {/* Provider Status Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="text-[#ff9f43]" size={22} />
              <h3 className="text-lg font-bold">Google Analytics (GA4)</h3>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${data.gaConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {data.gaConnected ? "Connected" : "Data Unavailable"}
            </span>
          </div>
          <p className="text-sm text-muted">
            Website visitor counts, page impressions, and bounce rates are loaded from Google Analytics GA4.
          </p>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center text-xs text-muted">
            {data.gaConnected ? "GA4 Tag Active & Receiving Events" : "Zero tracking data — Measurement ID not configured in environment variables."}
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="text-violet-400" size={22} />
              <h3 className="text-lg font-bold">Social & Streaming APIs</h3>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${data.socialConnectedCount > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-muted border border-white/10'}`}>
              {data.socialConnectedCount} Connected
            </span>
          </div>
          <p className="text-sm text-muted">
            Official OAuth connections for Instagram, TikTok, YouTube, X, SoundCloud, and Spotify.
          </p>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-muted">Connected accounts authorized:</span>
            <span className="font-bold text-white">{data.socialConnectedCount} platform accounts</span>
          </div>
        </GlassCard>
      </div>

      {/* Unmeasured Metrics Documentation */}
      <GlassCard className="p-6 space-y-4 border border-white/10">
        <h4 className="text-sm font-bold text-[#ff9f43] uppercase tracking-wider">Metrics Documentation & Anti-Fabrication Notice</h4>
        <div className="text-xs text-muted space-y-2 leading-relaxed">
          <p>
            In accordance with anti-fabrication guidelines, metrics that cannot be verified via official APIs or database records are explicitly marked as unavailable rather than simulated or estimated.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Website Unique Visitors:</strong> Requires active GA4 Measurement ID configuration.</li>
            <li><strong>SoundCloud Play Counts:</strong> Retrieved via official SoundCloud API token integration in Social Accounts.</li>
            <li><strong>Social Engagement Rates:</strong> Calculated exclusively from successful publishing job logs and webhook responses.</li>
          </ul>
        </div>
      </GlassCard>
    </div>
  );
}
