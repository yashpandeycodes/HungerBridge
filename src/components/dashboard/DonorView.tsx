"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Sparkles, AlertCircle, HeartHandshake, Loader2, UploadCloud, History, PlusCircle, Trash2, Package, Clock, Award, Download, X, Share2, Check } from "lucide-react";
import Image from "next/image";
import * as htmlToImage from "html-to-image";
import useIdleTimeout from "@/hooks/useIdleTimeout";

export interface CampaignDropdownType {
  _id: string;
  title: string;
  targetMeals: number;
  mealsCollected: number;
}

export interface MyDonationType {
  _id: string;
  foodCategory: string;
  quantity: string;
  pickupLocation: string;
  expiryTime: string;
  status: string;
  isUrgent: boolean;
  createdAt: string;
}

export default function DonorView() {
  useIdleTimeout(15);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Certificate Modal States
  const [showCertificate, setShowCertificate] = useState<MyDonationType | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    foodCategory: "",
    foodSource: "Households",
    quantity: "",
    expiryTime: "",
    pickupLocation: "",
    isUrgent: false,
    campaignId: "",
  });

  const [activeCampaigns, setActiveCampaigns] = useState<CampaignDropdownType[]>([]);
  const [myDonations, setMyDonations] = useState<MyDonationType[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchMyDonations = useCallback(async (isRefresh = false, signal?: AbortSignal) => {
    if (isRefresh) {
      queueMicrotask(() => setIsLoadingHistory(true));
    }
    try {
      const res = await fetch("/api/donations/me", { signal });
      const json = await res.json();
      if (json.success) {
        queueMicrotask(() => setMyDonations(json.data));
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error("Failed to load your donation history.");
    } finally {
      queueMicrotask(() => setIsLoadingHistory(false));
    }
  }, []); 

   useEffect(() => {
    const controller = new AbortController();

    const fetchCampaigns = async () => {
      try {
        const res = await fetch("/api/campaigns", { signal: controller.signal });
        const json = await res.json();
        if (json.success) {
          queueMicrotask(() => setActiveCampaigns(json.data));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error("Failed to fetch campaigns");
      }
    };

    fetchCampaigns();
    fetchMyDonations(false, controller.signal);

    return () => controller.abort();
  }, [fetchMyDonations]);

  // --- Form Persistence Logic ---
  useEffect(() => {
    const savedFormData = localStorage.getItem("donorFormData");
    const savedPreview = localStorage.getItem("donorPreviewBase64");
    
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
      } catch (e) {
        console.error("Could not parse saved form data", e);
      }
    }
    
    if (savedPreview) {
      setPreviewBase64(savedPreview);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("donorFormData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (previewBase64) {
      try {
        localStorage.setItem("donorPreviewBase64", previewBase64);
      } catch (e) {
        console.warn("Image too large for local storage");
      }
    } else {
      localStorage.removeItem("donorPreviewBase64");
    }
  }, [previewBase64]);
  // -----------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const updatedFormData = { ...formData, [name]: value };

    if (name === "expiryTime") {
      const expiryDate = new Date(value);
      const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000);
      
      if (expiryDate <= fourHoursFromNow) {
        updatedFormData.isUrgent = true;
        toast.info("⏳ Time is less than 4 hours! Automatically marked as Urgent.", { duration: 4000 });
      }
    }
    setFormData(updatedFormData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPreviewBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = async () => {
    if (!previewBase64) {
      toast.error("Please upload an image first!");
      return;
    }

    setIsAnalyzing(true);
    toast(" AI is analyzing the food...", { duration: 3000 });

    try {
      const base64Data = previewBase64.split(",")[1];
      const res = await fetch("/api/donations/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data }),
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({
          ...formData,
          foodCategory: data.data.foodCategory,
          quantity: data.data.estimatedQuantity,
          foodSource: data.data.suggestedSource,
        });
        toast.success(" AI successfully categorized the food!");
      } else {
        toast.error("AI Analysis failed. You can enter details manually.");
      }
    } catch (error) {
      toast.error("Network error during AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photoUrl: previewBase64, 
          expiryTime: new Date(formData.expiryTime).toISOString(), 
        }),
      });

      if (res.ok) {
        toast.success("🎉 Donation created successfully! NGOs will be notified.");
        
        setFormData({ 
          foodCategory: "",
          foodSource: "Households", 
          quantity: "", 
          expiryTime: "", 
          pickupLocation: "", 
          campaignId: "", 
          isUrgent: false 
        });
        setPreviewBase64(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        // Clear persistence on success
        localStorage.removeItem("donorFormData");
        localStorage.removeItem("donorPreviewBase64");
        
        fetchMyDonations(true); // Refresh history
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to create donation.");
      }
    } catch (error) {
      toast.error("Error submitting donation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDonation = async (id: string) => {
    if (!confirm("Are you sure you want to remove this pending donation?")) return;
    
    toast("Removing donation...", { duration: 2000 });
    try {
      const res = await fetch(`/api/donations?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success("Donation removed successfully.");
        setMyDonations(prev => prev.filter(d => d._id !== id));
      } else {
        toast.error(json.message || "Failed to remove donation.");
      }
    } catch (error) {
      toast.error("Network error while deleting.");
    }
  };

  //  Download Certificate Logic
  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    toast("Generating high-res certificate...", { duration: 2000 });
    
    try {
      const dataUrl = await htmlToImage.toPng(certificateRef.current, {
        quality: 1,
        pixelRatio: 3, // For high resolution HD image
        backgroundColor: undefined
      });
      
      const link = document.createElement("a");
      link.download = `HungerBridge-Impact-${showCertificate?._id.substring(0,6)}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Certificate downloaded! Ready to share. 🚀");
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Failed to download certificate.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative group animate-in fade-in slide-in-from-bottom-8 duration-700 block">


      <Tabs defaultValue="donate" className="w-full relative z-10 block">
        <TabsList className="grid w-full grid-cols-2 h-auto md:h-14 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl p-1.5 mb-6 gap-1">
          <TabsTrigger value="donate" className="rounded-lg font-bold text-sm text-[hsl(var(--muted-foreground))] data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 py-2.5 transition-all shadow-none data-[state=active]:shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2" /> Donate Food
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg font-bold text-sm text-[hsl(var(--muted-foreground))] data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 py-2.5 transition-all shadow-none data-[state=active]:shadow-sm">
            <History className="w-4 h-4 mr-2" /> My History
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: FORM */}
        <TabsContent value="donate" className="w-full animate-in fade-in duration-500">
          <Card className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-2xl relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-1.5 brand-gradient" />

            <CardHeader className="pb-6 pt-8 border-b border-slate-100 dark:border-slate-800/80 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <HeartHandshake className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <div>
                    <CardTitle className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      List Food for Donation
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 font-medium text-base mt-1">
                      Upload a photo and let our AI magically extract the details.
                    </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-8 px-6 md:px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-4">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon size={16} /> Upload Food Photo
                  </Label>
                  
                  <div className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden group/upload
                      ${previewBase64 
                        ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/10' 
                        : 'border-[hsl(var(--border))] hover:border-indigo-400 dark:hover:border-indigo-500 bg-[hsl(var(--muted))]'
                      }`}
                  >
                      {!previewBase64 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500">
                            <UploadCloud size={32} className="mb-2 group-hover/upload:text-indigo-500 transition-colors" />
                            <span className="text-sm font-medium">Click to browse or drag & drop</span>
                        </div>
                      )}
                      
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      {previewBase64 ? (
                        <div className="p-4 flex flex-col sm:flex-row items-center gap-6 relative z-20">
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md border-2 border-white dark:border-slate-700 shrink-0 group/img">
                              <Image src={previewBase64} alt="Food Preview" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 backdrop-blur-sm transition-all z-30 opacity-80 hover:opacity-100"
                                title="Remove Image"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div className="flex-1 w-full space-y-4 text-center sm:text-left">
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Image uploaded. Ready for AI extraction.</p>
                              <Button 
                                  type="button" 
                                  onClick={analyzeImage} 
                                  disabled={isAnalyzing}
                                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 border-0 transition-all active:scale-[0.98] h-11 rounded-xl font-bold px-6"
                              >
                                  {isAnalyzing ? (
                                  <span className="flex items-center gap-2">
                                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                                  </span>
                                  ) : (
                                  <span className="flex items-center gap-2">
                                      <Sparkles size={18} /> Auto-Fill with AI
                                  </span>
                                  )}
                              </Button>
                            </div>
                        </div>
                      ) : (
                        <div className="h-32 w-full" /> 
                      )}
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Food Category / Name <span className="text-red-500">*</span></Label>
                    <Input required name="foodCategory" placeholder="e.g. 5 boxes of Rice" value={formData.foodCategory} onChange={handleChange} className="bg-[hsl(var(--muted))] border-[hsl(var(--border))] focus:ring-indigo-500 dark:focus:ring-indigo-400 text-[hsl(var(--foreground))] transition-all h-12 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Estimated Quantity <span className="text-red-500">*</span></Label>
                    <Input required name="quantity" placeholder="e.g. 10 kg or 20 servings" value={formData.quantity} onChange={handleChange} className="bg-[hsl(var(--muted))] border-[hsl(var(--border))] focus:ring-indigo-500 dark:focus:ring-indigo-400 text-[hsl(var(--foreground))] transition-all h-12 rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Pickup Location (Address) <span className="text-red-500">*</span></Label>
                    <Input required name="pickupLocation" placeholder="Full precise address" value={formData.pickupLocation} onChange={handleChange} className="bg-[hsl(var(--muted))] border-[hsl(var(--border))] focus:ring-indigo-500 dark:focus:ring-indigo-400 text-[hsl(var(--foreground))] transition-all h-12 rounded-lg" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Food Source <span className="text-red-500">*</span></Label>
                    <select name="foodSource" className="flex h-12 w-full items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-[hsl(var(--foreground))] transition-all appearance-none cursor-pointer" value={formData.foodSource} onChange={handleChange} required>
                      <option value="Households">Households (Home cooked)</option>
                      <option value="Restaurant surplus">Restaurant Surplus</option>
                      <option value="Events/Weddings">Events / Weddings</option>
                      <option value="Corporate cafeterias">Corporate Cafeterias</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold flex justify-between items-center">
                      <span>Support an NGO Campaign <span className="text-slate-400 font-normal">(Optional)</span></span>
                    </Label>
                    <select name="campaignId" className="flex h-12 w-full items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-[hsl(var(--foreground))] transition-all appearance-none cursor-pointer" value={formData.campaignId} onChange={handleChange}>
                      <option value="">-- General Donation (Open to all NGOs) --</option>
                      {activeCampaigns.map((camp) => (
                        <option key={camp._id} value={camp._id}>
                          {camp.title} (Progress: {camp.mealsCollected} / {camp.targetMeals} meals)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Expiry Time <span className="text-red-500">*</span></Label>
                    <Input required type="datetime-local" name="expiryTime" value={formData.expiryTime} onChange={handleChange} className="bg-[hsl(var(--muted))] border-[hsl(var(--border))] focus:ring-indigo-500 dark:focus:ring-indigo-400 text-[hsl(var(--foreground))] transition-all h-12 rounded-lg" style={{ colorScheme: 'inherit' }} />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl transition-colors hover:border-red-300 dark:hover:border-red-800/80">
                  <input type="checkbox" id="isUrgent" checked={formData.isUrgent} onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})} className="h-5 w-5 text-red-600 dark:text-red-500 rounded border-red-300 dark:border-red-800 focus:ring-red-500 dark:focus:ring-red-500 dark:bg-black transition-all cursor-pointer accent-red-600" />
                  <Label htmlFor="isUrgent" className="text-red-700 dark:text-red-400 font-bold cursor-pointer select-none flex items-center gap-2">
                    <AlertCircle size={18} /> Mark as Urgent (Spoils soon - needs immediate pickup)
                  </Label>
                </div>

                <Button type="submit" className="w-full h-14 brand-gradient hover:brightness-110 text-white rounded-xl font-bold text-lg brand-shadow border-0 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" /> Submitting...
                    </span>
                  ) : "List Food for Donation"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MY DONATIONS HISTORY */}
        <TabsContent value="history" className="w-full animate-in fade-in duration-500">
          {isLoadingHistory ? (
            <div className="w-full flex flex-col items-center justify-center p-16 border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--muted))]">
              <Loader2 className="w-12 h-12 animate-spin text-sky-500 mb-4" />
              <p className="text-slate-500">Loading your generosity...</p>
            </div>
          ) : myDonations.length === 0 ? (
            <div className="w-full text-center p-16 border-2 border-dashed border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--muted))]">
              <HeartHandshake className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Donations Yet</h4>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Your listed donations will appear here. Start by donating some food!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {myDonations.map((donation) => (
                <Card key={donation._id} className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl overflow-hidden flex flex-col transition-colors">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white capitalize truncate">
                      {donation.foodCategory}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 flex-1 flex flex-col space-y-5">
                    
                    {/* THE SWIGGY-STYLE TIMELINE */}
                    <div className="relative w-full mt-2 mb-2">
                      <div className="absolute top-3.5 left-[15%] right-[15%]">
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        <div 
                          className="absolute top-0 left-0 h-1.5 bg-emerald-500 rounded-full transition-all duration-1000 ease-in-out" 
                          style={{ width: donation.status === 'PENDING' ? '0%' : (donation.status === 'ACCEPTED' || donation.status === 'ASSIGNED' ? '50%' : '100%') }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between relative z-10 px-2">
                        {/* Step 1: Listed */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-emerald-500 shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-900">
                            <Check size={16} strokeWidth={3} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Listed</span>
                        </div>
                        
                        {/* Step 2: Claimed */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-700 ring-4 ring-white dark:ring-slate-900 ${donation.status !== 'PENDING' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                            {donation.status !== 'PENDING' ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-bold">2</span>}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${donation.status !== 'PENDING' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>Claimed</span>
                        </div>

                        {/* Step 3: Rescued */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-700 ring-4 ring-white dark:ring-slate-900 ${(donation.status !== 'PENDING' && donation.status !== 'ACCEPTED' && donation.status !== 'ASSIGNED') ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                            {(donation.status !== 'PENDING' && donation.status !== 'ACCEPTED' && donation.status !== 'ASSIGNED') ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-bold">3</span>}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${(donation.status !== 'PENDING' && donation.status !== 'ACCEPTED' && donation.status !== 'ASSIGNED') ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>Rescued</span>
                        </div>
                      </div>
                    </div>

                    {/* Food Details */}
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 flex-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <p className="flex items-center gap-3"><Package size={16} className="text-indigo-500" /> <span className="font-medium">{donation.quantity}</span></p>
                      <p className="flex items-center gap-3"><Clock size={16} className="text-slate-400" /> <span className="font-medium">Exp: {new Date(donation.expiryTime).toLocaleString()}</span></p>
                    </div>

                    {/* Show Delete Button ONLY if status is PENDING, else show IMPACT CERTIFICATE */}
                    {donation.status === 'PENDING' ? (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button 
                          variant="outline" 
                          onClick={() => deleteDonation(donation._id)}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 font-bold transition-all h-11 rounded-xl"
                        >
                          <Trash2 size={16} className="mr-2" /> Remove Posting
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCertificate(donation)}
                          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/40 font-bold transition-all h-11 rounded-xl bg-amber-50/30 dark:bg-amber-900/10 shadow-sm"
                        >
                          <Award size={18} className="mr-2 text-amber-500" /> View Impact Certificate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/*  THE VIRAL IMPACT CERTIFICATE MODAL */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md mx-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowCertificate(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
            >
              <X size={24} />
            </button>

            {/* Certificate Card */}
            <div 
              ref={certificateRef}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative"
            >
            {/* Premium Gradient Header */}
            <div className="h-32 brand-gradient relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
              <Award size={64} className="text-white drop-shadow-md absolute -bottom-8 bg-white/20 p-2 rounded-full backdrop-blur-md border border-white/30 z-10" />
            </div>
              
              <div className="pt-12 pb-8 px-8 text-center space-y-4 relative">
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">Certificate of Impact</h3>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  You are a Hunger Hero!
                </h2>
                
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  This certifies that you successfully rescued and donated <br/>
                  <strong className="text-indigo-600 dark:text-indigo-400 text-lg">{showCertificate.quantity}</strong> of <strong className="text-slate-900 dark:text-white">{showCertificate.foodCategory}</strong>.
                </p>

                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-left">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date of Impact</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {new Date(showCertificate.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Issued By</p>
                    <p className="text-sm font-black brand-gradient-text flex items-center gap-1 justify-end">
                      <HeartHandshake size={14} className="text-indigo-500" /> HungerBridge
                    </p>
                  </div>
                </div>

                {/* Watermark/Stamp */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none dark:opacity-[0.05]">
                  <Award size={200} />
                </div>
              </div>
            </div>

            {/* Modal Action Buttons (Not included in image) */}
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={downloadCertificate}
                disabled={isDownloading}
                className="flex-1 brand-gradient hover:brightness-110 text-white font-bold h-12 rounded-xl brand-shadow border-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isDownloading ? (
                  <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Saving...</span>
                ) : (
                  <span className="flex items-center gap-2"><Download size={18} /> Download Certificate</span>
                )}
              </Button>
            </div>
            <p className="text-center text-white/60 text-xs mt-3 font-medium flex items-center justify-center gap-1">
              <Share2 size={12} /> Share this on LinkedIn or Instagram!
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
