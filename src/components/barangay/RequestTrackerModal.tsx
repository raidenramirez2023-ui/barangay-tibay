"use client";

import React, { useState, useEffect } from "react";
import type { DocumentRequest, RequestStatus } from "@/types/barangay";
import { getRequestByTracking } from "@/lib/barangayService";
import { OfficialCertificateModal } from "@/components/barangay/OfficialCertificateModal";
import { Search, Printer, SearchX, X } from "lucide-react";

interface RequestTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrackingCode?: string;
  initialTrackingNumber?: string;
}

export function RequestTrackerModal({
  isOpen,
  onClose,
  initialTrackingCode = "",
  initialTrackingNumber = "",
}: RequestTrackerModalProps) {
  const [userInput, setUserInput] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentRequest | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

  const currentInput = userInput !== null ? userInput : (initialTrackingCode || initialTrackingNumber);

  useEffect(() => {
    const code = (initialTrackingCode || initialTrackingNumber).trim();
    if (!code || !isOpen) return;

    let isMounted = true;
    getRequestByTracking(code).then((found) => {
      if (isMounted) {
        setResult(found);
        setHasSearched(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialTrackingCode, initialTrackingNumber, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = currentInput.trim();
    if (!query) return;

    setIsSearching(true);
    setHasSearched(true);
    const found = await getRequestByTracking(query);
    setResult(found);
    setIsSearching(false);
  };

  // Status mapping for timeline progress
  const statusLevels: Record<RequestStatus, number> = {
    pending: 1,
    under_review: 2,
    approved: 3,
    ready_for_pickup: 4,
    released: 4,
    rejected: 0,
  };

  const currentLevel = result ? statusLevels[result.status] : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fadeIn">
        
        {/* Modal Top Header */}
        <div className="bg-[#0A2540] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-lg border border-slate-700 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Barangay Tibay E-Serbisyo
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Live Document Tracking Portal
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Tracking Search Input */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Ipasok ang Opisyal na Tracking Code:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={currentInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Hal. BT-2026-IND-0142"
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-sm font-mono font-black uppercase text-slate-900 bg-slate-50"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 rounded-2xl bg-[#0A2540] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>{isSearching ? "Hinahanap..." : "Suriin ➔"}</span>
              </button>
            </div>

            {/* Quick Sample Suggestions */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
              <span>Subukan ang Sample Code:</span>
              <button
                type="button"
                onClick={() => {
                  setUserInput("BT-2026-IND-0142");
                  setIsSearching(true);
                  setHasSearched(true);
                  getRequestByTracking("BT-2026-IND-0142").then((found) => {
                    setResult(found);
                    setIsSearching(false);
                  });
                }}
                className="text-blue-700 font-mono font-bold hover:underline cursor-pointer"
              >
                BT-2026-IND-0142
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setUserInput("BT-2026-IND-0143");
                  setIsSearching(true);
                  setHasSearched(true);
                  getRequestByTracking("BT-2026-IND-0143").then((found) => {
                    setResult(found);
                    setIsSearching(false);
                  });
                }}
                className="text-blue-700 font-mono font-bold hover:underline cursor-pointer"
              >
                BT-2026-IND-0143
              </button>
            </div>
          </form>

          {/* Result Card */}
          {result && (
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
              
              {/* Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="font-mono font-black text-xs text-blue-900 block">
                    {result.tracking_number}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-0.5">
                    {result.document_type}
                  </h4>
                </div>

                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase border ${
                    result.status === "released" || result.status === "ready_for_pickup"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : result.status === "approved"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : result.status === "under_review"
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : result.status === "rejected"
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : "bg-slate-200 text-slate-700 border-slate-300"
                  }`}
                >
                  {result.status.replace("_", " ")}
                </span>
              </div>

              {/* 4-Stage Visual Progress Timeline */}
              <div className="space-y-2 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Antas ng Proseso (Progress Timeline):
                </span>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[
                    { lvl: 1, name: "1. Naisumite" },
                    { lvl: 2, name: "2. Pagsusuri" },
                    { lvl: 3, name: "3. Inaprubahan" },
                    { lvl: 4, name: "4. Handa na" },
                  ].map((step) => {
                    const isDone = currentLevel >= step.lvl;
                    const isCurrent = currentLevel === step.lvl;

                    return (
                      <div
                        key={step.lvl}
                        className={`p-2 rounded-xl border text-[10px] font-bold transition-all ${
                          isCurrent
                            ? "bg-[#0A2540] text-white border-[#0A2540] shadow-sm ring-2 ring-blue-400"
                            : isDone
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-white text-slate-400 border-slate-200"
                        }`}
                      >
                        <span className="block">{isDone ? "✓" : "○"}</span>
                        <span>{step.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin Note / Pickup Instructions */}
              {result.admin_notes && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <span className="font-extrabold block text-[10px] uppercase tracking-wider text-blue-800">
                    Paalala mula sa Barangay Hall:
                  </span>
                  <p className="leading-relaxed font-medium">
                    {result.admin_notes}
                  </p>
                </div>
              )}

              {/* Document Details Table */}
              <div className="space-y-1 text-xs text-slate-600 pt-1">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Pangalan ng Humihiling:</span>
                  <span className="font-bold text-slate-900">{result.full_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Purok / Sona:</span>
                  <span className="font-bold text-slate-900">{result.purok_zone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Layunin (Purpose):</span>
                  <span className="font-bold text-slate-900 truncate max-w-[220px]">{result.purpose}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Bayarin sa Dokumento:</span>
                  <span className="font-black text-emerald-700">
                    {result.is_free ? "LIBRE (FREE OF CHARGE)" : `₱${result.fee_amount.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Petsa ng Pagsusumite:</span>
                  <span className="font-medium text-slate-800">
                    {new Date(result.created_at).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Action Button: View Certificate if approved / ready / released */}
              {(result.status === "approved" || result.status === "ready_for_pickup" || result.status === "released") && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCertOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Buksan ang Opisyal na E-Sertipiko</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Not Found Notice */}
          {hasSearched && !result && !isSearching && (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 space-y-2">
              <SearchX className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800">
                Walang nahanap na dokumento para sa Tracking Code na ito.
              </h4>
              <p className="text-xs text-slate-500">
                Pakitiyak na tama ang pagkakatala ng code (Hal. BT-2026-IND-0142) o mag-file ng bagong online request.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Isara
          </button>
        </div>

      </div>

      {/* Embedded Official Printable Certificate Modal */}
      <OfficialCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        request={result}
      />
    </div>
  );
}
