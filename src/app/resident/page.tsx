"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveResident } from "@/lib/barangayService";

export default function ResidentIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const active = getActiveResident();
    if (active) {
      router.replace("/resident/dashboard");
    } else {
      router.replace("/resident/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans text-white">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#FDB415] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-300 font-bold">Inihahanda ang Citizen Portal...</p>
      </div>
    </div>
  );
}
