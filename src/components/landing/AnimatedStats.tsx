"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";

interface AnimatedStatsProps {
  totalMealsServed: number;
  totalFoodRescuedKg: number;
  activeCampaigns: number;
  volunteerHours: number;
}

function CountUp({
  target,
  suffix,
  duration = 2,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    if (prefersReducedMotion) {
      queueMicrotask(() => setDisplay(target.toLocaleString()));
      return;
    }

    const controls = animate(0, target, {
      duration,
      ease: [0.25, 0.4, 0.25, 1],
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString()),
    });

    return () => controls.stop();
  }, [isInView, target, duration, prefersReducedMotion]);

  return (
    <span ref={ref}>
      {display}
      {suffix && (
        <span className="text-lg font-bold text-sky-500 ml-1">{suffix}</span>
      )}
    </span>
  );
}

export function AnimatedStats(props: AnimatedStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  const stats = [
    { key: "meals", value: props.totalMealsServed, label: "Meals Served" },
    {
      key: "rescued",
      value: props.totalFoodRescuedKg,
      label: "Food Rescued",
      suffix: "kg",
    },
    {
      key: "campaigns",
      value: props.activeCampaigns,
      label: "Active Campaigns",
    },
    {
      key: "hours",
      value: props.volunteerHours,
      label: "Volunteer Hours",
    },
  ];

  return (
    <div className="w-full max-w-5xl mt-28 relative z-10" ref={containerRef}>
      <motion.div
        className="flex flex-col items-center mb-10"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Real-time Metrics
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))]">
          Live Impact Dashboard
        </h2>
      </motion.div>

      <motion.div
        className="glass-panel brand-shadow-lg rounded-2xl p-8"
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[hsl(var(--border))]">
          {stats.map((stat, i) => (
            <div key={stat.key} className={i === 0 ? "px-2 first:pl-0" : "px-4"}>
              <div className="text-4xl font-black text-[hsl(var(--foreground))] tabular-nums">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 font-semibold uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
