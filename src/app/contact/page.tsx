import { Metadata } from "next";
import { Mail, Send, Sparkles } from "lucide-react";
import { submitContact } from "./actions";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { AnimatedButton } from "@/components/animated-button";

export const metadata: Metadata = { title: "Contact & Management" };

const ERR: Record<string, string> = {
  invalid: "Please check your details and try again.",
  rate: "Too many requests. Please try again later.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const sp = await searchParams;

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {/* Header */}
      <div className="glass p-8 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Mail} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Get in Touch</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Contact & Management</h1>
        <p className="text-muted text-base">
          For general inquiries, press features, collaborations, or management communications. For tour bookings, please use the <a href="/bookings" className="text-[#ff9f43] underline hover:text-white">booking inquiry page</a>.
        </p>
      </div>

      {sp.sent && (
        <GlassCard className="p-6 bg-emerald-500/10 border-emerald-500/30 text-emerald-200">
          <p className="font-semibold">Message received successfully!</p>
          <p className="text-xs text-muted mt-1">Thank you for reaching out. We will respond to your email shortly.</p>
        </GlassCard>
      )}

      {sp.error && (
        <GlassCard className="p-6 bg-red-500/10 border-red-500/30 text-red-200">
          <p className="font-semibold">Submission failed</p>
          <p className="text-xs text-muted mt-1">{ERR[sp.error] ?? "Please check your inputs and try again."}</p>
        </GlassCard>
      )}

      <form action={submitContact} className="glass p-8 space-y-6 rounded-3xl border border-white/10">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block text-sm space-y-2">
            <span className="text-muted font-medium">Your Name *</span>
            <input name="name" type="text" required placeholder="Alex Rivera" className="field w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#ff9f43]" />
          </label>
          <label className="block text-sm space-y-2">
            <span className="text-muted font-medium">Email Address *</span>
            <input name="email" type="email" required placeholder="alex@example.com" className="field w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#ff9f43]" />
          </label>
        </div>

        <label className="block text-sm space-y-2">
          <span className="text-muted font-medium">Subject *</span>
          <input name="subject" type="text" required placeholder="Press collaboration / Remix inquiry" className="field w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#ff9f43]" />
        </label>

        <label className="block text-sm space-y-2">
          <span className="text-muted font-medium">Message *</span>
          <textarea name="message" rows={5} required placeholder="Write your message here..." className="field w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#ff9f43]" />
        </label>

        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

        <div>
          <AnimatedButton variant="primary" className="w-full py-4 text-base font-semibold flex items-center justify-center gap-2">
            Send Message <Send size={18} />
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
}
