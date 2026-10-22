"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Building2 } from "lucide-react";
import type { ResidentProfile } from "@/types/barangay";
import { getActiveResident } from "@/lib/barangayService";

interface GovHeaderProps {
  activePage?: "home" | "admin" | "resident";
  resident?: ResidentProfile | null;
  onLogout?: () => void;
}

export function GovHeader({
  activePage = "home",
  resident,
  onLogout,
}: GovHeaderProps) {
  const [pstTime, setPstTime] = useState("");
  const [currentResident] = useState<ResidentProfile | null>(() => resident || getActiveResident());

  useEffect(() => {
    let isMounted = true;
    function updatePst() {
      if (!isMounted) return;
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Manila",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setPstTime(now.toLocaleDateString("en-PH", options) + " PST");
    }

    updatePst();
    const interval = setInterval(updatePst, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [resident]);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-slate-200">
      
      {/* 1. Official Republic of the Philippines Standard Time Bar */}
      <div className="bg-[#0A2540] text-slate-200 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-sans border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-[#FDB415] tracking-wide uppercase text-[9px] sm:text-[10px]">
              GOVPH
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-medium truncate max-w-[140px] xs:max-w-none">
              Republika ng Pilipinas
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[9px] sm:text-[10px] text-slate-300 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline text-slate-400">PST:</span>
            <strong className="text-white">{pstTime || "Live Clock"}</strong>
          </div>
        </div>
      </div>

      {/* 2. Main Local Government Barangay Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Barangay Seal & Title */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
          <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#0A2540] shadow-sm shrink-0 bg-white">
            <Image
              src="/images/brgy_tibay_seal.jpg"
              alt="Opisyal na Sagisag ng Barangay Tibay"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden xs:inline text-[9px] sm:text-[10px] font-extrabold tracking-wider text-blue-900 uppercase">
                Santa Cruz, Laguna
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Online 24/7
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#0A2540] tracking-tight group-hover:text-blue-700 transition-colors truncate">
              BARANGAY TIBAY
            </h1>
            <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium -mt-0.5 truncate max-w-[170px] sm:max-w-none">
              Online E-Serbisyo
            </p>
          </div>
        </Link>

        {/* Dynamic Action Buttons per Role / Page */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* CASE A: RESIDENT IS LOGGED IN ON RESIDENT DASHBOARD */}
          {activePage === "resident" && (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {(resident || currentResident) && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-blue-50/90 border border-blue-200 shadow-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0A2540] text-[#FDB415] font-black text-[11px] sm:text-xs flex items-center justify-center shadow-sm">
                    {(resident || currentResident)?.avatar_initials}
                  </div>
                  <div className="text-left leading-tight hidden md:block">
                    <div className="text-xs font-black text-[#0A2540]">
                      {(resident || currentResident)?.full_name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {(resident || currentResident)?.purok_zone}
                    </div>
                  </div>
                </div>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] sm:text-xs border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden xs:inline">Logout</span>
                </button>
              )}
            </div>
          )}

          {/* CASE B: ADMIN / STAFF CONSOLE */}
          {activePage === "admin" && (
            <div className="flex items-center gap-2.5">
              <div className="px-3 py-1.5 rounded-xl bg-[#0A2540] text-[#FDB415] font-black text-xs border border-blue-900 flex items-center gap-1.5 shadow-sm">
                <Building2 className="w-3.5 h-3.5" />
                <span>Barangay Staff Console</span>
              </div>
            </div>
          )}

          {/* CASE C: HOMEPAGE (CLEAN GOVPH LANDING NAVIGATION) */}
          {activePage === "home" && (
            <div className="flex items-center gap-4">
              {/* Clean Text Navigation Links */}
              <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-600">
                <a
                  href="#services"
                  className="hover:text-blue-900 transition-colors"
                >
                  Mga Serbisyo
                </a>
                <a
                  href="#charter"
                  className="hover:text-blue-900 transition-colors"
                >
                  Citizen&apos;s Charter
                </a>
                <a
                  href="#officials"
                  className="hover:text-blue-900 transition-colors"
                >
                  Opisyal ng Barangay
                </a>
              </nav>

              {/* If a resident is currently logged in, show their active dashboard link */}
              {currentResident && (
                <>
                  <div className="h-4 w-px bg-slate-200 hidden md:block" />
                  <Link
                    href="/resident/dashboard"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0A2540] hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <span>Aking Dashboard ({currentResident.full_name.split(" ")[0]})</span>
                    <span>→</span>
                  </Link>
                </>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 3. Emergency Hotline Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] text-slate-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto text-nowrap gap-3 sm:gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-bold text-rose-700 uppercase text-[9px] sm:text-[10px] tracking-wide inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              Hotlines
            </span>
            <span className="text-slate-700">Tanod: <strong className="text-slate-900 font-semibold">0917-888-TIBAY (84229)</strong></span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700">PNP: <strong className="text-slate-900 font-semibold">(049) 501-2345</strong></span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700">BFP Fire: <strong className="text-slate-900 font-semibold">160</strong></span>
          </div>

          <div className="text-[10px] text-slate-500 font-medium hidden md:block shrink-0">
            Barangay Hall: Lunes – Biyernes, 8:00 AM – 5:00 PM
          </div>
        </div>
      </div>

    </header>
  );
}
