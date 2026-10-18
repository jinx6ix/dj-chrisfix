import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AIClient from "./client";

export const metadata = { title: "AI Promotional Content Generator" };
export const dynamic = "force-dynamic";

export default async function AIPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireRole(["social_manager", "editor"]);
  const resolvedParams = await searchParams;
  const ok = resolvedParams?.ok as string | undefined;
  const error = resolvedParams?.error as string | undefined;

  const sb = supabaseAdmin();
  const { data: upcomingEvents } = await sb
    .from("events")
    .select("id, title, date, venue, city")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(10);

  const { data: latestMixes } = await sb
    .from("mixes")
    .select("id, title, genre, duration")
    .order("created_at", { ascending: false })
    .limit(10);

  const hasGroqKey = !!process.env.GROQ_API_KEY;

  return (
    <AIClient
      upcomingEvents={upcomingEvents || []}
      latestMixes={latestMixes || []}
      hasGroqKey={hasGroqKey}
      ok={ok}
      error={error}
    />
  );
}
