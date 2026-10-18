import { LucideIcon } from "lucide-react";

interface GlassIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  variant?: "amber" | "violet" | "default";
}

export function GlassIcon({ icon: Icon, size = 20, className = "", variant = "amber" }: GlassIconProps) {
  const variantStyles = {
    amber: "bg-amber-500/10 text-[#ff9f43] border-amber-500/20",
    violet: "bg-violet-500/10 text-[#7c3aed] border-violet-500/20",
    default: "bg-white/5 text-foreground border-white/10",
  };

  return (
    <div className={`glass inline-flex items-center justify-center p-3 rounded-xl border ${variantStyles[variant]} ${className}`}>
      <Icon size={size} aria-hidden />
    </div>
  );
}
