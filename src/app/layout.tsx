import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { AudioProvider } from "@/context/audio-context";
import { PersistentPlayer } from "@/components/persistent-player";
import { NavbarClient } from "@/components/navbar-client";

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
          <NavbarClient artistName={s.artist_name} />
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
