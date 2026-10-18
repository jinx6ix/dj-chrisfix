"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

const https = z.string().trim().max(500).url().refine((u) => u.startsWith("https://"), "https only");
const optHttps = z.string().trim().max(500).url().refine((u) => u.startsWith("https://"), "https only").optional().or(z.literal(""));

const mixSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  audio_url: optHttps,
  cover_url: optHttps,
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  release_date: z.string().optional().or(z.literal("")),
  seo_title: z.string().trim().max(160).optional().or(z.literal("")),
  seo_description: z.string().trim().max(300).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean(),
});

const eventSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  venue_name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(100),
  starts_at: z.string().min(1),
  timezone: z.string().trim().min(1).default("UTC"),
  poster_url: optHttps,
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  ticket_url: optHttps,
  status: z.enum(["draft", "published", "cancelled", "postponed", "archived"]),
  featured: z.boolean(),
});

export async function createMix(fd: FormData) {
  const { sb, user } = await requireRole(["editor"]);
  const p = mixSchema.safeParse({
    title: fd.get("title"),
    slug: fd.get("slug"),
    audio_url: fd.get("audio_url"),
    cover_url: fd.get("cover_url"),
    description: fd.get("description"),
    release_date: fd.get("release_date") || null,
    seo_title: fd.get("seo_title"),
    seo_description: fd.get("seo_description"),
    status: fd.get("status") || "draft",
    featured: fd.get("featured") === "on",
  });
  if (!p.success) redirect("/dashboard/mixes?error=invalid");
  const data = {
    ...p.data,
    audio_url: p.data.audio_url || null,
    cover_url: p.data.cover_url || null,
    description: p.data.description || null,
    release_date: p.data.release_date || null,
    seo_title: p.data.seo_title || null,
    seo_description: p.data.seo_description || null,
    created_by: user.id,
    published_at: p.data.status === "published" ? new Date().toISOString() : null,
  };
  const { error } = await sb.from("mixes").insert(data);
  if (error) redirect(`/dashboard/mixes?error=${error.code === "23505" ? "slug" : "save"}`);
  await sb.from("audit_logs").insert({ actor: user.id, action: "mix.create", entity: "mixes", entity_id: p.data.slug });
  revalidatePath("/", "layout");
  redirect("/dashboard/mixes?ok=1");
}

export async function updateMix(fd: FormData) {
  const { sb, user } = await requireRole(["editor"]);
  const id = z.string().uuid().parse(fd.get("id"));
  const p = mixSchema.safeParse({
    title: fd.get("title"),
    slug: fd.get("slug"),
    audio_url: fd.get("audio_url"),
    cover_url: fd.get("cover_url"),
    description: fd.get("description"),
    release_date: fd.get("release_date") || null,
    seo_title: fd.get("seo_title"),
    seo_description: fd.get("seo_description"),
    status: fd.get("status") || "draft",
    featured: fd.get("featured") === "on",
  });
  if (!p.success) redirect(`/dashboard/mixes/${id}/edit?error=invalid`);
  const data = {
    ...p.data,
    audio_url: p.data.audio_url || null,
    cover_url: p.data.cover_url || null,
    description: p.data.description || null,
    release_date: p.data.release_date || null,
    seo_title: p.data.seo_title || null,
    seo_description: p.data.seo_description || null,
    updated_at: new Date().toISOString(),
    ...(p.data.status === "published" ? { published_at: new Date().toISOString() } : {}),
  };
  const { error } = await sb.from("mixes").update(data).eq("id", id);
  if (error) redirect(`/dashboard/mixes/${id}/edit?error=${error.code === "23505" ? "slug" : "save"}`);
  await sb.from("audit_logs").insert({ actor: user.id, action: "mix.update", entity: "mixes", entity_id: id });
  revalidatePath("/", "layout");
  redirect("/dashboard/mixes?ok=1");
}

export async function deleteMix(fd: FormData) {
  const { sb, user } = await requireRole(["editor"]);
  const id = z.string().uuid().parse(fd.get("id"));
  const { error } = await sb.from("mixes").delete().eq("id", id);
  if (error) redirect("/dashboard/mixes?error=save");
  await sb.from("audit_logs").insert({ actor: user.id, action: "mix.delete", entity: "mixes", entity_id: id });
  revalidatePath("/", "layout");
  redirect("/dashboard/mixes?ok=1");
}

export async function setMixStatus(fd: FormData) {
  const { sb, user } = await requireRole(["editor"]);
  const id = z.string().uuid().parse(fd.get("id"));
  const status = z.enum(["draft", "published", "archived"]).parse(fd.get("status"));
  const { error } = await sb.from("mixes").update({ status, ...(status === "published" ? { published_at: new Date().toISOString() } : {}) }).eq("id", id);
  if (error) redirect("/dashboard/mixes?error=save");
  await sb.from("audit_logs").insert({ actor: user.id, action: `mix.${status}`, entity: "mixes", entity_id: id });
  revalidatePath("/", "layout");
  redirect("/dashboard/mixes?ok=1");
}

export async function createEvent(fd: FormData) {
  const { sb, user } = await requireRole(["editor"]);
  const p = eventSchema.safeParse({
    title: fd.get("title"),
    slug: fd.get("slug"),
    venue_name: fd.get("venue_name"),
    city: fd.get("city"),
    starts_at: fd.get("starts_at"),
    timezone: fd.get("timezone") || "UTC",
    poster_url: fd.get("poster_url"),
    description: fd.get("description"),
    ticket_url: fd.get("ticket_url"),
    status: fd.get("status") || "draft",
    featured: fd.get("featured") === "on",
  });
  if (!p.success) redirect("/dashboard/events?error=invalid");
  const data = {
    ...p.data,
    poster_url: p.data.poster_url || null,
    description: p.data.description || null,
    ticket_url: p.data.ticket_url || null,
  };
  const { error } = await sb.from("events").insert(data);
  if (error) redirect(`/dashboard/events?error=${error.code === "23505" ? "slug" : "save"}`);
  await sb.from("audit_logs").insert({ actor: user.id, action: "event.create", entity: "events", entity_id: p.data.slug });
  revalidatePath("/", "layout");
  redirect("/dashboard/events?ok=1");
}

export async function updateEvent(fd: FormData) {
  const { sb, user } = await requireRole(["editor"]);
  const id = z.string().uuid().parse(fd.get("id"));
  const p = eventSchema.safeParse({
    title: fd.get("title"),
    slug: fd.get("slug"),
    venue_name: fd.get("venue_name"),
    city: fd.get("city"),
    starts_at: fd.get("starts_at"),
    timezone: fd.get("timezone") || "UTC",
    poster_url: fd.get("poster_url"),
    description: fd.get("description"),
    ticket_url: fd.get("ticket_url"),
    status: fd.get("status") || "draft",
    featured: fd.get("featured") === "on",
  });
  if (!p.success) redirect(`/dashboard/events/${id}/edit?error=invalid`);
  const data = {
    ...p.data,
    poster_url: p.data.poster_url || null,
    description: p.data.description || null,
    ticket_url: p.data.ticket_url || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await sb.from("events").update(data).eq("id", id);
  if (error) redirect(`/dashboard/events/${id}/edit?error=${error.code === "23505" ? "slug" : "save"}`);
  await sb.from("audit_logs").insert({ actor: user.id, action: "event.update", entity: "events", entity_id: id });
  revalidatePath("/", "layout");
  redirect("/dashboard/events?ok=1");
}

export async function deleteEvent(fd: FormData) {
  const { sb, user } = await requireRole(["editor"]);
  const id = z.string().uuid().parse(fd.get("id"));
  const { error } = await sb.from("events").delete().eq("id", id);
  if (error) redirect("/dashboard/events?error=save");
  await sb.from("audit_logs").insert({ actor: user.id, action: "event.delete", entity: "events", entity_id: id });
  revalidatePath("/", "layout");
  redirect("/dashboard/events?ok=1");
}

export async function setEventStatus(fd: FormData) {
  const { sb, user } = await requireRole(["editor"]);
  const id = z.string().uuid().parse(fd.get("id"));
  const status = z.enum(["draft", "published", "cancelled", "postponed", "archived"]).parse(fd.get("status"));
  const { error } = await sb.from("events").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) redirect("/dashboard/events?error=save");
  await sb.from("audit_logs").insert({ actor: user.id, action: `event.${status}`, entity: "events", entity_id: id });
  revalidatePath("/", "layout");
  redirect("/dashboard/events?ok=1");
}

export async function setInquiryStatus(fd: FormData) {
  const { sb, user } = await requireRole(["booking_manager"]);
  const id = z.string().uuid().parse(fd.get("id"));
  const status = z.enum(["new", "contacted", "negotiating", "confirmed", "completed", "cancelled", "archived"]).parse(fd.get("status"));
  const { error } = await sb.from("booking_inquiries").update({ status }).eq("id", id);
  if (error) redirect("/dashboard/bookings?error=save");
  await sb.from("audit_logs").insert({ actor: user.id, action: `inquiry.${status}`, entity: "booking_inquiries", entity_id: id });
  revalidatePath("/dashboard/bookings");
  redirect("/dashboard/bookings?ok=1");
}

const opt = (n: number) => z.string().trim().max(n).transform((v) => v || null);
const settingsSchema = z.object({
  artist_name: z.string().trim().min(1).max(80),
  tagline: opt(200), bio: opt(5000),
  contact_email: z.string().trim().max(200).email().or(z.literal("")).transform((v) => v || null),
});

export async function saveSettings(fd: FormData) {
  const { sb, user } = await requireRole(["editor"]);
  const p = settingsSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!p.success) redirect("/dashboard/settings?error=invalid");
  const { error } = await sb.from("site_settings").upsert({ id: 1, ...p.data });
  if (error) redirect("/dashboard/settings?error=save");
  await sb.from("audit_logs").insert({ actor: user.id, action: "settings.update", entity: "site_settings", entity_id: "1" });
  revalidatePath("/", "layout");
  redirect("/dashboard/settings?ok=1");
}
