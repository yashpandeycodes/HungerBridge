"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button 
      variant="outline" 
      className="mt-6 md:mt-0 relative z-10 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:border-red-500/30 transition-all rounded-xl h-12 px-6 font-semibold"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      Log Out
    </Button>
  );
}
