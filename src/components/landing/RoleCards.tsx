"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  HeartHandshake,
  Megaphone,
  Users,
  CheckCircle,
} from "lucide-react";

interface RoleCard {
  role: string;
  icon: ReactNode;
  tagline: string;
  features: string[];
  cta: string;
  colorClass: string;
  featured?: boolean;
}

const roleData: RoleCard[] = [
  {
    role: "Donor",
    icon: <HeartHandshake className="w-6 h-6" />,
    tagline: "Turn surplus into sustenance",
    features: [
      "AI-powered food photo analysis",
      "Automatic urgency detection",
      "Donation lifecycle tracking",
      "Downloadable impact certificate",
      "Support specific NGO campaigns",
    ],
    cta: "Start Donating",
    colorClass:
      "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
  },
  {
    role: "NGO / Food Bank",
    icon: <Megaphone className="w-6 h-6" />,
    tagline: "Coordinate relief at scale",
    features: [
      "Browse and claim live donations",
      "AI-generated campaign descriptions",
      "Volunteer assignment dashboard",
      "Real-time delivery tracking",
      "Beneficiary impact reporting",
    ],
    cta: "Register Your NGO",
    colorClass:
      "bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400",
    featured: true,
  },
  {
    role: "Volunteer",
    icon: <Users className="w-6 h-6" />,
    tagline: "Be a hero in your city",
    features: [
      "Browse available pickup missions",
      "Accept missions with one tap",
      "Earn karma and impact badges",
      "Leaderboard recognition",
      "Personal delivery history",
    ],
    cta: "Volunteer Now",
    colorClass:
      "bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400",
  },
];

function SpotlightCard({
  card,
  index,
  isInView,
}: {
  card: RoleCard;
  index: number;
  isInView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-2xl border p-8 flex flex-col gap-6 overflow-hidden ${
        card.featured
          ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/20"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      }`}
      custom={index}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
      animate={
        isInView && !prefersReducedMotion ? { opacity: 1, y: 0 } : {}
      }
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        !prefersReducedMotion && isHovered
          ? {
              transform: `perspective(800px) rotateY(${
                (spotlight.x - 150) * 0.015
              }deg) rotateX(${(spotlight.y - 200) * -0.01}deg)`,
              transition: "transform 0.15s ease-out",
            }
          : {
              transform: "perspective(800px) rotateY(0deg) rotateX(0deg)",
              transition: "transform 0.4s ease-out",
            }
      }
    >
      {/* Spotlight glow that follows cursor */}
      {isHovered && !prefersReducedMotion && (
        <div
          className="absolute pointer-events-none inset-0 z-0"
          style={{
            background: `radial-gradient(300px circle at ${spotlight.x}px ${spotlight.y}px, rgba(99,102,241,0.12), transparent 60%)`,
          }}
        />
      )}

      {card.featured && (
        <div className="absolute top-0.5 left-2 z-10">
          <span className="brand-gradient text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Most Active
          </span>
        </div>
      )}
      <div className="relative z-10">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${card.colorClass}`}
        >
          {card.icon}
        </div>
        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">
          {card.role}
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 font-medium">
          {card.tagline}
        </p>
      </div>

      <ul className="space-y-3 flex-1 relative z-10">
        {card.features.map((f, fi) => (
          <li
            key={fi}
            className="flex items-center gap-3 text-sm text-[hsl(var(--foreground))]"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Link href="/sign-up" className="relative z-10">
        <Button
          className={`w-full font-bold rounded-lg h-10 text-sm border-0 transition-all ${
            card.featured
              ? "brand-gradient hover:brightness-110 text-white brand-shadow"
              : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))]"
          }`}
        >
          {card.cta}
        </Button>
      </Link>
    </motion.div>
  );
}

export function RoleCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="roles" className="w-full py-24 px-4 md:px-6" ref={sectionRef}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-16 text-center md:text-left"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">
            Who We Serve
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">
            Three roles, one mission
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roleData.map((card, i) => (
            <SpotlightCard
              key={card.role}
              card={card}
              index={i}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
