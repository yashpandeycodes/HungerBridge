"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { HeartHandshake } from "lucide-react";

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

import { signInSchema } from "@/schemas/signInSchema";

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCallbackUrl = () => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    return params.get("callbackUrl") || "/dashboard";
  };

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl: getCallbackUrl(),
      });

      if (result?.error) {
        toast.error(result.error || "Invalid email or password");
      } else {
        toast.success("Welcome back!");
        window.location.assign(getCallbackUrl());
      }
    } catch (error) {
      toast.error("An error occurred during login.");
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
            "url('https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1600&auto=format&fit=crop')",
          filter: "blur(2px) brightness(0.4)",
        }}
      />
      {/* Darkening gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,5%)]/40 via-[hsl(222,47%,5%)]/60 to-[hsl(222,47%,5%)]/85" />

      {/* Glass card */}
      <Card className="relative z-10 w-full max-w-md glass-card rounded-2xl border-0 p-1">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl brand-gradient flex items-center justify-center brand-shadow">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Welcome back
          </CardTitle>
          <p className="text-sm text-white/55 mt-1">Sign in to continue your impact</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-white/60 mb-1.5 block">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
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
                        placeholder="••••••••"
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
                    <span>Logging in...</span>
                  </div>
                ) : "Log In"}
              </Button>
            </form>
          </Form>

          <p className="text-sm text-white/45 text-center mt-5">
            Don`t have an account?{" "}
            <Link href="/sign-up" className="text-indigo-300 font-semibold hover:text-indigo-200">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}