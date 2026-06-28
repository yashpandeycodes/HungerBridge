"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function useIdleTimeout(timeoutMinutes = 15) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const logoutUser = () => {
      toast.error("Session expired due to inactivity. Logging out...", { duration: 5000 });
      // Wait 2 seconds before logging out so the user can read the toast
      setTimeout(() => {
        signOut({ callbackUrl: "/sign-in" }); 
      }, 2000);
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Timeout set in milliseconds (minutes * 60 seconds * 1000 ms)
      timeoutId = setTimeout(logoutUser, timeoutMinutes * 60 * 1000);
    };

    // Reset the timer on these user activities
    const events = ["mousemove", "keydown", "wheel", "click", "touchstart"];
    
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Start the timer initially
    resetTimer();

    // Cleanup function when component unmounts
    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMinutes]);
}