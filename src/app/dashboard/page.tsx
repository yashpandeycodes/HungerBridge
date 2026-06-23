"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!session || !session.user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {session.user.name} 
            </h1>
            <p className="text-slate-500 mt-1">
              You are logged in as a <span className="font-semibold text-orange-600">{session.user.role}</span>
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 md:mt-0 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
          >
            Log Out
          </Button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
          {session.user.role === "DONOR" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Donor Dashboard</h2>
              <p>Yahan hum AI Food Upload ka form banayenge.</p>
            </div>
          )}

          {session.user.role === "NGO" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">NGO Dashboard</h2>
              <p>Yahan hum AI Campaign Assistant banayenge.</p>
            </div>
          )}

          {session.user.role === "VOLUNTEER" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Volunteer Dashboard</h2>
              <p>.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}