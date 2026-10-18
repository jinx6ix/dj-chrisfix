import type { Metadata } from "next";
import Link from "next/link";
import { Disc, AlertTriangle, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { AnimatedButton } from "@/components/animated-button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested page could not be found on DJ ChrisFix.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <GlassIcon icon={AlertTriangle} variant="amber" size={36} />
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">404 – Page Not Found</h1>
        <p className="text-muted text-base max-w-md mx-auto">
          The page or audio track you are looking for does not exist, has been removed, or the link was incorrect.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link href="/">
          <AnimatedButton variant="primary" className="flex items-center gap-2">
            <ArrowLeft size={16} /> Return Home
          </AnimatedButton>
        </Link>
        <Link href="/mixes">
          <AnimatedButton variant="ghost" className="flex items-center gap-2">
            <Disc size={16} /> Browse Mixes
          </AnimatedButton>
        </Link>
      </div>
    </div>
  );
}
