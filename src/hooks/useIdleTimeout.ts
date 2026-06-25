"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function useIdleTimeout(timeoutMinutes = 15) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const logoutUser = () => {
      toast.error("Session expired due to inactivity. Logging out...", { duration: 5000 });
      // 2 second baad logout kar dega taaki user ko toast padhne ka time mile
      setTimeout(() => {
        signOut({ callbackUrl: "/login" }); 
      }, 2000);
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Timeout set in milliseconds (minutes * 60 seconds * 1000 ms)
      timeoutId = setTimeout(logoutUser, timeoutMinutes * 60 * 1000);
    };

    // User ki in harkaton par timer wapas zero se shuru ho jayega
    const events = ["mousemove", "keydown", "wheel", "click", "touchstart"];
    
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Pehli baar timer start karna
    resetTimer();

    // Cleanup function jab component unmount ho
    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMinutes]);
}