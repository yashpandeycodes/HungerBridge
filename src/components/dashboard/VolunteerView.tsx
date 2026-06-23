"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Navigation, CheckCircle2, Award, Bike, Loader2 } from "lucide-react";
import { DonationType } from "./NgoView"; // Puraana type reuse kar rahe hain

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
        toast.success("🎉 Mission Completed! You earned 50 Karma Points.");
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      {/* Gamification Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-amber-500 border-none text-white shadow-lg">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Award className="text-yellow-300" size={32} /> Volunteer Hub
            </h2>
            <p className="text-orange-100 mt-2 text-lg">Help NGOs deliver food to those in need. Earn Karma points!</p>
          </div>
          <div className="bg-white/20 p-4 rounded-xl text-center backdrop-blur-sm border border-white/30">
            <p className="text-sm font-medium text-orange-100 uppercase tracking-wider">Your Impact</p>
            <p className="text-3xl font-bold">12 Deliveries</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Bike className="text-amber-500" /> Active Rescue Missions
        </h3>

        {isLoading ? (
          <div className="flex justify-center p-12 border-2 border-dashed rounded-xl bg-slate-50">
            <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed rounded-xl bg-slate-50 text-slate-500">
            No active missions right now. Relax, hero! 🦸‍♂️
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {missions.map((mission) => (
              <Card key={mission._id} className="border-l-4 border-l-amber-500 hover:shadow-md transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{mission.foodCategory}</h4>
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded">
                        {mission.quantity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-slate-400 shrink-0 mt-0.5" size={16} />
                      <p><span className="font-semibold text-slate-700">Pickup:</span> {mission.pickupLocation}</p>
                    </div>

                    <div className="flex items-start gap-2">
                      <Navigation className="text-amber-500 shrink-0 mt-0.5" size={16} />
                      <p><span className="font-semibold text-slate-700">Dropoff:</span> NGO Base Camp</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => completeMission(mission._id)}
                    disabled={isAccepting === mission._id}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    {isAccepting === mission._id ? (
                      "Completing..."
                    ) : (
                      <>
                        <CheckCircle2 size={16} className="mr-2 text-emerald-400" /> Mark as Delivered
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