import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { AudioProvider } from "@/context/audio-context";
import { PersistentPlayer } from "@/components/persistent-player";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.artist_name, template: `%s · ${s.artist_name}` },
    description: s.tagline ?? undefined,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <html lang="en">
      <body>
        <AudioProvider>
          <header className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="font-semibold tracking-tight">{s.artist_name}</Link>
            <nav aria-label="Main" className="flex items-center gap-5 text-sm text-muted">
              <Link href="/mixes" className="hover:text-white transition-colors">Mixes</Link>
              <Link href="/events" className="hover:text-white transition-colors">Events</Link>
              <Link href="/videos" className="hover:text-white transition-colors">Videos</Link>
              <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/bookings" className="hover:text-[#ff9f43] transition-colors font-medium text-white">Book</Link>
            </nav>
          </header>
          <main className="mx-auto max-w-6xl px-5 py-10 pb-28">{children}</main>
          <footer className="mx-auto max-w-6xl px-5 pb-20 text-sm text-muted">
            © {new Date().getFullYear()} {s.artist_name}{s.contact_email ? ` · ${s.contact_email}` : ""}
          </footer>
          <PersistentPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
