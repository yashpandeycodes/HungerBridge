"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
        toast.success("Account created successfully!");
        router.push("/sign-in");
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-4 relative overflow-hidden transition-colors duration-500">
      
      {/* Back to Home Link */}
      <Link href="/" className="absolute top-8 left-8 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors z-20 flex items-center gap-2">
        &larr; Back to Home
      </Link>

      {/* Ambient Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <Card className="w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-3xl relative z-10 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="space-y-2 text-center pb-6 relative z-10">
          <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-500 tracking-tight">
            Join HungerBridge
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
            Create an account to start your journey of impact.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-500 dark:text-rose-400" /> 
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="john@example.com" 
                        {...field} 
                        className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-500 dark:text-rose-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Min 6 characters" 
                        {...field} 
                        className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-500 dark:text-rose-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Phone Number <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="+91 9876543210" 
                        {...field} 
                        className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-orange-500 dark:focus:ring-orange-500 dark:text-white transition-all h-12 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-500 dark:text-rose-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">I am registering as a:</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <select 
                          {...field}
                          className="flex h-12 w-full appearance-none items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#121212] px-4 py-2 text-sm ring-offset-white dark:ring-offset-black focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white transition-all"
                        >
                          <option value="DONOR">Donor (I have food to give)</option>
                          <option value="NGO">NGO (I distribute food)</option>
                          <option value="VOLUNTEER">Volunteer (I can deliver food)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-rose-500 dark:text-rose-400" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/25 border-0 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4" 
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
        </CardContent>
        <CardFooter className="flex justify-center pb-8 relative z-10">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500 hover:opacity-80 transition-opacity font-bold">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}