"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-4 relative overflow-hidden transition-colors duration-500">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <Card className="w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-3xl relative z-10 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="space-y-3 text-center pb-6 relative z-10 pt-10">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldCheck size={32} className="text-orange-600 dark:text-orange-500" />
          </div>
          <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-500 tracking-tight">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
            Enter the 6-digit verification code sent to <br/>
            <span className="font-bold text-slate-700 dark:text-slate-300">{decodeURIComponent(params.email)}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10 pb-10">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold text-center block">Verification Code</Label>
              <Input 
                type="text"
                maxLength={6}
                placeholder="000000" 
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Only allows numbers
                className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-14 rounded-xl text-center text-2xl tracking-[0.5em] font-bold"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/25 border-0 transition-all hover:scale-[1.02] active:scale-[0.98]" 
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