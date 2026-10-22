"use client";

import React, { useState } from "react";
import type { ResidentProfile } from "@/types/barangay";
import { verifyResidentRecord } from "@/lib/barangayService";
import {
  ScanLine,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Home,
  X,
  Search,
  UserX,
  CheckCircle2,
} from "lucide-react";

interface ResidentQrVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResidentQrVerifierModal({
  isOpen,
  onClose,
}: ResidentQrVerifierModalProps) {
  const [query, setQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    resident?: ResidentProfile;
    activeRequestsCount: number;
    hasBlotterCase: boolean;
    blotterCaseDetails?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (manualQuery?: string) => {
    const searchVal = (manualQuery !== undefined ? manualQuery : query).trim();
    if (!searchVal) return;

    setIsVerifying(true);
    // Parse if QR payload e.g. "BRGY-TIBAY-VERIFIED:res-001:Name:Purok"
    const cleanId = searchVal.startsWith("BRGY-TIBAY-VERIFIED:")
      ? searchVal.split(":")[1]
      : searchVal;

    const res = await verifyResidentRecord(cleanId);
    setVerificationResult(res);
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="bg-[#0A2540] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700 shrink-0">
              <ScanLine className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Barangay Hall Security & Lupon Desk
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                Resident ID & QR Verifier
              </h3>
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

        {/* Search / Scan Box */}
        <div className="p-5 sm:p-6 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-2"
          >
            <label className="text-xs font-semibold text-slate-700 block">
              I-scan ang QR Code o I-type ang Resident ID / Pangalan / Contact:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Hal. res-001, 09178234561, o Rochelle..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2 rounded-lg bg-[#0A2540] hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
              >
                {isVerifying ? "Sinusuri..." : "I-Verify ➔"}
              </button>
            </div>

            {/* Quick Test Samples */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5 flex-wrap">
              <span>Subukan:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("res-001");
                  handleVerify("res-001");
                }}
                className="text-slate-800 font-semibold underline hover:text-blue-900 cursor-pointer"
              >
                res-001 (Juan)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("res-002");
                  handleVerify("res-002");
                }}
                className="text-slate-800 font-semibold underline hover:text-blue-900 cursor-pointer"
              >
                res-002 (Maria)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("res-003");
                  handleVerify("res-003");
                }}
                className="text-slate-800 font-semibold underline hover:text-blue-900 cursor-pointer"
              >
                res-003 (Rochelle)
              </button>
            </div>
          </form>

          {/* Verification Results Panel */}
          {verificationResult && (
            <div className="pt-2 border-t border-slate-100">
              {verificationResult.verified && verificationResult.resident ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                  
                  {/* Status Banner */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Opisyal at Rehistradong Residente
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {verificationResult.resident.id.toUpperCase()}
                    </span>
                  </div>

                  {/* Profile Details */}
                  <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="w-12 h-14 rounded-lg bg-slate-800 text-amber-400 font-bold text-lg flex items-center justify-center shrink-0 border border-slate-700">
                      {verificationResult.resident.avatar_initials}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {verificationResult.resident.full_name}
                      </h4>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{verificationResult.resident.purok_zone} • {verificationResult.resident.contact_number}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Home className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{verificationResult.resident.address}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                          {verificationResult.resident.voter_status}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                          {verificationResult.activeRequestsCount} Naitalang Dokumento
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Blotter Security Status */}
                  <div
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                      verificationResult.hasBlotterCase
                        ? "bg-rose-50 border-rose-300 text-rose-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {verificationResult.hasBlotterCase ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span>
                        {verificationResult.hasBlotterCase
                          ? `May Nakabinbing Kasong Pambarangay: ${verificationResult.blotterCaseDetails}`
                          : "CLEARED: Walang Nakabinbing Kaso sa Lupon Tagapamayapa"}
                      </span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-center space-y-1">
                  <UserX className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-800">
                    Hindi Nahanap ang Residente sa Talaan
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Pakitiyak na tama ang Resident ID o numero, o i-rehistro muna ang residente sa system.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition cursor-pointer"
          >
            Isara
          </button>
        </div>

      </div>
    </div>
  );
}
