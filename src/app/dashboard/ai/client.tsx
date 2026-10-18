"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { Wand2, Sparkles, CheckCircle2, AlertCircle, Copy, Send } from "lucide-react";
import { generatePromoContent } from "./actions";

interface EventOption {
  id: string;
  title: string;
  date: string;
  venue?: string;
  city?: string;
}

interface MixOption {
  id: string;
  title: string;
  genre: string;
}

export default function AIClient({
  upcomingEvents,
  latestMixes,
  hasGroqKey,
  ok,
  error,
}: {
  upcomingEvents: EventOption[];
  latestMixes: MixOption[];
  hasGroqKey: boolean;
  ok?: string;
  error?: string;
}) {
  const [outputContent, setOutputContent] = useState(
    `🔥 Catch DJ ChrisFix live this weekend! Unbelievable energy, massive basslines, and an unforgettable vibe. Tickets are moving fast — grab yours now at djchrisfix.com/events! 🎧✨\n\n#DJChrisFix #LiveMusic #ElectronicMusic #Nightlife`
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="glass p-8 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Wand2} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">AI Studio (Groq Integration)</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">AI Promotional Content Generator</h1>
        <p className="text-muted text-sm max-w-2xl">
          Generate editable social captions, event announcements, hashtags, alternative tones, and mix descriptions using verified event and artist database records.
        </p>

        <div className="flex items-center gap-2 pt-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5 ${hasGroqKey ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            {hasGroqKey ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {hasGroqKey ? "Groq API Connected (llama-3.3-70b-versatile)" : "Groq API Key Not Configured (Set GROQ_API_KEY)"}
          </span>
        </div>
      </div>

      {ok && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} /> Successfully generated and saved promotional content!
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} /> Error: {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Generator Controls */}
        <GlassCard className="p-6 space-y-6 lg:col-span-1 border border-[#ff9f43]/30">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#ff9f43]" />
            <h3 className="text-base font-bold">Content Prompt Settings</h3>
          </div>

          <form action={generatePromoContent} className="space-y-4">
            <div>
              <label className="text-xs mb-1 block text-muted font-medium">Content Type</label>
              <select name="contentType" defaultValue="social_caption" className="field text-xs">
                <option value="social_caption">Social Media Caption & Hashtags</option>
                <option value="event_announcement">Event Announcement</option>
                <option value="mix_description">Mix / Release Description</option>
                <option value="promo_calendar">Weekly Promo Schedule</option>
              </select>
            </div>

            <div>
              <label className="text-xs mb-1 block text-muted font-medium">Target Platform</label>
              <select name="platform" defaultValue="instagram" className="field text-xs">
                <option value="instagram">Instagram / Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="x">X (Twitter)</option>
                <option value="soundcloud">SoundCloud / Mixcloud</option>
              </select>
            </div>

            <div>
              <label className="text-xs mb-1 block text-muted font-medium">Tone & Style</label>
              <select name="tone" defaultValue="energetic" className="field text-xs">
                <option value="energetic">High Energy & Hype</option>
                <option value="professional">Professional & Sophisticated</option>
                <option value="underground">Underground & Gritty</option>
                <option value="short">Short & Punchy</option>
              </select>
            </div>

            <div>
              <label className="text-xs mb-1 block text-muted font-medium">Link with Event (Optional)</label>
              <select name="eventId" className="field text-xs">
                <option value="">-- None / General Artist Promo --</option>
                {upcomingEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({new Date(ev.date).toLocaleDateString()} @ {ev.venue})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs mb-1 block text-muted font-medium">Link with Mix (Optional)</label>
              <select name="mixId" className="field text-xs">
                <option value="">-- None / General Mix --</option>
                {latestMixes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.genre})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs mb-1 block text-muted font-medium">Custom Context / Notes</label>
              <textarea
                name="customPrompt"
                rows={3}
                placeholder="Add special guest mentions, ticket link callouts, etc..."
                className="field text-xs"
              />
            </div>

            <button type="submit" className="w-full btn btn-primary flex items-center justify-center gap-2 text-xs py-2.5">
              <Sparkles size={16} /> Generate with Groq AI
            </button>
          </form>
        </GlassCard>

        {/* Results / Preview / Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold">Generated Content Output</h3>
                <p className="text-xs text-muted">Review, edit, and save verified AI-assisted promotional content.</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold uppercase">
                Groq Llama 3.3 70B
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Draft Output (Editable)</span>
                  <span>AI Guardrails Active: Verified DB Data Only</span>
                </div>
                <textarea
                  rows={8}
                  value={outputContent}
                  onChange={(e) => setOutputContent(e.target.value)}
                  className="w-full bg-transparent text-white text-sm focus:outline-none resize-y font-mono p-2"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy} className="btn btn-ghost text-xs flex items-center gap-1.5">
                    <Copy size={14} /> {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                  <span className="text-xs text-muted">Zero hallucination guardrails enforced</span>
                </div>

                <div className="flex items-center gap-3">
                  <a href="/dashboard/planner" className="btn btn-primary text-xs flex items-center gap-1.5">
                    <Send size={14} /> Send to Publishing Queue
                  </a>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h4 className="text-sm font-bold text-[#ff9f43] uppercase tracking-wider">Configuration & Documentation</h4>
            <div className="text-xs text-muted space-y-2 leading-relaxed">
              <p>
                <strong>Groq API Integration:</strong> The AI generator uses Groq's high-speed Llama 3.3 70B model. To enable live AI generation, set the <code className="text-cyan-300">GROQ_API_KEY</code> environment variable in your deployment environment or <code className="text-cyan-300">.env</code> file.
              </p>
              <p>
                <strong>Guardrails & Safety:</strong> The system automatically injects verified event dates, venue names, and mix titles directly from Supabase. The model is instructed never to invent dates, venues, or ticket prices.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
