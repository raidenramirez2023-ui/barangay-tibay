"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RotateCcw, Printer, X, CreditCard } from "lucide-react";
import type { ResidentProfile } from "@/types/barangay";

interface DigitalBarangayIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: ResidentProfile | null;
}

export function DigitalBarangayIdModal({
  isOpen,
  onClose,
  resident,
}: DigitalBarangayIdModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen || !resident) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrData = encodeURIComponent(
    `BRGY-TIBAY-VERIFIED:${resident.id}:${resident.full_name}:${resident.purok_zone}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Top Control Bar */}
        <div className="bg-[#0A2540] text-white px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-slate-700">
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Citizen Identity System
              </span>
              <h3 className="text-sm font-bold text-white">
                Digital Barangay ID Card
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{isFlipped ? "Harap" : "Likod"}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FDB415] hover:bg-amber-400 text-[#0A2540] font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">I-Print ID</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ID Card Display Area */}
        <div className="p-4 sm:p-6 bg-slate-100 flex items-center justify-center">
          
          {/* THE OFFICIAL CARD (Aspect ratio standard CR80 credit card ~ 85.6mm x 53.98mm) */}
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300/60 bg-gradient-to-br from-[#0A2540] via-[#0E3864] to-[#0A2540] text-white relative p-5 select-none transition-all">
            
            {/* Holographic security wave background watermark */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#FDB415_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FDB415]/10 blur-2xl pointer-events-none" />

            {!isFlipped ? (
              /* ================= FRONT OF CARD ================= */
              <div className="relative z-10 space-y-4">
                
                {/* Gov Header Header */}
                <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#FDB415] bg-white shadow-sm shrink-0">
                      <Image
                        src="/images/brgy_tibay_seal.jpg"
                        alt="Barangay Seal"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-300 block">
                        Republika ng Pilipinas • Lalawigan ng Laguna
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-white tracking-tight leading-none">
                        BARANGAY TIBAY
                      </h4>
                      <span className="text-[8px] font-bold text-[#FDB415] uppercase tracking-widest block pt-0.5">
                        Opisyal na Resident ID Card
                      </span>
                    </div>
                  </div>

                  {/* Micro Chip Graphic */}
                  <div className="w-9 h-7 rounded-lg bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-500 border border-amber-600/50 shadow-inner flex flex-col justify-around p-1 shrink-0">
                    <div className="w-full h-0.5 bg-amber-700/40" />
                    <div className="w-full h-0.5 bg-amber-700/40" />
                  </div>
                </div>

                {/* Resident Main Info Grid */}
                <div className="flex items-start gap-4">
                  {/* Photo / Avatar with Gold Border */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-20 h-24 rounded-2xl bg-gradient-to-tr from-[#FDB415] to-amber-200 text-[#0A2540] font-black text-2xl flex items-center justify-center border-2 border-white/80 shadow-md">
                      {resident.avatar_initials}
                    </div>
                    <span className="text-[8px] font-black uppercase text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-400/40">
                      ● Verified
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">
                        Pangalan ng Residente
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                        {resident.full_name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block font-bold">Purok / Sona</span>
                        <span className="font-bold text-slate-200 truncate block">{resident.purok_zone}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block font-bold">Voter Status</span>
                        <span className="font-bold text-emerald-300 block">{resident.voter_status}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block font-bold">Kapanganakan</span>
                        <span className="font-mono text-slate-200 block">{resident.birthdate}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block font-bold">Kasarian / Estado</span>
                        <span className="font-bold text-slate-200 block">{resident.civil_status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Bar with Barcode / ID */}
                <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] uppercase text-[#FDB415] tracking-widest block font-extrabold">
                      Citizen Control No.
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-white tracking-widest">
                      {resident.id.toUpperCase()}
                    </span>
                  </div>

                  {/* QR Stamp */}
                  <div className="w-10 h-10 rounded-lg bg-white p-0.5 shadow-md flex items-center justify-center overflow-hidden">
                    <Image
                      src={qrUrl}
                      alt="Verification QR"
                      width={36}
                      height={36}
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </div>

              </div>
            ) : (
              /* ================= BACK OF CARD ================= */
              <div className="relative z-10 space-y-3.5 py-1">
                
                {/* Magnetic strip mock */}
                <div className="-mx-5 h-8 bg-slate-950 border-y border-white/20 flex items-center px-4">
                  <div className="text-[8px] font-mono text-slate-500 tracking-widest">
                    BARANGAY TIBAY CITIZEN DIGITAL IDENTIFICATION SYSTEM
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Large QR code on Back */}
                  <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg shrink-0 border border-slate-300 flex items-center justify-center overflow-hidden">
                    <Image
                      src={qrUrl}
                      alt="Full Verification QR Code"
                      width={88}
                      height={88}
                      unoptimized
                      className="object-contain"
                    />
                  </div>

                  <div className="text-[10px] space-y-1.5 flex-1">
                    <div>
                      <span className="text-[8px] uppercase text-slate-400 font-bold block">Tirahan / Address</span>
                      <span className="text-slate-200 font-medium leading-tight block">{resident.address}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-slate-400 font-bold block">Contact Number</span>
                      <span className="font-mono text-[#FDB415] font-bold block">{resident.contact_number}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-slate-400 font-bold block">Emergency Contact</span>
                      <span className="text-slate-300 block">Barangay Desk: (049) 501-8899</span>
                    </div>
                  </div>
                </div>

                {/* Legal Certification and Signatures */}
                <div className="pt-2 border-t border-white/20 text-center space-y-1">
                  <p className="text-[8px] text-slate-300 leading-tight">
                    Ang card na ito ay patunay ng lehitimong paninirahan sa Barangay Tibay, Santa Cruz, Laguna. Kung mapulot, mangyaring isauli sa pinakamalapit na Barangay Hall.
                  </p>
                  <div className="pt-1 flex items-center justify-around text-[9px]">
                    <div>
                      <div className="w-24 h-0.5 bg-white/40 mb-1 mx-auto" />
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Lagda ng Residente</span>
                    </div>
                    <div>
                      <div className="w-24 h-0.5 bg-white/40 mb-1 mx-auto" />
                      <span className="text-[8px] text-[#FDB415] uppercase font-black block">Hon. Eduardo Ramirez</span>
                      <span className="text-[7px] text-slate-400 block -mt-0.5">Punong Barangay</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 print:hidden">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            💡 I-present ang QR code sa Barangay Hall Window para sa mabilis na verification.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
            >
              I-ikot ang ID ({isFlipped ? "Harap" : "Likod"})
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0A2540] hover:bg-blue-900 text-white font-black text-xs shadow-sm transition-all cursor-pointer"
            >
              Isara
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
