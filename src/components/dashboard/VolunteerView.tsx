"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, CheckCircle2, Award, Bike, Loader2, Sparkles, Trophy, Star, History, Flame,Clock } from "lucide-react";
import { DonationType } from "./NgoView"; 
import useIdleTimeout from "@/hooks/useIdleTimeout";
import { calculateDistance } from "@/lib/geocode";

interface MissionType extends DonationType {
  distance?: number;
}

export interface LeaderboardEntry {
  _id: string;
  name: string;
  karma: number;
  deliveries: number;
  badge: string;
  isCurrentUser: boolean;
}

export default function VolunteerView() {
    useIdleTimeout(15);
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [history, setHistory] = useState<DonationType[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const [stats, setStats] = useState({ karma: 0, deliveries: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async (lat?: number, lng?: number) => {
      try {
        const res = await fetch("/api/volunteer");
        const json = await res.json();
        if (json.success) {
          let loadedMissions: MissionType[] = json.data;
          
          if (lat && lng) {
            loadedMissions = loadedMissions.map((m) => {
              if (m.coordinates && m.coordinates.lat && m.coordinates.lng) {
                return { ...m, distance: calculateDistance(lat, lng, m.coordinates.lat, m.coordinates.lng) };
              }
              return { ...m, distance: Infinity };
            }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
          }
          
          setMissions(loadedMissions);
        }

        const statsRes = await fetch("/api/volunteer/stats");
        const statsJson = await statsRes.json();
        if (statsJson.success) {
          setStats(statsJson.data); 
        }

        // Try to fetch history (if backend endpoint doesn't exist it will silently fail)
        try {
          const histRes = await fetch("/api/volunteer/history");
          const histJson = await histRes.json();
          if (histJson.success) setHistory(histJson.data);
        } catch (e) {
          console.log("No history endpoint found, relying on local session history.");
        }

        try {
          const lbRes = await fetch("/api/volunteer/leaderboard");
          const lbJson = await lbRes.json();
          if (lbJson.success) setLeaderboard(lbJson.data);
        } catch (e) {
          console.error("Failed to fetch leaderboard", e);
        } finally {
          setIsLeaderboardLoading(false);
        }

      } catch (error) {
        toast.error("Failed to load missions.");
      } finally {
        setIsLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          fetchMissions(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied or error, falling back to unsorted list.");
          fetchMissions();
        }
      );
    } else {
      fetchMissions();
    }
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
        toast.success("Mission accepted! 🚗 Head to the pickup location. Your karma will update once the NGO confirms delivery.");
        
        // Find the completed mission and move it to History
        const completedMission = missions.find((m) => m._id === donationId);
        if (completedMission) {
          setHistory((prev) => [completedMission, ...prev]);
        }
        
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full mx-auto relative z-10 block">
      
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      <Card className="relative w-full overflow-hidden border-0 shadow-xl brand-gradient text-white rounded-2xl group z-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
        
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 w-full">
          <div className="space-y-3 text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-black flex items-center justify-center md:justify-start gap-3 tracking-tight">
              <Award className="text-yellow-300 drop-shadow-md" size={36} /> 
              Volunteer Hub
            </h2>
            <p className="text-indigo-100/90 text-lg md:text-xl font-medium max-w-lg">
              Help NGOs deliver food to those in need. Become a hero and earn Karma points!
            </p>
          </div>
          
          <div className="flex gap-4 shrink-0">
            <div className="bg-white/10 dark:bg-black/40 p-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner min-w-[120px] text-center shrink-0 transition-colors duration-300">
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                <Flame size={14} className="text-red-300" /> Karma
              </p>
              <p className="text-3xl font-black text-white drop-shadow-sm">{stats.karma}</p>
            </div>
            <div className="bg-white/10 dark:bg-black/40 p-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner min-w-[120px] text-center shrink-0 transition-colors duration-300">
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                <Sparkles size={14} className="text-yellow-300" /> Impact
              </p>
              <p className="text-3xl font-black text-white drop-shadow-sm">{stats.deliveries}</p>
              <p className="text-[10px] font-medium text-indigo-200 mt-1 uppercase tracking-wider">Deliveries</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="missions" className="w-full relative z-10 block">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-14 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl p-1.5 mb-8 gap-1">
          <TabsTrigger value="missions" className="rounded-lg font-bold text-sm text-[hsl(var(--muted-foreground))] data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 py-2.5 shadow-none data-[state=active]:shadow-sm transition-all">
            <Bike className="w-4 h-4 mr-2" /> Active Missions
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="rounded-lg font-bold text-sm text-[hsl(var(--muted-foreground))] data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 py-2.5 shadow-none data-[state=active]:shadow-sm transition-all">
            <Trophy className="w-4 h-4 mr-2" /> Leaderboard
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg font-bold text-sm text-[hsl(var(--muted-foreground))] data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 py-2.5 shadow-none data-[state=active]:shadow-sm transition-all">
            <History className="w-4 h-4 mr-2" /> My Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="w-full space-y-6 animate-in fade-in duration-500 block">
          {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center p-16 space-y-5 border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--muted))]">
              <div className="relative">
                <Loader2 className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-500/20 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin text-transparent" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Locating nearby missions...</p>
            </div>
          ) : missions.length === 0 ? (
            <div className="w-full p-16 text-center border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--muted))] flex flex-col items-center justify-center space-y-4 shadow-sm">
              <div className="w-20 h-20 bg-amber-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                <Award className="text-amber-500 w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200">No active missions right now</h4>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Relax, hero! The city is well fed at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 w-full">
              {missions.map((mission) => (
                <Card 
                  key={mission._id} 
                  className="w-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 brand-gradient" />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <CardContent className="p-6 pl-8 space-y-5 relative z-10 w-full">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-xl text-slate-900 dark:text-white capitalize tracking-tight leading-tight">
                          {mission.foodCategory}
                        </h4>
                        <div className="inline-flex items-center px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-800/50 shadow-sm">
                          Quantity: {mission.quantity}
                        </div>
                      </div>
                      
                      {mission.distance !== undefined && mission.distance !== Infinity && (
                        <div className="text-right">
                          <div className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <Navigation size={12} className="mr-1" />
                            {mission.distance.toFixed(1)} km away
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                          <MapPin className="text-slate-500 dark:text-slate-400" size={14} />
                        </div>
                        <p className="leading-relaxed break-words w-full"><span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Pickup</span> {mission.pickupLocation}</p>
                      </div>

                      <div className="w-0.5 h-4 border-l-2 border-dashed border-slate-300 dark:border-slate-700 ml-4 my-0.5" />

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                          <Navigation className="text-amber-500 dark:text-amber-400" size={14} />
                        </div>
                        <p className="leading-relaxed"><span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Dropoff</span> NGO Base Camp</p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => completeMission(mission._id)}
                      disabled={isAccepting === mission._id}
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700 text-white font-bold text-base rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                      {isAccepting === mission._id ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" /> Completing...
                        </span>
                      ) : (
                        <>
                          <Bike size={18} className="mr-2" /> Accept Pickup Mission
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: LEADERBOARD */}
        <TabsContent value="leaderboard" className="w-full animate-in fade-in duration-500 block">
          <Card className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-amber-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 pb-6">
              <CardTitle className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                <Trophy className="text-amber-500" /> City Top Heroes
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                Volunteers with the highest karma points this month. Keep delivering to rise up!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLeaderboardLoading ? (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
                  <span className="ml-3 text-slate-500 dark:text-slate-400 font-medium">Loading heroes...</span>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex justify-center items-center p-12 flex-col space-y-3">
                  <Trophy className="text-slate-300 dark:text-slate-600 w-12 h-12" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-center">No volunteers have completed deliveries yet. Be the first hero!</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leaderboard.map((entry, index) => (
                    <div key={entry._id} className={`flex items-center justify-between p-6 transition-colors 
                      ${entry.isCurrentUser ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                    `}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner
                          ${index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' : 
                            index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 
                            index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className={`font-bold text-lg flex items-center gap-2 ${entry.isCurrentUser ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                            {entry.name}
                            {entry.isCurrentUser && (
                              <span className="text-[10px] bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
                            )}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                            <Star size={14} className="text-amber-500" /> {entry.badge} • {entry.deliveries} Deliveries
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-500">{entry.karma}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Karma</p>
                      </div>
                    </div>
                  ))}
                  {!leaderboard.some(e => e.isCurrentUser) && (
                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                      You are not in the top 10 yet. Keep delivering to climb the ranks!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: HISTORY */}
        <TabsContent value="history" className="w-full animate-in fade-in duration-500 block">
          <Card className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm rounded-2xl overflow-hidden">
            {history.length === 0 ? (
              <div className="text-center p-12">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="text-slate-400 w-10 h-10" />
                 </div>
                 <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200">Your Impact History</h4>
                 <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-md mx-auto">
                    Your recent deliveries and earned badges will appear here. Keep rescuing food to build your timeline!
                 </p>
              </div>
            ) : (
              <>
                <CardHeader className="bg-amber-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 pb-5">
                  <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Your Past Deliveries</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
          {history.map((donation, idx) => (
            <div key={idx} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                {/* DYNAMIC ICON LOGIC */}
                <div className={`p-3 rounded-full shrink-0 ${
                  donation.status === 'COMPLETED' 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {donation.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white capitalize text-lg">{donation.foodCategory}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin size={14}/> {donation.pickupLocation} • <span className="uppercase font-bold">{donation.status}</span>
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`font-black px-3 py-1.5 rounded-full text-sm flex items-center gap-1 shadow-sm border ${
                  donation.status === 'COMPLETED' 
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  <Flame size={14} /> {donation.status === 'COMPLETED' ? '+50 Karma ✓' : donation.status === 'ASSIGNED' ? 'Awaiting NGO Confirmation' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
