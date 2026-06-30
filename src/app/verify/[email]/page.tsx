"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VerifyAccountPage() {
  const router = useRouter();
  const params = useParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: params.email,
          code: code,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Account Verified Successfully! ");
        router.replace("/sign-in");
      } else {
        toast.error(data.message || "Invalid or expired code.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1600&auto=format&fit=crop')",
          filter: "blur(2px) brightness(0.4)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,5%)]/40 via-[hsl(222,47%,5%)]/60 to-[hsl(222,47%,5%)]/85" />

      <Card className="relative z-10 w-full max-w-md glass-card rounded-2xl border-0">
        <CardHeader className="space-y-3 text-center pb-6 relative z-10 pt-10">
          <div className="w-14 h-14 rounded-xl brand-gradient flex items-center justify-center mx-auto mb-2 brand-shadow">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Verify your email
          </CardTitle>
          <CardDescription className="text-white/55 font-medium">
            Enter the 6-digit verification code sent to <br/>
            <span className="font-bold text-white/80">{decodeURIComponent(params.email)}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10 pb-10">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-white/60 text-center block">Verification code</Label>
              <Input 
                type="text"
                maxLength={6}
                placeholder="000000" 
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Only allows numbers
                className="bg-white/5 border border-white/12 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400/40 transition-all h-14 rounded-lg text-center text-2xl tracking-[0.5em] font-bold"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 brand-gradient hover:brightness-110 text-white rounded-xl font-bold text-lg brand-shadow border-0 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={isSubmitting || code.length !== 6}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" /> Verifying...
                </span>
              ) : (
                "Verify Account"
              )}
            </Button>
             
          </form>
        </CardContent>
      </Card>
      
    
    </div>
  );
}