"use server";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional(),
  organization: z.string().trim().max(160).optional(),
  event_type: z.string().trim().min(2).max(80),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  venue: z.string().trim().max(200).optional(),
  audience_size: z.coerce.number().int().min(1).max(500000).optional(),
  duration_minutes: z.coerce.number().int().min(15).max(1440).optional(),
  budget_range: z.string().trim().max(80).optional(),
  details: z.string().trim().max(4000).optional(),
});

export async function submitBooking(fd: FormData) {
  if (fd.get("website")) redirect("/bookings?sent=1"); // honeypot: silently drop bots
  const raw = Object.fromEntries([...fd.entries()].filter(([k, v]) => k !== "website" && v !== ""));
  const p = schema.safeParse(raw);
  if (!p.success) redirect("/bookings?error=invalid");

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = createHash("sha256").update(ip + (process.env.RATE_LIMIT_SALT ?? "")).digest("hex");
  const db = supabaseAdmin();
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await db.from("rate_limit_hits").select("*", { count: "exact", head: true }).eq("key", key).gte("at", since);
  if ((count ?? 0) >= 5) redirect("/bookings?error=rate");
  await db.from("rate_limit_hits").insert({ key });

  const { error } = await db.from("booking_inquiries").insert({ ...p.data, ip_hash: key });
  if (error) redirect("/bookings?error=save");

  // Emails go out only after the inquiry is stored. An inquiry is not a confirmed booking.
  const d = p.data;
  const to = process.env.BOOKING_NOTIFY_EMAIL;
  if (to) await sendEmail(to, `New booking inquiry: ${d.event_type} on ${d.event_date}`, `${d.name} <${d.email}>\n${d.organization ?? ""}\n\n${d.details ?? ""}`);
  await sendEmail(d.email, "We received your booking inquiry", `Hi ${d.name}, thanks for getting in touch. This is an inquiry, not a confirmed booking. We will reply soon.`);
  redirect("/bookings?sent=1");
}
