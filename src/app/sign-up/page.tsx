"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "DONOR",
      phone: "",
    },
  });

  const selectedRole = useWatch({
    control: form.control,
    name: "role",
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (res.ok) {
        toast.success("Please verify your email by entering the OTP.Please check your spam/junk folder if you don't see the mail.");
        if (responseData.isExistingUnverified) {
          setTimeout(() => {
            toast.error("The fields can't be updated as the email is already registered.Check your email for the OTP to verify your account.");
          }, 100); // Delay so it doesn't overlap/hide the first toast
        }
        router.replace(`/verify/${encodeURIComponent(data.email)}`);
      } else {
        toast.error(responseData.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">

      {/* Back to Home Link */}
      <Link href="/" className="absolute top-8 left-8 text-sm font-medium text-white/50 hover:text-white transition-colors z-20 flex items-center gap-2">
        &larr; Back to Home
      </Link>

      {/* Background photo layer */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1600&auto=format&fit=crop')",
          filter: "blur(2px) brightness(0.4)",
        }}
      />
      {/* Darkening gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,5%)]/40 via-[hsl(222,47%,5%)]/60 to-[hsl(222,47%,5%)]/85" />

      {/* Glass card */}
      <Card className="relative z-10 w-full max-w-md glass-card rounded-2xl border-0 p-1">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Join HungerBridge
          </CardTitle>
          <p className="text-sm text-white/55 mt-1">Create your account and start making an impact</p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-white/60 mb-1.5 block">I am registering as a:</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2">
                        {['DONOR', 'NGO', 'VOLUNTEER'].map((roleType) => (
                          <button
                            key={roleType}
                            type="button"
                            onClick={() => field.onChange(roleType)}
                            className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all text-center ${
                              field.value === roleType
                                ? "border-2 border-indigo-400 bg-indigo-500/15 text-indigo-200"
                                : "border border-white/12 bg-white/5 text-white/50 hover:border-indigo-400/40 hover:bg-white/8"
                            }`}
                          >
                            {roleType.charAt(0) + roleType.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-white/60 mb-1.5 block">
                      {selectedRole === 'NGO' ? 'Organization / Food Bank Name' : 'Full Name'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={selectedRole === 'NGO' ? 'e.g., Indian Army' : 'Yash Pandey'}
                        {...field}
                        className="bg-white/5 border border-white/12 text-white placeholder:text-white/25 rounded-lg h-11 focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400/40"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-white/60 mb-1.5 block">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="yash@example.com"
                        {...field}
                        className="bg-white/5 border border-white/12 text-white placeholder:text-white/25 rounded-lg h-11 focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400/40"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-white/60 mb-1.5 block">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Min 6 characters"
                        {...field}
                        className="bg-white/5 border border-white/12 text-white placeholder:text-white/25 rounded-lg h-11 focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400/40"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-white/60 mb-1.5 block">Phone Number <span className="text-white/40 font-normal">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+91 9876543210"
                        {...field}
                        className="bg-white/5 border border-white/12 text-white placeholder:text-white/25 rounded-lg h-11 focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400/40"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 brand-gradient hover:brightness-110 text-white rounded-lg font-semibold text-sm border-0 brand-shadow transition-all mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : "Sign Up"}
              </Button>
            </form>
          </Form>

          <p className="text-sm text-white/45 text-center mt-5">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-indigo-300 font-semibold hover:text-indigo-200">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}