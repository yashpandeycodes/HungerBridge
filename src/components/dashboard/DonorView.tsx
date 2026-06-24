"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export interface CampaignDropdownType {
  _id: string;
  title: string;
  targetMeals: number;
  mealsCollected: number;
}

export default function DonorView() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch("/api/campaigns");
        const json = await res.json();
        if (json.success) setActiveCampaigns(json.data);
      } catch (error) {
        console.error("Failed to fetch campaigns");
      }
    };
    fetchCampaigns();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const analyzeImage = async () => {
    if (!previewBase64) {
      toast.error("Please upload an image first!");
      return;
    }

    setIsAnalyzing(true);
    toast("AI is analyzing the food...", { duration: 3000 });

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
        });
        toast.success("AI successfully categorized the food!");
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
        toast.success("Donation created successfully! NGOs will be notified.");
        
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

  return (
    <div className="w-full max-w-3xl mx-auto relative group">
      {/* Glow Effect behind the card */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-rose-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <Card className="w-full shadow-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-3xl relative overflow-hidden">
        
        <CardHeader className="pb-6 border-b border-slate-200/50 dark:border-white/5">
          <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-500 tracking-tight">
            Donate Food
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium text-base mt-2">
            Upload a photo of the food, and let our GenAI fill in the details.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Image Upload Section */}
            <div className="space-y-4 p-6 border-2 border-dashed border-orange-300 dark:border-orange-500/30 rounded-2xl bg-orange-50/50 dark:bg-orange-500/5 transition-colors relative overflow-hidden group/upload">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover/upload:opacity-100 transition-opacity" />
              
              <div className="space-y-3 relative z-10">
                <Label className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider">Food Photo</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="bg-white/80 dark:bg-black/50 border-slate-200 dark:border-white/10 file:bg-orange-100 file:text-orange-700 file:border-0 file:rounded-full file:px-4 file:py-1 file:font-semibold file:mr-4 hover:file:bg-orange-200 dark:file:bg-orange-500/20 dark:file:text-orange-400 cursor-pointer h-14 pt-3 rounded-xl transition-all"
                />
              </div>
              
              {previewBase64 && (
                <div className="flex flex-col sm:flex-row gap-5 items-center mt-6 p-4 bg-white/60 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5 backdrop-blur-md">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
                    <Image 
                      src={previewBase64} 
                      alt="Food Preview" 
                      fill
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Image ready for processing</p>
                    <Button 
                      type="button" 
                      onClick={analyzeImage} 
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 border-0 transition-all hover:scale-[1.02] active:scale-[0.98] w-full h-12 rounded-xl font-bold"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Analyzing...
                        </span>
                      ) : "✨ Auto-Fill with AI"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold">Food Category / Name</Label>
                <Input 
                  required 
                  name="foodCategory" 
                  placeholder="e.g. 5 boxes of Rice" 
                  value={formData.foodCategory} 
                  onChange={handleChange} 
                  className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold">Estimated Quantity</Label>
                <Input 
                  required 
                  name="quantity" 
                  placeholder="e.g. 10 kg or 20 servings" 
                  value={formData.quantity} 
                  onChange={handleChange} 
                  className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold">Pickup Location (Address)</Label>
                <Input 
                  required 
                  name="pickupLocation" 
                  placeholder="Full address" 
                  value={formData.pickupLocation} 
                  onChange={handleChange} 
                  className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Food Source <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    className="flex h-12 w-full appearance-none items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#121212] px-4 py-2 text-sm ring-offset-white dark:ring-offset-black focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-all"
                    value={formData.foodSource}
                    onChange={(e) => setFormData({ ...formData, foodSource: e.target.value })}
                    required
                  >
                    <option value="Households">Households (Home cooked)</option>
                    <option value="Restaurant surplus">Restaurant Surplus</option>
                    <option value="Events/Weddings">Events / Weddings</option>
                    <option value="Corporate cafeterias">Corporate Cafeterias</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Support an NGO Campaign <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span></label>
                <div className="relative">
                  <select
                    className="flex h-12 w-full appearance-none items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#121212] px-4 py-2 text-sm ring-offset-white dark:ring-offset-black focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-all"
                    value={formData.campaignId}
                    onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                  >
                    <option value="">-- General Donation (Open to all) --</option>
                    {activeCampaigns.map((camp) => (
                      <option key={camp._id} value={camp._id}>
                        {camp.title} (Progress: {camp.mealsCollected} / {camp.targetMeals} meals)
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">If selected, this food goes directly to fulfilling this campaign`s target.</p>
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold">Expiry Time</Label>
                <Input 
                  required 
                  type="datetime-local" 
                  name="expiryTime" 
                  value={formData.expiryTime} 
                  onChange={handleChange} 
                  className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl color-scheme-light dark:color-scheme-dark"
                  style={{ colorScheme: 'inherit' }}
                />
              </div>
            </div>

            {/* Urgent Checkbox */}
            <div className="flex items-center space-x-3 p-4 bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-xl">
              <input 
                type="checkbox" 
                id="isUrgent" 
                checked={formData.isUrgent}
                onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})}
                className="h-5 w-5 text-red-600 dark:text-red-500 rounded-md border-red-300 dark:border-red-500/30 focus:ring-red-500 dark:bg-black/50 transition-all cursor-pointer"
              />
              <Label htmlFor="isUrgent" className="text-red-700 dark:text-red-400 font-bold cursor-pointer select-none">
                Mark as Urgent (Spoils soon - needs immediate pickup)
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/25 border-0 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : "List Food for Donation"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}