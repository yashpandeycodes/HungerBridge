"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export function HeroContent() {
  const prefersReducedMotion = useReducedMotion();

  const Wrapper = prefersReducedMotion ? "div" : motion.div;
  const Item = prefersReducedMotion ? "div" : motion.div;
  const H1Wrapper = prefersReducedMotion ? "div" : motion.div;
  const PWrapper = prefersReducedMotion ? "div" : motion.div;

  return (
    <Wrapper
      className="space-y-8 max-w-4xl relative z-10"
      {...(!prefersReducedMotion && {
        variants: container,
        initial: "hidden",
        animate: "show",
      })}
    >
      <H1Wrapper {...(!prefersReducedMotion && { variants: fadeUp })}>
        <h1 className="text-5xl font-extrabold tracking-[-0.04em] leading-[0.95] sm:text-6xl md:text-7xl text-[hsl(var(--foreground))]">
          Rescue Food. <br className="hidden sm:block" />
          <span className="brand-gradient-text">Fight Hunger.</span>
        </h1>
      </H1Wrapper>

      <PWrapper {...(!prefersReducedMotion && { variants: fadeUp })}>
        <p className="mx-auto max-w-[700px] text-[hsl(var(--muted-foreground))] md:text-xl leading-8 font-medium">
          A community-driven platform connecting food donors, NGOs, and
          volunteers. Don&apos;t let surplus food go to waste when it can feed a
          community.
        </p>
      </PWrapper>

      <Item
        className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
        {...(!prefersReducedMotion && { variants: fadeUp })}
      >
        <Link href="/sign-up">
          <Button
            size="lg"
            className="w-full sm:w-auto brand-gradient hover:brightness-110 text-white text-lg px-10 py-6 rounded-xl brand-shadow-lg border-0 transition-all"
          >
            Donate Food Now
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto text-lg px-10 py-6 rounded-xl border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all"
          >
            Register as NGO / Volunteer
          </Button>
        </Link>
      </Item>
    </Wrapper>
  );
}
