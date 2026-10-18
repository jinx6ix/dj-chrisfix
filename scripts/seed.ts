import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. Skipping database seed.");
  process.exit(0);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function seed() {
  console.log("🌱 Starting development seed for DJ ChrisFix platform...");

  // 1. Site Settings
  const { error: settingsError } = await supabase.from("site_settings").upsert({
    id: 1,
    artist_name: "DJ ChrisFix",
    tagline: "Underground House & Techno Resident · Global Tour Selector",
    bio: "DJ ChrisFix is a staple of the underground electronic scene, known for hypnotic minimal house, driving techno, and immersive analog soundscapes.",
    contact_email: "booking@djchrisfix.com",
    socials: {
      soundcloud: "https://soundcloud.com/djchrisfix",
      instagram: "https://instagram.com/djchrisfix",
      youtube: "https://youtube.com/@djchrisfix",
    },
  });
  if (settingsError) console.error("Error seeding site_settings:", settingsError.message);
  else console.log("✓ Site settings seeded");

  // 2. Genres
  const genres = [
    { name: "Deep Tech", slug: "deep-tech" },
    { name: "Minimal House", slug: "minimal-house" },
    { name: "Driving Techno", slug: "driving-techno" },
    { name: "Melodic House", slug: "melodic-house" },
    { name: "Ambient / Live", slug: "ambient-live" },
  ];

  for (const g of genres) {
    await supabase.from("genres").upsert(g, { onConflict: "slug" });
  }
  console.log("✓ Genres seeded");

  // 3. Sample Mixes
  const mixes = [
    {
      slug: "terminal-underground-live-014",
      title: "Terminal Underground Live Session #014",
      description: "Recorded live at the underground warehouse residency in Berlin. Deep minimal house grooves blending into raw hypnotic techno.",
      cover_url: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=1000&auto=format&fit=crop",
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration_seconds: 4540,
      release_date: "2026-10-01",
      featured: true,
      status: "published",
      published_at: new Date().toISOString(),
      seo_title: "Terminal Underground Live #014 | DJ ChrisFix",
      seo_description: "Listen to the latest minimal house & techno live set by DJ ChrisFix.",
    },
    {
      slug: "sunset-rooftop-session-08",
      title: "Sunset Rooftop Session Vol. 8",
      description: "Melodic and deep organic house recorded overlooking the city skyline at dusk.",
      cover_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duration_seconds: 3500,
      release_date: "2026-09-15",
      featured: true,
      status: "published",
      published_at: new Date().toISOString(),
      seo_title: "Sunset Rooftop Session Vol. 8 | DJ ChrisFix",
      seo_description: "Organic and melodic house sunset session by DJ ChrisFix.",
    },
  ];

  for (const m of mixes) {
    await supabase.from("mixes").upsert(m, { onConflict: "slug" });
  }
  console.log("✓ Sample mixes seeded");

  // 4. Sample Events
  const events = [
    {
      slug: "fabric-london-residency-2026",
      title: "Fabric London Residency - All Night Long",
      description: "Returning to Room One for an extended 6-hour journey through deep minimal house and peak-time techno.",
      poster_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
      starts_at: "2026-11-20T22:00:00Z",
      timezone: "Europe/London",
      venue_name: "Fabric",
      city: "London, UK",
      ticket_url: "https://residentadvisor.net",
      featured: true,
      status: "published",
    },
    {
      slug: "sonar-festival-barcelona-2026",
      title: "Sónar Festival - SonarLab Stage",
      description: "Performing live analog hardware and modular synthesizer set at Sónar by Day.",
      poster_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
      starts_at: "2026-12-05T18:30:00Z",
      timezone: "Europe/Madrid",
      venue_name: "Fira Gran Via",
      city: "Barcelona, Spain",
      ticket_url: "https://sonar.es",
      featured: true,
      status: "published",
    },
  ];

  for (const ev of events) {
    await supabase.from("events").upsert(ev, { onConflict: "slug" });
  }
  console.log("✓ Sample events seeded");

  console.log("✨ Development seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
