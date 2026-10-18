"use client";
import { motion, useReducedMotion } from "framer-motion";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
