import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeartHandshake } from "lucide-react";

import { Meteors } from "@/components/landing/Meteors";
import { HeroContent } from "@/components/landing/HeroContent";
import { AnimatedStats } from "@/components/landing/AnimatedStats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ImpactSection } from "@/components/landing/ImpactSection";
import { RoleCards } from "@/components/landing/RoleCards";
import { AIFeatures } from "@/components/landing/AIFeatures";
import { FinalCTA } from "@/components/landing/FinalCTA";

export async function getImpactStats() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/impact`);
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return json.success
      ? json.data
      : { totalDonations: 0, completedDeliveries: 0, activeCampaigns: 0, totalMealsServed: 0, totalFoodRescuedKg: 0, volunteerHours: 0 };
  } catch {
    return { totalDonations: 0, completedDeliveries: 0, activeCampaigns: 0, totalMealsServed: 0, totalFoodRescuedKg: 0, volunteerHours: 0 };
  }
}

export default async function Home() {
  const stats = await getImpactStats();

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] transition-colors duration-500 text-[hsl(var(--foreground))]">
      <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-14 h-16 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95">
        <Link className="flex items-center gap-2.5 shrink-0" href="/">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center brand-shadow shrink-0">
            <HeartHandshake className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl text-[hsl(var(--foreground))] tracking-tight">
            HungerBridge
          </span>
        </Link>
        <nav className="flex gap-2 sm:gap-6 items-center shrink-0">
          <Link href="#how-it-works" className="hidden lg:block text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            How It Works
          </Link>
          <Link href="#impact" className="hidden lg:block text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            Impact
          </Link>
          <Link href="#roles" className="hidden lg:block text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            Who We Serve
          </Link>
          <ThemeToggle />
          <Link href="/sign-in">
            <Button variant="ghost" className="font-semibold rounded-lg text-sm sm:text-base px-2 sm:px-4">
              Log In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="brand-gradient hover:brightness-110 text-white border-0 brand-shadow rounded-lg px-3 sm:px-4 text-sm sm:text-base transition-all">
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">Join the Cause</span>
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center text-center px-4 md:px-6 py-20 md:py-28 relative overflow-hidden grain-bg">
        {/* Single radial glow — the ONLY decorative glow on this entire page */}
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.16),_transparent_70%)] pointer-events-none" />

        {/* Meteors falling animation */}
        <Meteors count={20} />

        {/* Animated hero content */}
        <HeroContent />

        {/* Animated stats panel with counting numbers */}
        <AnimatedStats
          totalMealsServed={stats.totalMealsServed}
          totalFoodRescuedKg={stats.totalFoodRescuedKg}
          activeCampaigns={stats.activeCampaigns}
          volunteerHours={stats.volunteerHours}
        />

        {/* How It Works — scroll-animated cards with progress connector */}
        <HowItWorks />

        {/* Impact section — animated stat reveals */}
        <ImpactSection
          totalMealsServed={stats.totalMealsServed}
          totalFoodRescuedKg={stats.totalFoodRescuedKg}
          activeCampaigns={stats.activeCampaigns}
          volunteerHours={stats.volunteerHours}
        />

        {/* Who We Serve — 3D tilt + spotlight cards */}
        <RoleCards />

        {/* AI Features — text reveal + slide-in */}
        <AIFeatures />

        {/* Final CTA — pulsing glow + floating particles */}
        <FinalCTA />
      </main>

      <footer className="py-8 w-full shrink-0 px-6 md:px-14 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          © {new Date().getFullYear()} HungerBridge.
        </p>
        <div className="flex gap-6 justify-center">
          <span className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-indigo-500 cursor-pointer transition-colors">Terms of Service</span>
          <span className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-indigo-500 cursor-pointer transition-colors">Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}