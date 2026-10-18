"use client";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "violet";
  className?: string;
}

export function AnimatedButton({ children, variant = "primary", className = "", ...props }: AnimatedButtonProps) {
  const variants = {
    primary: "bg-[#ff9f43] text-[#1a1205] font-semibold shadow-lg shadow-amber-500/10 hover:bg-[#ffb065]",
    ghost: "bg-white/5 text-foreground border border-white/10 hover:bg-white/10 hover:border-white/20",
    violet: "bg-[#7c3aed] text-white font-semibold shadow-lg shadow-violet-500/20 hover:bg-[#8b5cf6]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
