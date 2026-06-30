"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, Variants } from "framer-motion";
import { Zap, Megaphone,Pencil } from "lucide-react";

const wordReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const wordItem: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

export function AIFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  const headingText = "Automation that saves time and food";
  const words = headingText.split(" ");

  return (
    <section
      className="w-full py-20 px-4 md:px-6 bg-[hsl(var(--muted))]"
      ref={sectionRef}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <motion.p
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3"
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4 }}
          >
            AI-Powered
          </motion.p>

          {prefersReducedMotion ? (
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] tracking-tight">
              {headingText}
            </h2>
          ) : (
            <motion.h2
              className="text-3xl font-bold text-[hsl(var(--foreground))] tracking-tight flex flex-wrap gap-x-[0.3em]"
              variants={wordReveal}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {words.map((word, i) => (
                <motion.span key={i} variants={wordItem} className="inline-block">
                  {word}
                </motion.span>
              ))}
            </motion.h2>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="flex gap-5"
            variants={prefersReducedMotion ? undefined : slideFromLeft}
            initial={prefersReducedMotion ? undefined : "hidden"}
            animate={isInView && !prefersReducedMotion ? "visible" : undefined}
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[hsl(var(--foreground))] text-lg mb-2">
                AI Food Vision Analysis
              </h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                Donors upload a food photo and our Gemini Vision model
                automatically identifies the food type, estimates the quantity,
                and suggests the best category — turning a 3-minute form into a
                10-second submission.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex gap-5"
            variants={prefersReducedMotion ? undefined : slideFromRight}
            initial={prefersReducedMotion ? undefined : "hidden"}
            animate={isInView && !prefersReducedMotion ? "visible" : undefined}
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[hsl(var(--foreground))] text-lg mb-2">
                AI Campaign Assistant
              </h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                NGOs can generate high-conversion social media appeals and donor
                outreach messages in seconds. Paste food details, click generate
                — get a ready-to-publish campaign description with hashtags and
                call to action.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
