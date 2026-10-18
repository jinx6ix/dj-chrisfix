import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const sb = supabaseAdmin();

  const { data: mixes } = await sb.from("mixes").select("slug,updated_at").eq("status", "published");
  const { data: events } = await sb.from("events").select("slug,updated_at").in("status", ["published", "postponed"]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/mixes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/videos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/bookings`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const mixPages: MetadataRoute.Sitemap = (mixes || []).map((m) => ({
    url: `${baseUrl}/mixes/${m.slug}`,
    lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const eventPages: MetadataRoute.Sitemap = (events || []).map((e) => ({
    url: `${baseUrl}/events/${e.slug}`,
    lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...mixPages, ...eventPages];
}
