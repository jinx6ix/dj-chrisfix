"use client";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  className?: string;
}

export function GlassCard({ children, hoverEffect = true, className = "", ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, borderColor: "rgba(255, 159, 67, 0.4)" } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`glass relative overflow-hidden p-6 ${hoverEffect ? "card-hover cursor-pointer" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
