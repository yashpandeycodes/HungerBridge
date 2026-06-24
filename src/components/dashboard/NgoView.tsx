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
    toast("🤖 Gemini AI is drafting your campaign...", { duration: 3000 });

    try {
      const res = await fetch("/api/campaigns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        
        body: JSON.stringify({ 
          foodDetails: {
            category: donation.foodCategory || donation.foodCategory,
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
    //   setActiveCard(null);
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
        toast.success(" Donation claimed successfully!");
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
        toast.success(" Campaign published successfully!");
       
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-none shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500 rounded-full text-white">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">Available Donations</p>
              <h3 className="text-2xl font-bold text-emerald-900">
                {isLoadingDB ? <Loader2 className="animate-spin w-5 h-5 mt-1" /> : donations.length}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-none shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-full text-white">
              <HeartHandshake size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">People Fed Today</p>
              <h3 className="text-2xl font-bold text-blue-900">1,204</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-100 border-none shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-purple-500 rounded-full text-white">
              <Megaphone size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Active AI Campaigns</p>
              <h3 className="text-2xl font-bold text-purple-900">{liveCampaigns.length} Running</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-orange-500" /> Live Donation Feed
          </h2>
          
          {isLoadingDB ? (
            <div className="flex flex-col items-center justify-center p-10 space-y-4 border border-dashed rounded-xl bg-slate-50">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-slate-500">Fetching live database...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="p-8 text-center border rounded-xl bg-slate-50">
              <p className="text-slate-500">No active donations at the moment.</p>
            </div>
          ) : (
            donations.map((donation) => (
              <Card key={donation._id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      
                      <h3 className="font-bold text-lg text-slate-800">{donation.foodCategory || donation.foodCategory || "Food Donation"}</h3>
                      {donation.isUrgent && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <Package size={16} className="text-slate-400" /> {donation.quantity}
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" /> {donation.pickupLocation || "Donor Location Hidden"}
                    </div>
                    <div className="text-sm text-orange-600 flex items-center gap-2 font-medium">
                      <Clock size={16} /> 
                      {donation.expiryTime ? new Date(donation.expiryTime).toLocaleString() : "Contact for expiry"}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-end gap-3 justify-end mt-4 sm:mt-0">
                    <Button 
                      onClick={() => generateCampaign(donation)} 
                      disabled={isGenerating}
                      variant="outline"
                      className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      {isGenerating && activeCard === donation._id ? (
                        "Drafting..."
                      ) : (
                        <>
                          <Sparkles size={16} className="text-purple-500" /> AI Appeal
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => claimDonation(donation._id)}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md"
                    >
                      <HeartHandshake size={16} /> Claim Donation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>


        <div className="md:col-span-5">
          <Card className="border-none shadow-lg bg-white sticky top-6 border-t-4 border-t-purple-600">
            <CardHeader className="bg-purple-50/50 rounded-t-xl pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-purple-600" /> Campaign Studio
              </CardTitle>
              <CardDescription>
                Select a live donation to auto-generate a high-conversion social media post.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {campaignText ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <textarea 
                    value={campaignText} 
                    onChange={(e) => setCampaignText(e.target.value)}
                    className="w-full min-h-[220px] text-sm p-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline"
                      className="w-full sm:w-1/2 border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-semibold" 
                      onClick={copyToClipboard}
                    >
                      <Copy size={18} /> Copy Text
                    </Button>
                    
                    <Button 
                      onClick={publishCampaign}
                      className="w-full sm:w-1/2 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 font-semibold shadow-md"
                    >
                      <Megaphone size={18} /> Publish to DB
                    </Button>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[220px] text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                  <Megaphone size={48} className="mb-4 text-slate-300" />
                  <p className="text-sm text-center px-4">
                    Click `AI Appeal` on any live donation feed to generate your campaign.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}