"use client";
import { motion } from "framer-motion";

export function LoadingSpinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`rounded-full border-2 border-white/10 border-t-[#ff9f43] ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
