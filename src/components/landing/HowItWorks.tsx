"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  HeartHandshake,
  Megaphone,
  Truck,
  CheckCircle,
} from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Donor Lists Food",
    description:
      "Upload a photo — our AI identifies food type, estimates quantity, and fills the form automatically.",
    icon: <HeartHandshake className="w-5 h-5" />,
  },
  {
    step: "02",
    title: "NGO Claims Donation",
    description:
      "Verified NGOs and food banks browse live listings and claim donations that match their campaign needs.",
    icon: <Megaphone className="w-5 h-5" />,
  },
  {
    step: "03",
    title: "Volunteer Picks Up",
    description:
      "A matched volunteer accepts the mission, picks up from the donor, and updates delivery status in real time.",
    icon: <Truck className="w-5 h-5" />,
  },
  {
    step: "04",
    title: "NGO Confirms Delivery",
    description:
      "The NGO marks delivery received. The volunteer earns karma points. The donor gets an impact certificate.",
    icon: <CheckCircle className="w-5 h-5" />,
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 60%"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="how-it-works"
      className="w-full py-24 px-4 md:px-6 bg-[hsl(var(--muted))] mt-28"
      ref={sectionRef}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-16 text-center md:text-left"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">
            The Process
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">
            From surplus to served, in four steps
          </h2>
        </motion.div>

        {/* Progress connector line — hidden on mobile */}
        {!prefersReducedMotion && (
          <div className="hidden md:block relative h-1 bg-[hsl(var(--border))] rounded-full mb-10 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: progressWidth,
                background: "linear-gradient(90deg, #6366f1, #3b82f6)",
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              className="relative pl-8 pr-6 py-8 border-l border-[hsl(var(--border))] first:border-l-0 md:first:border-l group cursor-default"
              custom={i}
              variants={prefersReducedMotion ? undefined : cardVariants}
              initial={prefersReducedMotion ? undefined : "hidden"}
              animate={isInView && !prefersReducedMotion ? "visible" : undefined}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: -4,
                      transition: { duration: 0.25 },
                    }
              }
              style={
                prefersReducedMotion
                  ? undefined
                  : {
                      boxShadow: "0 0 0 0 rgba(99,102,241,0)",
                    }
              }
            >
              <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                {item.step}
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 transition-shadow group-hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                {item.icon}
              </div>
              <h3 className="font-bold text-[hsl(var(--foreground))] text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
