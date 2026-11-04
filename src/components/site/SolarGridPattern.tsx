"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function SolarGridPattern({ dark = false }: { dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-28, 28]);
  return <motion.div ref={ref} aria-hidden className={`solar-grid-pattern ${dark ? "solar-grid-pattern-dark" : ""}`} style={{ y: reducedMotion ? 0 : y }} />;
}
