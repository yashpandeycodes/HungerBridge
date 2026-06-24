"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Clock, Megaphone, Package, HeartHandshake, Sparkles, Copy, Loader2 } from "lucide-react";

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
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch("/api/donations");
        
      if (!res.ok) {
      console.error("API failed with status:", res.status);
      return; 
    }
    
        const json = await res.json();
        
        if (json.success) {
          setDonations(json.data);
        } else {
          toast.error("Failed to load live donations.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Network error while connecting to DB.");
      } finally {
        setIsLoadingDB(false);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const res = await fetch("/api/campaigns");
        const json = await res.json();
        if (json.success) setLiveCampaigns(json.data);
      } catch (error) {}
    };
    fetchCampaigns();

    fetchDonations();
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
      } else {
        toast.error(json.message || "Failed to claim donation.");
      }
    } catch (error) {
      toast.error("Network error while claiming.");
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 relative w-full">
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3" />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3 relative z-10">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/5 border border-emerald-200 dark:border-emerald-500/20 shadow-lg dark:shadow-emerald-500/5 backdrop-blur-xl overflow-hidden group">
          <div className="absolute inset-0 bg-white/40 dark:bg-transparent" />
          <CardContent className="p-6 flex items-center space-x-5 relative z-10">
            <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <Package size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Available Donations</p>
              <h3 className="text-4xl font-black text-emerald-950 dark:text-emerald-50 mt-1">
                {isLoadingDB ? <Loader2 className="animate-spin w-8 h-8 mt-1 text-emerald-600 dark:text-emerald-400" /> : donations.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-500/10 dark:to-indigo-500/5 border border-blue-200 dark:border-blue-500/20 shadow-lg dark:shadow-blue-500/5 backdrop-blur-xl overflow-hidden group">
          <div className="absolute inset-0 bg-white/40 dark:bg-transparent" />
          <CardContent className="p-6 flex items-center space-x-5 relative z-10">
            <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <HeartHandshake size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">People Fed Today</p>
              <h3 className="text-4xl font-black text-blue-950 dark:text-blue-50 mt-1">1,204</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-100 dark:from-purple-500/10 dark:to-fuchsia-500/5 border border-purple-200 dark:border-purple-500/20 shadow-lg dark:shadow-purple-500/5 backdrop-blur-xl overflow-hidden group">
          <div className="absolute inset-0 bg-white/40 dark:bg-transparent" />
          <CardContent className="p-6 flex items-center space-x-5 relative z-10">
            <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <Megaphone size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider">Active Campaigns</p>
              <h3 className="text-4xl font-black text-purple-950 dark:text-purple-50 mt-1">{liveCampaigns.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-12 relative z-10">
        
        {/* Live Feed Section */}
        <div className="md:col-span-7 space-y-6">
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
            <div className="flex flex-col items-center justify-center p-16 space-y-5 border border-slate-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-orange-200 dark:border-orange-500/20 border-t-orange-600 dark:border-t-orange-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Scanning network for donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="p-12 text-center border border-slate-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No active donations at the moment.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {donations.map((donation) => (
                <Card 
                  key={donation._id} 
                  className={`border transition-all duration-300 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl shadow-md hover:shadow-xl rounded-2xl overflow-hidden
                    ${activeCard === donation._id 
                      ? 'border-purple-500 dark:border-purple-500 shadow-purple-500/20 dark:shadow-purple-500/10 ring-1 ring-purple-500' 
                      : 'border-slate-200 dark:border-white/10 hover:border-orange-500/50 dark:hover:border-orange-500/50'
                    }`}
                >
                  <CardContent className="p-6 flex flex-col sm:flex-row justify-between gap-6 relative">
                    {/* Background gradient hint */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="space-y-4 relative z-10 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white capitalize tracking-tight">
                          {donation.foodCategory || "Food Donation"}
                        </h3>
                        {donation.isUrgent && (
                          <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-black tracking-widest uppercase rounded-full animate-pulse border border-red-200 dark:border-red-500/30">
                            URGENT
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2.5 bg-slate-100 dark:bg-white/5 p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                          <Package size={18} className="text-emerald-500" /> 
                          <span className="truncate">{donation.quantity}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2.5 bg-slate-100 dark:bg-white/5 p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                          <MapPin size={18} className="text-blue-500" /> 
                          <span className="truncate">{donation.pickupLocation || "Donor Location"}</span>
                        </div>
                        <div className="text-sm font-medium text-orange-700 dark:text-orange-400 flex items-center gap-2.5 bg-orange-50 dark:bg-orange-500/10 p-2.5 rounded-lg border border-orange-100 dark:border-orange-500/20 sm:col-span-2">
                          <Clock size={18} /> 
                          <span>{donation.expiryTime ? new Date(donation.expiryTime).toLocaleString() : "Contact for expiry"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 justify-center sm:w-48 relative z-10 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/10 pt-4 sm:pt-0 sm:pl-6">
                      <Button 
                        onClick={() => generateCampaign(donation)} 
                        disabled={isGenerating}
                        variant="outline"
                        className={`w-full border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 flex items-center gap-2 font-bold transition-all h-11 rounded-xl
                          ${activeCard === donation._id ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-400 dark:border-purple-400' : ''}
                        `}
                      >
                        {isGenerating && activeCard === donation._id ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Drafting
                          </span>
                        ) : (
                          <>
                            <Sparkles size={18} className="text-purple-500 dark:text-purple-400" /> AI Appeal
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        onClick={() => claimDonation(donation._id)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex items-center gap-2 font-bold shadow-lg shadow-emerald-500/25 border-0 transition-all hover:scale-[1.02] active:scale-[0.98] h-11 rounded-xl"
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

        {/* Campaign Studio Sidebar */}
        <div className="md:col-span-5">
          <div className="sticky top-24">
            <Card className="border border-slate-200 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-[#121212]/90 backdrop-blur-2xl rounded-3xl overflow-hidden relative group">
              
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500" />
              
              <CardHeader className="bg-purple-50/50 dark:bg-purple-500/5 pb-5 border-b border-slate-200 dark:border-white/5">
                <CardTitle className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Sparkles className="text-purple-600 dark:text-purple-400" size={24} /> 
                  Campaign Studio
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                  Select a live donation to auto-generate a high-conversion social media post using AI.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                {campaignText ? (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/50 dark:bg-red-500/30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50 dark:bg-yellow-500/30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/50 dark:bg-green-500/30"></div>
                      </div>
                      <textarea 
                        value={campaignText} 
                        onChange={(e) => setCampaignText(e.target.value)}
                        className="w-full min-h-[260px] text-sm p-5 pt-10 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 resize-none leading-relaxed text-slate-700 dark:text-slate-300 font-medium transition-all"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        variant="outline"
                        className="w-full sm:w-1/2 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 flex items-center justify-center gap-2 font-bold h-12 rounded-xl transition-all" 
                        onClick={copyToClipboard}
                      >
                        <Copy size={18} /> Copy Text
                      </Button>
                      
                      <Button 
                        onClick={publishCampaign}
                        className="w-full sm:w-1/2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white flex items-center justify-center gap-2 font-bold shadow-lg shadow-purple-500/25 border-0 transition-all hover:scale-[1.02] active:scale-[0.98] h-12 rounded-xl"
                      >
                        <Megaphone size={18} /> Publish to DB
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[260px] text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5 group-hover:border-purple-300 dark:group-hover:border-purple-500/30 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mb-4">
                      <Sparkles size={32} className="text-purple-400 dark:text-purple-500" />
                    </div>
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
    </div>
  );
}