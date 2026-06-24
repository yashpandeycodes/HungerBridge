"use client";

import { useState, useRef,useEffect } from "react";
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
        toast.success("Donation created successfully!  NGOs will be notified.");
       
        setFormData({ foodCategory: "",
           foodSource: "Households", quantity: "", expiryTime: "", pickupLocation: "", campaignId: "", isUrgent: false });

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
    <Card className="max-w-2xl border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800">Donate Food</CardTitle>
        <CardDescription>Upload a photo of the food, and let our GenAI fill in the details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4 p-4 border-2 border-dashed border-orange-200 rounded-lg bg-orange-50/50">
            <div className="space-y-2">
              <Label>Food Photo</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                ref={fileInputRef}
                className="bg-white"
              />
            </div>
            
            {previewBase64 && (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
               <Image 
               src={previewBase64} 
              alt="Food Preview" 
              width={128} 
              height={128} 
              className="object-cover rounded-md shadow-sm border" 
/>
                <Button 
                  type="button" 
                  onClick={analyzeImage} 
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                >
                  {isAnalyzing ? "Analyzing..." : " Auto-Fill with AI"}
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Food Category / Name</Label>
              <Input required name="foodCategory" placeholder="e.g. 5 boxes of Rice" value={formData.foodCategory} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Estimated Quantity</Label>
              <Input required name="quantity" placeholder="e.g. 10 kg or 20 servings" value={formData.quantity} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pickup Location (Address)</Label>
              <Input required name="pickupLocation" placeholder="Full address" value={formData.pickupLocation} onChange={handleChange} />
            </div>

            <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Food Source <span className="text-red-500">*</span></label>
          <select
            className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.foodSource}
            onChange={(e) => setFormData({ ...formData, foodSource: e.target.value })}
            required
          >
            <option value="Households">Households (Home cooked)</option>
            <option value="Restaurant surplus">Restaurant Surplus</option>
            <option value="Events/Weddings">Events / Weddings</option>
            <option value="Corporate cafeterias">Corporate Cafeterias</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Support an NGO Campaign (Optional)</label>
        <select
            className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
          <p className="text-xs text-slate-500 mt-1">If selected, this food goes directly to fulfilling this campaign`s target.</p>
        </div>

            <div className="space-y-2">
              <Label>Expiry Time</Label>
              <Input required type="datetime-local" name="expiryTime" value={formData.expiryTime} onChange={handleChange} />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="isUrgent" 
              checked={formData.isUrgent}
              onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})}
              className="h-4 w-4 text-orange-600 rounded border-slate-300"
            />
            <Label htmlFor="isUrgent" className="text-red-600 font-medium">Mark as Urgent (Spoils soon)</Label>
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "List Food for Donation"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}