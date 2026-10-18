"use client";
import { motion } from "framer-motion";

export function AudioEqualizerLoader({ className = "" }: { className?: string }) {
  const bars = [0.4, 0.8, 0.6, 1.0, 0.5];
  return (
    <div className={`flex items-end gap-1 h-6 ${className}`} aria-label="Audio playing indicator" role="img">
      {bars.map((scaleY, i) => (
        <motion.div
          key={i}
          animate={{ scaleY: [0.3, scaleY, 0.3] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className="w-1 bg-[#ff9f43] rounded-full origin-bottom"
          style={{ height: "100%" }}
        />
      ))}
    </div>
  );
}
