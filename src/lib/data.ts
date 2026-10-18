import { supabaseServer } from "./supabase/server";

export type Settings = { artist_name: string; tagline: string | null; bio: string | null; contact_email: string | null };

export async function getSettings(): Promise<Settings> {
  const sb = await supabaseServer();
  const { data } = await sb.from("site_settings").select("artist_name,tagline,bio,contact_email").eq("id", 1).maybeSingle();
  return {
    artist_name: data?.artist_name && data.artist_name !== "Artist Name" ? data.artist_name : "DJ ChrisFix",
    tagline: data?.tagline ?? "World-class electronic music producer & club resident",
    bio: data?.bio ?? "Pushing the boundaries of house, techno, and melodic soundscapes across global dancefloors.",
    contact_email: data?.contact_email ?? "booking@djchrisfix.com",
  };
}
