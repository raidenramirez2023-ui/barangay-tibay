"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Barangay Tibay PWA Service Worker Registered:", registration.scope);
          })
          .catch((err) => {
            console.log("PWA Service Worker Registration error:", err);
          });
      });
    }
  }, []);

  return null;
}
