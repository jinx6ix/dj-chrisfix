"use server";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(5).max(4000),
});

export async function submitContact(fd: FormData) {
  if (fd.get("website")) redirect("/contact?sent=1"); // honeypot
  const raw = Object.fromEntries([...fd.entries()].filter(([k, v]) => k !== "website" && v !== ""));
  const p = contactSchema.safeParse(raw);
  if (!p.success) redirect("/contact?error=invalid");

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = createHash("sha256").update(ip + (process.env.RATE_LIMIT_SALT ?? "")).digest("hex");
  const db = supabaseAdmin();
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await db.from("rate_limit_hits").select("*", { count: "exact", head: true }).eq("key", key).gte("at", since);
  if ((count ?? 0) >= 5) redirect("/contact?error=rate");
  await db.from("rate_limit_hits").insert({ key });

  const to = process.env.BOOKING_NOTIFY_EMAIL || "booking@djchrisfix.com";
  await sendEmail(to, `Contact Message: ${p.data.subject}`, `From: ${p.data.name} <${p.data.email}>\n\n${p.data.message}`);
  await sendEmail(p.data.email, "We received your message", `Hi ${p.data.name}, thanks for reaching out. We have received your message and will get back to you shortly.`);

  redirect("/contact?sent=1");
}
