"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      variant="outline"
      className="mt-6 md:mt-0 relative z-10 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-xl h-12 px-6 font-semibold"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      Log Out
    </Button>
  );
}
