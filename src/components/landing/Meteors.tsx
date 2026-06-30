"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface MeteorProps {
  count?: number;
}

export function Meteors({ count = 20 }: MeteorProps) {
  const prefersReducedMotion = useReducedMotion();
  const [meteors, setMeteors] = useState<
    { id: number; x: number; delay: number; duration: number; size: number; repeatDelay: number }[]
  >([]);

  useEffect(() => {
    const items = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 1.5 + Math.random() * 2.5,
      size: 80 + Math.random() * 120,
      repeatDelay: Math.random() * 8 + 4,
    }));
     queueMicrotask(() => setMeteors(items))
  }, [count]);

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {meteors.map((meteor) => (
        <motion.div
          key={meteor.id}
          className="absolute"
          style={{
            left: `${meteor.x}%`,
            top: "-10%",
            width: `${meteor.size}px`,
            height: "1px",
            transform: "rotate(-35deg)",
            transformOrigin: "left center",
          }}
          initial={{ y: -100, opacity: 0 }}
          animate={{
            y: ["-10vh", "120vh"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: meteor.duration,
            delay: meteor.delay,
            repeat: Infinity,
            repeatDelay: meteor.repeatDelay,
            ease: "linear",
          }}
        >
          {/* Meteor head */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full"
            style={{
              background: "linear-gradient(135deg, #818cf8, #38bdf8)",
              boxShadow:
                "0 0 6px 2px rgba(129,140,248,0.6), 0 0 20px 4px rgba(56,189,248,0.3)",
            }}
          />
          {/* Meteor tail */}
          <div
            className="absolute right-0 top-0 h-full"
            style={{
              width: "100%",
              background:
                "linear-gradient(to left, rgba(129,140,248,0.6), rgba(56,189,248,0.2), transparent)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
