"use server";

import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const aiPromptSchema = z.object({
  contentType: z.enum(["social_caption", "event_announcement", "mix_description", "promo_calendar"]),
  platform: z.enum(["instagram", "tiktok", "x", "soundcloud"]),
  tone: z.enum(["energetic", "professional", "underground", "short"]),
  eventId: z.string().optional(),
  mixId: z.string().optional(),
  customPrompt: z.string().max(500).optional(),
});

export async function generatePromoContent(formData: FormData) {
  const { user } = await requireRole(["social_manager", "editor"]);
  const sb = supabaseAdmin();

  const contentType = formData.get("contentType") as string;
  const platform = formData.get("platform") as string;
  const tone = formData.get("tone") as string;
  const eventId = formData.get("eventId") as string;
  const mixId = formData.get("mixId") as string;
  const customPrompt = formData.get("customPrompt") as string;

  const parsed = aiPromptSchema.parse({
    contentType,
    platform,
    tone,
    eventId: eventId || undefined,
    mixId: mixId || undefined,
    customPrompt: customPrompt || undefined,
  });

  // Fetch verified event or mix info if linked
  let contextData = "";
  if (parsed.eventId) {
    const { data: ev } = await sb.from("events").select("*").eq("id", parsed.eventId).single();
    if (ev) {
      contextData += `EVENT DETAILS: Title: ${ev.title}, Date: ${ev.date}, Venue: ${ev.venue}, City: ${ev.city}, Ticket URL: ${ev.ticket_url || 'N/A'}. `;
    }
  }

  if (parsed.mixId) {
    const { data: mix } = await sb.from("mixes").select("*").eq("id", parsed.mixId).single();
    if (mix) {
      contextData += `MIX DETAILS: Title: ${mix.title}, Genre: ${mix.genre}, Duration: ${mix.duration_seconds}s, Description: ${mix.description}. `;
    }
  }

  const groqApiKey = process.env.GROQ_API_KEY;

  let generatedText = "";

  if (!groqApiKey) {
    // Fallback template when no API key is configured (keeping app functional)
    generatedText = `[AI Offline Mode - Set GROQ_API_KEY for live generation]
🔥 Catch DJ ChrisFix live! Experience unmatched energy and deep basslines.
${contextData ? `Featuring: ${contextData}` : ''}
Don't miss out — grab tickets at djchrisfix.com! 🎧✨
#DJChrisFix #ElectronicMusic #${parsed.platform}`;
  } else {
    try {
      const systemPrompt = `You are an expert social media manager and music publicist for DJ ChrisFix.
Generate professional promotional content for ${parsed.platform} with a ${parsed.tone} tone.
CRITICAL RULE: Use ONLY verified information provided in the context below. Do NOT invent venues, dates, ticket availability, or achievements.
Context: ${contextData || "General artist promotion for DJ ChrisFix."}
Additional Notes: ${parsed.customPrompt || "None."}`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate the ${parsed.contentType} now.` }
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!res.ok) {
        throw new Error(`Groq API error: ${res.statusText}`);
      }

      const json = await res.json();
      generatedText = json.choices?.[0]?.message?.content || "Failed to generate text.";
    } catch (err: any) {
      console.error("Groq generation error:", err);
      redirect(`/dashboard/ai?error=${encodeURIComponent(err.message)}`);
    }
  }

  // Log generation audit
  await sb.from("audit_logs").insert({
    actor: user.id,
    action: "ai.generate_promo",
    entity: "social_posts",
    meta: { contentType: parsed.contentType, platform: parsed.platform },
  });

  revalidatePath("/dashboard/ai");
  redirect("/dashboard/ai?ok=1");
}
