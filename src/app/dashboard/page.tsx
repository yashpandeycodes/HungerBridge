import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import DonorView from "@/components/dashboard/DonorView";
import NgoView from "@/components/dashboard/NgoView";
import VolunteerView from "@/components/dashboard/VolunteerView";
import LogoutButton from "@/components/dashboard/LogoutButton";
import NotificationBell from "@/components/NotificationBell";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4 md:p-8 lg:p-12 relative">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[hsl(var(--card))] p-6 md:p-8 rounded-2xl border border-[hsl(var(--border))] relative">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
              Welcome back, <span className="brand-gradient-text">{session.user.name}</span>
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Active Role:
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                {session.user.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <NotificationBell />
            <LogoutButton />
          </div>
        </div>

        <div className="bg-[hsl(var(--card))] p-6 md:p-8 lg:p-10 rounded-2xl border border-[hsl(var(--border))] min-h-[500px] relative">
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