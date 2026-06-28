import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import DonorView from "@/components/dashboard/DonorView";
import NgoView from "@/components/dashboard/NgoView";
import VolunteerView from "@/components/dashboard/VolunteerView"; 
import LogoutButton from "@/components/dashboard/LogoutButton";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] p-4 md:p-8 lg:p-12 relative overflow-hidden transition-colors duration-500">
      
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-600/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
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

          <LogoutButton />
        </div>

        <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl p-6 md:p-8 lg:p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 min-h-[500px] relative overflow-hidden">
          
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