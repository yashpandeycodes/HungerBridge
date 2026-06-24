"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Megaphone, Package, HeartHandshake, Sparkles, Copy, Loader2, Activity, PieChart, Truck, CheckCircle } from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface DonationType {
  _id: string;
  foodCategory: string;
  quantity: string;
  pickupLocation: string; 
  expiryTime?: string | Date;
  isUrgent?: boolean;
  status?: string;
}

export interface CampaignType {
  _id: string;
  ngoId: string;
  title: string;
  description: string;
  targetMeals: number;
  mealsCollected: number;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
}

export default function NgoView() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveCampaigns, setLiveCampaigns] = useState<CampaignType[]>([]);
  const [campaignText, setCampaignText] = useState("");
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  const [donations, setDonations] = useState<DonationType[]>([]);
  const [incomingDeliveries, setIncomingDeliveries] = useState<DonationType[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  // Example stats for the Impact tab
 const [stats, setStats] = useState({
  totalMeals: 0,
  activeVolunteers: 0,
  campaignsRun: 0
});

  const chartData = [
  { name: "Completed", value: stats.totalMeals },
  { name: "Campaigns", value: stats.campaignsRun },
  { name: "Volunteers", value: stats.activeVolunteers },
];

const COLORS = ["#10b981", "#8b5cf6", "#3b82f6"];

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch("/api/donations");
        if (!res.ok) return; 
        const json = await res.json();
        if (json.success) {
          setDonations(json.data);
        } else {
          toast.error("Failed to load live donations.");
        }
      } catch (error) {
        toast.error("Network error while connecting to DB.");
      } finally {
        setIsLoadingDB(false);
      }
    };

    const fetchIncomingDeliveries = async () => {
      try {
        // Fetching donations that are ACCEPTED or ASSIGNED for this NGO
        const res = await fetch("/api/donations/active");
        const json = await res.json();
        if (json.success) setIncomingDeliveries(json.data);
      } catch (error) {
        console.error("Error fetching incoming deliveries", error);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const res = await fetch("/api/campaigns");
        const json = await res.json();
        if (json.success) setLiveCampaigns(json.data);
      } catch (error) {}
    };

    const fetchImpact = async () => {
      try {
        const res = await fetch("/api/impact");
        const json = await res.json();
        if (json.success) {
          setStats({
            totalMeals: json.data.totalMealsServed,
            campaignsRun: json.data.activeCampaigns,
            activeVolunteers: json.data.volunteerHours,
          });
        }
      } catch (e) {}
    };

    fetchImpact();
    fetchCampaigns();
    fetchDonations();
    fetchIncomingDeliveries();
  }, []);

  const generateCampaign = async (donation: DonationType) => {
    setIsGenerating(true);
    setActiveCard(donation._id); 
    toast("🤖 AI is drafting your campaign...", { duration: 3000 });

    try {
      const res = await fetch("/api/campaigns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          foodDetails: {
            category: donation.foodCategory,
            quantity: donation.quantity,
            location: donation.pickupLocation || "Community Center", 
          }
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCampaignText(data.data.campaignContent);
        toast.success("✨ Campaign drafted successfully!");
      } else {
        toast.error("AI failed to generate campaign. Try again.");
      }
    } catch (error) {
      toast.error("Network error during AI generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const claimDonation = async (donationId: string) => {
    toast("Claiming donation...", { duration: 2000 });
    try {
      const res = await fetch("/api/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });
      
      const json = await res.json();
      
      if (json.success) {
        toast.success("Donation claimed successfully!");
        setDonations((prev) => prev.filter((d) => d._id !== donationId));
        // Move to incoming deliveries list
        setIncomingDeliveries((prev) => [...prev, json.data]); 
      } else {
        toast.error(json.message || "Failed to claim donation.");
      }
    } catch (error) {
      toast.error("Network error while claiming.");
    }
  };

  // 👇 --- NEW FUNCTION FOR COMPLETED EVENT --- 👇
  const markAsReceived = async (donationId: string) => {
    toast("Confirming delivery...", { duration: 2000 });
    try {
      const res = await fetch("/api/donations/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });
      
      const json = await res.json();
      
      if (json.success) {
        toast.success("🎉 Delivery Confirmed! Donor notified.");
        setIncomingDeliveries((prev) => prev.filter((d) => d._id !== donationId));
        
        // Update stats locally for that real-time feel
        setStats(prev => ({ ...prev, totalMeals: prev.totalMeals + (parseInt(json.data.quantity) || 20) }));
      } else {
        toast.error(json.message || "Failed to confirm delivery.");
      }
    } catch (error) {
      toast.error("Network error while confirming.");
    }
  };

  const publishCampaign = async () => {
    if (!campaignText) {
      toast.error("Please generate an AI appeal first!");
      return;
    }
    const currentDonation = donations.find(d => d._id === activeCard);
    if (!currentDonation) {
      toast.error("Please select a donation first!");
      return;
    }

    const parsedQuantity = parseInt(currentDonation.quantity.replace(/\D/g, '')) || 50;
    toast("Publishing Campaign...", { duration: 2000 });

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Urgent Food Relief: ${currentDonation.foodCategory}`,
          description: campaignText,
          targetMeals: parsedQuantity,
        }),
      });
      
      const json = await res.json();
      if (json.success) {
        toast.success("Campaign published successfully!");
        setCampaignText("");
        setActiveCard(null);
        setLiveCampaigns(prev => [...prev, json.data]);
        setStats(prev => ({ ...prev, campaignsRun: prev.campaignsRun + 1 }));
      } else {
        toast.error(json.message || "Failed to publish campaign.");
      }
    } catch (error) {
      toast.error("Network error while publishing.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(campaignText);
    toast.success("Copied to clipboard! 📋 Ready to share.");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 relative w-full block">
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3" />

      {/* Hero Stats Card */}
      <Card className="relative w-full overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-900 dark:to-slate-900 text-white rounded-3xl group z-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 w-full">
          <div className="space-y-3 text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-black flex items-center justify-center md:justify-start gap-3 tracking-tight">
              <HeartHandshake className="text-emerald-300 drop-shadow-md" size={36} /> 
              NGO Operations Center
            </h2>
            <p className="text-emerald-100/90 text-lg md:text-xl font-medium max-w-lg">
              Claim live donations, generate AI campaigns, and track your daily impact.
            </p>
          </div>
          
          <div className="flex gap-4 shrink-0">
            <div className="bg-white/10 dark:bg-black/40 p-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner min-w-[120px] text-center shrink-0">
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                <Package size={14} className="text-emerald-300" /> Donations
              </p>
              <p className="text-3xl font-black text-white drop-shadow-sm transition-all duration-500">{donations.length}</p>
            </div>
            <div className="bg-white/10 dark:bg-black/40 p-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner min-w-[120px] text-center shrink-0">
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                <Megaphone size={14} className="text-purple-300" /> Campaigns
              </p>
              <p className="text-3xl font-black text-white drop-shadow-sm transition-all duration-500">{liveCampaigns.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✨ UPDATED TABS: Responsive Grid + Better Dark Mode Colors */}
      <Tabs defaultValue="feed" className="w-full relative z-10 block">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-14 bg-slate-100 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 mb-8 gap-1">
          <TabsTrigger value="feed" className="rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 transition-all py-2.5 shadow-none data-[state=active]:shadow-sm">
            <Activity className="w-4 h-4 mr-2" /> Live Feed
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 transition-all py-2.5 shadow-none data-[state=active]:shadow-sm">
            <Truck className="w-4 h-4 mr-2" /> Deliveries
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 transition-all py-2.5 shadow-none data-[state=active]:shadow-sm">
            <Megaphone className="w-4 h-4 mr-2" /> Campaigns
          </TabsTrigger>
          <TabsTrigger value="impact" className="rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all py-2.5 shadow-none data-[state=active]:shadow-sm">
            <PieChart className="w-4 h-4 mr-2" /> Impact Stats
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: LIVE FEED & AI STUDIO */}
        <TabsContent value="feed" className="w-full animate-in fade-in duration-500 block">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
            
            {/* Live Feed List */}
            <div className="lg:col-span-7 space-y-6 w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Live Donation Feed
                </h2>
              </div>
              
              {isLoadingDB ? (
                <div className="w-full flex flex-col items-center justify-center p-16 space-y-5 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-[#121212]/50">
                  <Loader2 className="w-12 h-12 border-4 border-orange-200 dark:border-orange-500/20 border-t-orange-600 dark:border-t-orange-500 rounded-full animate-spin text-transparent" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Scanning network for donations...</p>
                </div>
              ) : donations.length === 0 ? (
                <div className="w-full p-12 text-center border border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-[#121212]/50">
                  <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No active donations at the moment.</p>
                </div>
              ) : (
                <div className="space-y-5 w-full">
                  {donations.map((donation) => (
                    <Card 
                      key={donation._id} 
                      className={`w-full border transition-all duration-300 bg-white/80 dark:bg-slate-900 shadow-sm hover:shadow-md rounded-2xl overflow-hidden
                        ${activeCard === donation._id 
                          ? 'border-purple-500 dark:border-purple-500 shadow-purple-500/10 ring-1 ring-purple-500' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-orange-500/50'
                        }`}
                    >
                      <CardContent className="p-6 flex flex-col sm:flex-row justify-between gap-6 relative w-full">
                        <div className="space-y-4 relative z-10 flex-1 w-full min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white capitalize tracking-tight truncate">
                              {donation.foodCategory || "Food Donation"}
                            </h3>
                            {donation.isUrgent && (
                              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-black tracking-widest uppercase rounded-full animate-pulse border border-red-200 dark:border-red-800 shrink-0">
                                URGENT
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 w-full">
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/50 truncate">
                              <Package size={18} className="text-emerald-500 shrink-0" /> 
                              <span className="truncate">{donation.quantity}</span>
                            </div>
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/50 truncate">
                              <MapPin size={18} className="text-blue-500 shrink-0" /> 
                              <span className="truncate">{donation.pickupLocation || "Donor Location"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 justify-center sm:w-48 relative z-10 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                          <Button 
                            onClick={() => generateCampaign(donation)} 
                            disabled={isGenerating}
                            variant="outline"
                            className={`w-full border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 flex items-center gap-2 font-bold transition-all h-11 rounded-xl
                              ${activeCard === donation._id ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-400' : ''}
                            `}
                          >
                            {isGenerating && activeCard === donation._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles size={18} />
                            )} 
                            AI Appeal
                          </Button>
                          <Button 
                            onClick={() => claimDonation(donation._id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 font-bold shadow-md border-0 transition-all h-11 rounded-xl"
                          >
                            <HeartHandshake size={18} /> Claim Food
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* AI Studio Sidebar */}
            <div className="lg:col-span-5 w-full">
              <div className="sticky top-24 w-full">
                <Card className="w-full border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                  <CardHeader className="bg-purple-50/50 dark:bg-slate-800/50 pb-5 border-b border-slate-200 dark:border-slate-800 w-full">
                    <CardTitle className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                      <Sparkles className="text-purple-600 dark:text-purple-400" size={24} /> 
                      Campaign Studio
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 mt-2">
                      Select a live donation to auto-generate a high-conversion social media post.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-6 w-full">
                    {campaignText ? (
                      <div className="space-y-5 w-full animate-in fade-in">
                        <textarea 
                          value={campaignText} 
                          onChange={(e) => setCampaignText(e.target.value)}
                          className="w-full min-h-[260px] text-sm p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-slate-800 dark:text-slate-200 transition-all"
                        />
                        <div className="flex gap-4 w-full">
                          <Button 
                            variant="outline"
                            className="w-1/2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 font-bold h-12 rounded-xl" 
                            onClick={copyToClipboard}
                          >
                            <Copy size={18} className="mr-2"/> Copy
                          </Button>
                          <Button 
                            onClick={publishCampaign}
                            className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md h-12 rounded-xl"
                          >
                            <Megaphone size={18} className="mr-2"/> Publish
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[260px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                        <Sparkles size={32} className="text-purple-400 mb-4" />
                        <p className="text-sm font-medium text-center px-8 text-slate-500 dark:text-slate-400">
                          Click <strong className="text-purple-600 dark:text-purple-400">AI Appeal</strong> on any live donation to magically generate your campaign.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ✨ NEW TAB: INCOMING DELIVERIES */}
        <TabsContent value="deliveries" className="w-full animate-in fade-in duration-500 pt-6 block">
          <div className="flex items-center gap-3 mb-6">
             <Truck className="text-orange-500 w-8 h-8" />
             <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Active Deliveries</h2>
          </div>
          {incomingDeliveries.length === 0 ? (
            <div className="w-full p-16 text-center border border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-[#121212]/50 max-w-3xl mx-auto">
              <Truck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Active Deliveries</h4>
              <p className="text-slate-500 dark:text-slate-400">Claim donations from the live feed to see them here.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
              {incomingDeliveries.map((delivery) => (
                <Card key={delivery._id} className="border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/20 shadow-md rounded-2xl">
                  <CardHeader className="pb-2">
                     <CardTitle className="text-lg font-bold text-slate-900 dark:text-white capitalize flex items-center justify-between">
                        {delivery.foodCategory}
                        <span className="text-xs bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full">
                           {delivery.status || 'ON THE WAY'}
                        </span>
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Package size={16} className="text-emerald-500" /> {delivery.quantity}
                     </div>
                     <Button 
                        onClick={() => markAsReceived(delivery._id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11"
                     >
                        <CheckCircle size={18} className="mr-2" /> Mark as Received
                     </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: ACTIVE CAMPAIGNS */}
        <TabsContent value="campaigns" className="w-full animate-in fade-in duration-500 pt-6 block">
           {liveCampaigns.length === 0 ? (
              <div className="w-full p-16 text-center border border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-[#121212]/50 max-w-3xl mx-auto">
                <Megaphone className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Active Campaigns</h4>
                <p className="text-slate-500 dark:text-slate-400">Use the Campaign Studio to create your first appeal.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {liveCampaigns.map((campaign) => (
                  <Card key={campaign._id} className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md rounded-2xl flex flex-col">
                    <CardHeader className="bg-purple-50/50 dark:bg-slate-800/50 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">{campaign.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{campaign.description}</p>
                      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-slate-700 dark:text-slate-300">Target: {campaign.targetMeals}</span>
                          <span className="text-purple-600 dark:text-purple-400">{campaign.mealsCollected} Collected</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                           <div 
                              className="bg-purple-500 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${Math.min((campaign.mealsCollected / campaign.targetMeals) * 100, 100)}%` }}
                           />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

        {/* TAB 4: IMPACT STATS */}
        <TabsContent value="impact" className="w-full animate-in fade-in duration-500 pt-6 block">
          <div className="grid gap-6 md:grid-cols-3 w-full">
             <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-8 text-center flex flex-col items-center">
                <HeartHandshake className="text-blue-500 w-12 h-12 mb-4" />
                <h4 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Total Meals Served</h4>
                <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.totalMeals}</p>
             </Card>
             <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-8 text-center flex flex-col items-center">
                <MapPin className="text-emerald-500 w-12 h-12 mb-4" />
                <h4 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Active Volunteers</h4>
                <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.activeVolunteers}</p>
             </Card>
             <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-8 text-center flex flex-col items-center">
                <Megaphone className="text-purple-500 w-12 h-12 mb-4" />
                <h4 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Campaigns Run</h4>
                <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.campaignsRun}</p>
             </Card>
             
             <div className="mt-8 md:col-span-3">
              <Card className="w-full border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-widest text-sm mb-2">NGO Analytics</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60} paddingAngle={4}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}/>
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}