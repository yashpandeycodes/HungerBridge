"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <header className="px-6 lg:px-14 h-16 flex items-center justify-between border-b bg-white shadow-sm">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-2xl text-orange-600 tracking-tight">HungerBridge</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6 items-center">
          <Link href="/sign-in">
            <Button variant="ghost" className="font-semibold">Log In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">Join the Cause</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 py-12 md:py-24 lg:py-32">
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900">
            Rescue Food. <span className="text-orange-600">Fight Hunger.</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl leading-relaxed">
            A community-driven platform connecting food donors, NGOs, and volunteers. Don`t let surplus food go to waste when it can feed a community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white text-lg px-8">
                Donate Food Now
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-orange-200 text-orange-700 hover:bg-orange-50">
                Register as NGO / Volunteer
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Impact Dashboard */}
        <div className="w-full max-w-6xl mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Live Impact Dashboard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            <Card className="border-none shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase">Meals Served</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-emerald-600">
                  {loading ? "..." : stats.totalMealsServed}
                </div>
                <p className="text-xs text-slate-500 mt-1">Across our network</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase">Food Rescued (kg)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-orange-600">
                  {loading ? "..." : stats.totalFoodRescuedKg}
                </div>
                <p className="text-xs text-slate-500 mt-1">Diverted from landfills</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">
                  {loading ? "..." : stats.activeCampaigns}
                </div>
                <p className="text-xs text-slate-500 mt-1">Needing immediate support</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase">Volunteer Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">
                  {loading ? "..." : stats.volunteerHours}
                </div>
                <p className="text-xs text-slate-500 mt-1">Logged by our heroes</p>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white flex flex-col md:flex-row justify-between text-center md:text-left">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} HungerBridge. Built for the Hackathon.
        </p>
        <div className="flex gap-4 mt-4 md:mt-0 justify-center">
          <span className="text-sm text-slate-500 hover:text-orange-600 cursor-pointer">Terms of Service</span>
          <span className="text-sm text-slate-500 hover:text-orange-600 cursor-pointer">Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}