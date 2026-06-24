"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    completedDeliveries: 0,
    activeCampaigns: 0,
    totalMealsServed: 0,
    totalFoodRescuedKg: 0,
    volunteerHours: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/impact");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 text-slate-900 dark:text-slate-100">
      
      {/* Premium Glassmorphism Navbar */}
     

        <header className="sticky top-0 z-50 px-6 lg:px-14 h-16 flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 bg-white/75 dark:bg-black/55 backdrop-blur-2xl shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-500">
        <Link className="flex items-center justify-center group" href="/">
       
         <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-linear-to-r from-orange-600 via-rose-500 to-orange-500 tracking-tight group-hover:scale-105 transition-all duration-300">
            HungerBridge
          </span>
        </Link>
        <nav className="flex gap-4 sm:gap-6 items-center">
          <ThemeToggle />
          <Link href="/sign-in">
           <Button
           variant="ghost"
          className="font-semibold   rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/10 transition-all duration-300"
>
              Log In
            </Button>
          </Link>
          <Link href="/sign-up">
           

          <Button className="bg-linear-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white shadow-xl shadow-orange-500/20 border-0 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/40 rounded-xl">
              Join the Cause
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section with Glowing Effects */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 py-20 md:py-32 relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-orange-500/20 dark:bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      
         <div className="absolute bottom-0 right-20 w-[350px] h-[350px] bg-rose-500/10 dark:bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="space-y-8 max-w-4xl relative z-10">
         

          <h1 className="text-5xl font-extrabold tracking-[-0.04em] leading-[0.95] sm:text-6xl md:text-7xl text-slate-900 dark:text-white drop-shadow-sm">
            Rescue Food. <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-500 via-rose-500 to-orange-500 animate-gradient-x">
              Fight Hunger.
            </span>
          </h1>
         

<p className="mx-auto max-w-[700px] text-slate-600 dark:text-slate-400 md:text-xl leading-8 font-medium">
            A community-driven platform connecting food donors, NGOs, and volunteers. Don`t let surplus food go to waste when it can feed a community.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mt-10">
            <Link href="/sign-up">
            

<Button
  size="lg"
  className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white text-lg px-10 py-6 rounded-full shadow-2xl shadow-orange-500/20 transition-all duration-300 hover:scale-[1.03] active:scale-95 border-0"
>
                Donate Food Now
              </Button>
            </Link>
            <Link href="/sign-up">
             

<Button
  size="lg"
  variant="outline"
  className="w-full sm:w-auto text-lg px-10 py-6 rounded-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] active:scale-95"
>
                Register as NGO / Volunteer
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Impact Dashboard */}
        <div className="w-full max-w-6xl mt-32 relative z-10">
          <div className="flex flex-col items-center mb-12">
           

<div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-semibold tracking-wide uppercase mb-4 shadow-md shadow-orange-500/10">
              Real-time Metrics
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Live Impact Dashboard</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
          

<Card className="relative overflow-hidden border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/5 backdrop-blur-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meals Served</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {loading ? "..." : stats.totalMealsServed}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Across our network</p>
              </CardContent>
            </Card>

           
             
           

<Card className="relative overflow-hidden border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/5 backdrop-blur-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Food Rescued</CardTitle>
              </CardHeader>
              <CardContent>

             <div className="text-5xl font-black tracking-tight tabular-nums text-orange-600 dark:text-orange-400">
            {loading ? "..." : stats.totalFoodRescuedKg}
             <div className="h-1" />
            <span className="text-lg font-bold text-orange-600/60 dark:text-orange-400/60">
            kg / servings
          </span>
           </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Diverted from landfills</p>
              </CardContent>
            </Card>


<Card className="relative overflow-hidden border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/5 backdrop-blur-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                  {loading ? "..." : stats.activeCampaigns}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Needing immediate support</p>
              </CardContent>
            </Card>

           

<Card className="relative overflow-hidden border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/5 backdrop-blur-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Volunteer Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {loading ? "..." : stats.volunteerHours}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Logged by our heroes</p>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* Footer */}

<footer className="py-8 w-full shrink-0 items-center px-6 md:px-14 border-t border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl flex flex-col md:flex-row justify-between text-center md:text-left transition-colors duration-500">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} HungerBridge. Built for the Hackathon.
        </p>
        <div className="flex gap-6 mt-4 md:mt-0 justify-center">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors">Terms of Service</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors">Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}