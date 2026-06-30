"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeartHandshake } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

function FloatingParticles() {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 4,
      driftX: (Math.random() - 0.5) * 60,
      driftY: (Math.random() - 0.5) * 40,
    }));
     queueMicrotask(() => setParticles(items))
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, rgba(99,102,241,0.25), rgba(56,189,248,0.1))",
          }}
          animate={{
            x: [0, p.driftX, -p.driftX / 2, 0],
            y: [0, p.driftY, -p.driftY / 2, 0],
            opacity: [0.2, 0.5, 0.3, 0.2],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="w-full py-28 px-4 md:px-6 text-center relative overflow-hidden"
      ref={sectionRef}
    >
      <FloatingParticles />

      <motion.div
        className="max-w-3xl mx-auto space-y-8 relative z-10"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Icon with pulsing glow */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          {/* Pulsing glow ring */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)",
              }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 relative z-10">
            <HeartHandshake className="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
          The food exists. The need exists.
          <br />
          <span className="brand-gradient-text">Be the bridge.</span>
        </h2>
        <p className="text-[hsl(var(--muted-foreground))] text-lg font-medium max-w-xl mx-auto">
          Join thousands of donors, NGOs, and volunteers working together to
          eliminate food waste and feed communities — one delivery at a time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/sign-up">
            <Button className="brand-gradient hover:brightness-110 text-white font-bold px-8 h-12 rounded-xl brand-shadow-lg border-0 text-base transition-all">
              Join HungerBridge Free
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              variant="outline"
              className="font-semibold px-8 h-12 rounded-xl border-[hsl(var(--border))] text-base"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
