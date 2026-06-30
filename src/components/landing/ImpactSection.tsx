"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface ImpactSectionProps {
  totalMealsServed: number;
  totalFoodRescuedKg: number;
  activeCampaigns: number;
  volunteerHours: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

export function ImpactSection(props: ImpactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  const stats = [
    {
      value: props.totalMealsServed.toLocaleString(),
      label: "Meals Served",
      suffix: "",
    },
    {
      value: props.totalFoodRescuedKg.toLocaleString(),
      label: "Kilograms Rescued",
      suffix: "kg",
    },
    {
      value: props.activeCampaigns.toString(),
      label: "Active Campaigns",
      suffix: "",
    },
    {
      value: props.volunteerHours.toString(),
      label: "Volunteer Hours",
      suffix: "",
    },
  ];

  return (
    <section
      id="impact"
      className="w-full py-24 px-4 md:px-6 bg-[hsl(222,47%,5%)] dark:bg-[hsl(222,47%,4%)] text-center"
      ref={sectionRef}
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Our Impact
        </motion.p>
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-16 tracking-tight"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Every number is a meal. Every meal is a life.
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="space-y-2"
              custom={i}
              variants={prefersReducedMotion ? undefined : fadeUp}
              initial={prefersReducedMotion ? undefined : "hidden"}
              animate={
                isInView && !prefersReducedMotion ? "visible" : undefined
              }
            >
              <div className="text-5xl md:text-6xl font-black text-white tabular-nums">
                {stat.value}
                {stat.suffix && (
                  <span className="text-2xl font-bold text-sky-400 ml-1">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
