"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import DonorView from "@/components/dashboard/DonorView";
import NgoView from "@/components/dashboard/NgoView";
import VolunteerView from "@/components/dashboard/VolunteerView"; 

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 dark:border-orange-500/10 border-t-orange-600 dark:border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-rose-500/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  if (!session || !session.user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] p-4 md:p-8 lg:p-12 relative overflow-hidden transition-colors duration-500">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-600/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Premium Header Card */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-500">{session.user.name}</span>
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Active Role:
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 shadow-[0_0_10px_rgba(234,88,12,0.1)] dark:shadow-[0_0_15px_rgba(234,88,12,0.15)]">
                {session.user.role}
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="mt-6 md:mt-0 relative z-10 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:border-red-500/30 transition-all rounded-xl h-12 px-6 font-semibold"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
          >
            Log Out
          </Button>
        </div>

        {/* Dynamic Role-Based Content Area */}
        <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl p-6 md:p-8 lg:p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 min-h-[500px] relative overflow-hidden">
          
          {/* Subtle inner grid pattern for premium feel */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] dark:opacity-[0.03] pointer-events-none" />
          
          <div className="relative z-10 w-full">
            {session.user.role === "DONOR" && <DonorView />}
            {session.user.role === "NGO" && <NgoView />}
            {session.user.role === "VOLUNTEER" && <VolunteerView />}
          </div>
        </div>

      </div>
    </div>
  );
}