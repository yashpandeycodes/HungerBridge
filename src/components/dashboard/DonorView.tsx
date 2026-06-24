"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Sparkles, AlertCircle, HeartHandshake, Loader2, UploadCloud } from "lucide-react";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    toast("🤖 AI is analyzing the food...", { duration: 3000 });

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
        toast.success("✨ AI successfully categorized the food!");
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
    <div className="w-full max-w-3xl mx-auto relative group animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Dynamic Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-rose-500/30 dark:from-orange-600/20 dark:to-rose-600/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />

      <Card className="w-full shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-rose-500 to-orange-500" />

        <CardHeader className="pb-6 pt-8 border-b border-slate-100 dark:border-slate-800/80 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center shrink-0">
                <HeartHandshake className="text-orange-600 dark:text-orange-500" size={24} />
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
            
            {/* Image Upload Section */}
            <div className="space-y-4">
               <Label className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon size={16} /> Upload Food Photo
               </Label>
               
               <div className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden group/upload
                  ${previewBase64 
                     ? 'border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/10' 
                     : 'border-slate-300 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 bg-slate-50 dark:bg-slate-800/50'
                  }`}
               >
                  {!previewBase64 && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <UploadCloud size={32} className="mb-2 group-hover/upload:text-orange-500 transition-colors" />
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
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md border-2 border-white dark:border-slate-700 shrink-0">
                           <Image src={previewBase64} alt="Food Preview" fill className="object-cover" />
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
                     <div className="h-32 w-full" /> /* Empty space for dropzone */
                  )}
               </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Input Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-bold">Food Category / Name <span className="text-red-500">*</span></Label>
                <Input 
                  required 
                  name="foodCategory" 
                  placeholder="e.g. 5 boxes of Rice" 
                  value={formData.foodCategory} 
                  onChange={handleChange} 
                  className="bg-slate-50 dark:bg-[#121212] border-slate-200 dark:border-slate-800 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-bold">Estimated Quantity <span className="text-red-500">*</span></Label>
                <Input 
                  required 
                  name="quantity" 
                  placeholder="e.g. 10 kg or 20 servings" 
                  value={formData.quantity} 
                  onChange={handleChange} 
                  className="bg-slate-50 dark:bg-[#121212] border-slate-200 dark:border-slate-800 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-bold">Pickup Location (Address) <span className="text-red-500">*</span></Label>
                <Input 
                  required 
                  name="pickupLocation" 
                  placeholder="Full precise address" 
                  value={formData.pickupLocation} 
                  onChange={handleChange} 
                  className="bg-slate-50 dark:bg-[#121212] border-slate-200 dark:border-slate-800 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-bold">Food Source <span className="text-red-500">*</span></Label>
                <select
                  name="foodSource"
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121212] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-all appearance-none cursor-pointer"
                  value={formData.foodSource}
                  onChange={handleChange}
                  required
                >
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
                <select
                  name="campaignId"
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121212] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-all appearance-none cursor-pointer"
                  value={formData.campaignId}
                  onChange={handleChange}
                >
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
                <Input 
                  required 
                  type="datetime-local" 
                  name="expiryTime" 
                  value={formData.expiryTime} 
                  onChange={handleChange} 
                  className="bg-slate-50 dark:bg-[#121212] border-slate-200 dark:border-slate-800 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                  style={{ colorScheme: 'inherit' }}
                />
              </div>
            </div>

            {/* Urgent Checkbox - Premium Style */}
            <div className="flex items-center space-x-3 p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl transition-colors hover:border-red-300 dark:hover:border-red-800/80">
              <input 
                type="checkbox" 
                id="isUrgent" 
                checked={formData.isUrgent}
                onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})}
                className="h-5 w-5 text-red-600 dark:text-red-500 rounded border-red-300 dark:border-red-800 focus:ring-red-500 dark:focus:ring-red-500 dark:bg-black transition-all cursor-pointer accent-red-600"
              />
              <Label htmlFor="isUrgent" className="text-red-700 dark:text-red-400 font-bold cursor-pointer select-none flex items-center gap-2">
                <AlertCircle size={18} /> Mark as Urgent (Spoils soon - needs immediate pickup)
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg shadow-md border-0 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" /> Submitting...
                </span>
              ) : "List Food for Donation"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}