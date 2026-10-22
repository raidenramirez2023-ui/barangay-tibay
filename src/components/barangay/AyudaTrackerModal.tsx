"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { ResidentProfile, AyudaClaim, AyudaProgram } from "@/types/barangay";
import { getAyudaPrograms, getResidentAyudaClaims } from "@/lib/barangayService";
import {
  Gift,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  MapPin,
  Info,
  ShieldCheck,
} from "lucide-react";

interface AyudaTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: ResidentProfile | null;
}

export function AyudaTrackerModal({
  isOpen,
  onClose,
  resident,
}: AyudaTrackerModalProps) {
  const [programs, setPrograms] = useState<AyudaProgram[]>([]);
  const [claims, setClaims] = useState<AyudaClaim[]>([]);

  useEffect(() => {
    if (!isOpen || !resident) return;

    let isMounted = true;
    async function fetchAyuda() {
      const [allProgs, residentClaims] = await Promise.all([
        getAyudaPrograms(),
        getResidentAyudaClaims(resident?.id || resident?.contact_number || ""),
      ]);

      if (isMounted) {
        setPrograms(allProgs);
        setClaims(residentClaims);
      }
    }

    fetchAyuda();

    const handleSync = () => {
      fetchAyuda();
    };

    window.addEventListener("brgy_tibay_data_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener("brgy_tibay_data_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [isOpen, resident]);

  if (!isOpen || !resident) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700 shrink-0">
              <Gift className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  Social Welfare & Relief Distribution
                </span>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Census Verified
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Ayuda & Relief Distribution Claim Stub
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Active Ayuda Programs Announcement */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Mga Anunsyo ng Pamamahagi sa Barangay
              </span>
              <span className="text-[11px] text-slate-400">
                Alinsunod sa Official Masterlist
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    prog.status === "ongoing"
                      ? "bg-slate-50 border-slate-300 shadow-xs"
                      : "bg-slate-50/70 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        prog.status === "ongoing"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
                          : "bg-slate-200 text-slate-700 border-slate-300"
                      }`}
                    >
                      {prog.status === "ongoing" ? "Kasalukuyang Ipinapamahagi" : "Parating Na"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{prog.title}</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{prog.item_details}</p>
                  <div className="pt-1.5 text-[11px] text-slate-500 space-y-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{prog.distribution_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{prog.distribution_venue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resident Specific Official Claim Stub (Wag nang QR, Claim Stub nalang) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Aking Opisyal na Claim Stub / Katunayan ng Ayuda
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Opisyal na Tala mula sa Barangay Hall
              </span>
            </div>

            {claims.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <Info className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
                <h4 className="text-xs font-bold text-slate-800">
                  Wala pang naka-tag na Ayuda Claim Stub para sa inyong sambahayan sa kasalukuyan.
                </h4>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                  Kapag nag-anunsyo ang Barangay Staff at na-verify kayo sa <strong>Census Masterlist</strong>, awtomatikong lilitaw dito ang inyong Opisyal na Claim Stub na dadalhin sa Barangay Hall.
                </p>
              </div>
            ) : (
              claims.map((claim) => {
                const isClaimed = claim.status === "claimed";
                const stubNumber = claim.claim_stub_number || claim.qr_claim_code || "STUB-2026-AID-001";

                return (
                  <div
                    key={claim.id}
                    className={`rounded-xl border overflow-hidden shadow-xs transition-all ${
                      isClaimed
                        ? "bg-slate-50 border-slate-200"
                        : "bg-white border-slate-300 ring-1 ring-slate-200"
                    }`}
                  >
                    {/* Official Claim Stub Top Bar */}
                    <div className="bg-[#0A2540] text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5 rounded-full overflow-hidden bg-white shrink-0">
                          <Image
                            src="/images/brgy_tibay_seal.jpg"
                            alt="Seal"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-semibold tracking-wide text-[9px] sm:text-[10px] uppercase text-slate-200 truncate max-w-[160px] xs:max-w-none">
                          Barangay Tibay • Ayuda Claim Stub
                        </span>
                      </div>
                      <span className="font-mono text-[11px] sm:text-xs font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
                        {stubNumber}
                      </span>
                    </div>

                    {/* Official Physical Voucher Body */}
                    <div className="p-4 sm:p-5 space-y-4">
                      
                      {/* Program Title & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                            Programa ng Tulong
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            {claim.program_title}
                          </h4>
                        </div>

                        <div>
                          {isClaimed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                              NAKUHA NA (CLAIMED)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              KASAMA SA MASTERLIST (Handa nang Kunin)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Official Stub Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Benepisyaryo</span>
                          <span className="font-bold text-slate-900 block truncate">{claim.resident_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Purok / Zone</span>
                          <span className="font-semibold text-slate-800 block">{claim.purok_zone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Resident ID</span>
                          <span className="font-mono text-slate-800 block">{claim.resident_id.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact</span>
                          <span className="font-mono text-slate-800 block">{claim.contact_number}</span>
                        </div>
                      </div>

                      {/* Prominent Claim Stub Number Box */}
                      <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="space-y-0.5 text-center sm:text-left">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                            Ipakita sa Barangay Hall Distribution Desk
                          </span>
                          <div className="text-lg sm:text-xl font-mono font-bold tracking-wider text-white">
                            {stubNumber}
                          </div>
                          <span className="text-[11px] text-slate-300 block">
                            Wala nang QR code na kailangan. Banggitin o i-presenta lamang ang numero na ito.
                          </span>
                        </div>

                        <div className="shrink-0 text-center sm:text-right">
                          <div className="text-[10px] text-slate-300 uppercase font-semibold">Lugar ng Claim:</div>
                          <div className="text-xs font-bold text-amber-300">Covered Court • Window 1</div>
                        </div>
                      </div>

                      {/* Instructions / Release Status */}
                      {isClaimed ? (
                        <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Naipagkaloob na noong: </strong>
                            <span>{claim.claimed_at ? new Date(claim.claimed_at).toLocaleString("fil-PH") : "Kamakailan"}</span>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Pangalan ng Kumuha: <strong>{claim.claimed_by_representative || claim.resident_name}</strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <strong>Paalala sa Pagkuha:</strong> Magtungo sa Barangay Hall sa takdang araw ng pamamahagi. Magdala ng <strong>1 Valid ID</strong> (PhilSys National ID, Voter&apos;s ID, o Senior ID) at ipakita ang <strong>Claim Stub Number</strong> na ito upang matanggap ang iyong ayuda.
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>I-Print ang Claim Stub</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition cursor-pointer"
          >
            Isara
          </button>
        </div>

      </div>
    </div>
  );
}
