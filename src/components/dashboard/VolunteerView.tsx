"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Navigation, CheckCircle2, Award, Bike, Loader2, Sparkles } from "lucide-react";
import { DonationType } from "./NgoView"; 

export default function VolunteerView() {
  const [missions, setMissions] = useState<DonationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await fetch("/api/volunteer");
        const json = await res.json();
        if (json.success) setMissions(json.data);
      } catch (error) {
        toast.error("Failed to load missions.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMissions();
  }, []);

  const completeMission = async (donationId: string) => {
    setIsAccepting(donationId);
    try {
      const res = await fetch("/api/volunteer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success("Mission Completed! You earned 50 Karma Points. 🏆");
        setMissions((prev) => prev.filter((m) => m._id !== donationId));
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsAccepting(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto relative z-10 w-full">
      
      {/* Background Ambience specific to Volunteer */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      {/* Premium Hero Card */}
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white rounded-3xl group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
        
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black flex items-center justify-center md:justify-start gap-3 tracking-tight">
              <Award className="text-yellow-300 drop-shadow-md" size={36} /> 
              Volunteer Hub
            </h2>
            <p className="text-orange-100/90 text-lg md:text-xl font-medium max-w-lg">
              Help NGOs deliver food to those in need. Become a hero and earn Karma points!
            </p>
          </div>
          
          <div className="bg-white/10 dark:bg-black/20 p-6 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner min-w-[200px] text-center shrink-0 hover:bg-white/20 transition-colors duration-300">
            <p className="text-sm font-bold text-orange-100 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-yellow-300" /> Your Impact
            </p>
            <p className="text-4xl font-black text-white drop-shadow-sm">12</p>
            <p className="text-xs font-medium text-orange-200 mt-1 uppercase tracking-wider">Deliveries</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-2">
          <div className="relative flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <Bike className="relative z-10 text-amber-600 dark:text-amber-500" size={20} />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Active Rescue Missions
          </h3>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-5 border border-slate-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-amber-200 dark:border-amber-500/20 border-t-amber-600 dark:border-t-amber-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Locating nearby missions...</p>
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center p-16 border border-slate-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-2">
              <Award className="text-amber-500 w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200">No active missions right now</h4>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Relax, hero! The city is well fed at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {missions.map((mission) => (
              <Card 
                key={mission._id} 
                className="border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl shadow-md hover:shadow-xl dark:hover:border-amber-500/50 transition-all duration-300 group rounded-2xl relative overflow-hidden"
              >
                {/* Status Indicator Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500" />
                
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <CardContent className="p-6 pl-8 space-y-5 relative z-10">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-xl text-slate-900 dark:text-white capitalize tracking-tight leading-tight">
                        {mission.foodCategory}
                      </h4>
                      <div className="inline-flex items-center px-3 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-500/20 shadow-sm">
                        Quantity: {mission.quantity}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 bg-white dark:bg-black p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-white/10 shrink-0">
                        <MapPin className="text-slate-500 dark:text-slate-400" size={14} />
                      </div>
                      <p className="leading-relaxed"><span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Pickup</span> {mission.pickupLocation}</p>
                    </div>

                    {/* Dotted line connector visually */}
                    <div className="w-0.5 h-4 border-l-2 border-dashed border-slate-300 dark:border-slate-700 ml-4 my-0.5" />

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 bg-white dark:bg-black p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-white/10 shrink-0">
                        <Navigation className="text-amber-500 dark:text-amber-400" size={14} />
                      </div>
                      <p className="leading-relaxed"><span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Dropoff</span> NGO Base Camp</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => completeMission(mission._id)}
                    disabled={isAccepting === mission._id}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white font-bold text-base rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isAccepting === mission._id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Completing...
                      </span>
                    ) : (
                      <>
                        <CheckCircle2 size={18} className="mr-2 text-emerald-400 dark:text-emerald-600" /> Mark as Delivered
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}