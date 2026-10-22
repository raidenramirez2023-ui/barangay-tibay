"use client";

import React from "react";
import Image from "next/image";
import type { DocumentRequest } from "@/types/barangay";

interface OfficialCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: DocumentRequest | null;
  record?: DocumentRequest | null;
}

export function OfficialCertificateModal({
  isOpen,
  onClose,
  request: propRequest,
  record,
}: OfficialCertificateModalProps) {
  const request = propRequest || record;
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date();
  const day = today.getDate();
  const monthName = today.toLocaleDateString("en-PH", { month: "long" });
  const year = today.getFullYear();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-300">
        
        {/* Print Action Toolbar (Hidden during actual printing) */}
        <div className="bg-[#0A2540] text-white px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-[#FDB415]">🏛️</span>
            <span className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">
              Opisyal na Kopya • Barangay Tibay
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🖨️ I-Print (PDF)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Isara
            </button>
          </div>
        </div>

        {/* Printable Official Government Document Sheet */}
        <div className="p-4 sm:p-12 bg-white text-slate-900 font-serif relative overflow-x-auto" id="printable-certificate">
          
          {/* Subtle Watermark Seal in Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <div className="w-64 h-64 sm:w-96 sm:h-96 relative">
              <Image src="/images/brgy_tibay_seal.jpg" alt="Watermark Seal" fill className="object-contain" />
            </div>
          </div>

          {/* Official Letterhead Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-slate-900 text-center relative z-10 gap-2">
            <div className="w-12 h-12 sm:w-20 sm:h-20 relative shrink-0">
              <Image src="/images/brgy_tibay_seal.jpg" alt="Barangay Seal" fill className="object-contain" />
            </div>

            <div className="space-y-0.5 leading-tight min-w-0">
              <span className="text-[9px] sm:text-xs uppercase font-sans tracking-widest text-slate-600 block">
                Republic of the Philippines
              </span>
              <span className="text-[8px] sm:text-xs uppercase font-sans tracking-wider text-slate-700 block truncate">
                Province of Laguna • Municipality of Santa Cruz
              </span>
              <h1 className="text-base sm:text-lg font-black font-sans uppercase tracking-tight text-[#0A2540]">
                BARANGAY TIBAY
              </h1>
              <span className="text-[9px] sm:text-[11px] font-sans font-bold tracking-widest text-red-800 uppercase block">
                OFFICE OF THE PUNONG BARANGAY
              </span>
            </div>

            {/* Official QR Code & Tracking Box */}
            <div className="w-12 sm:w-20 text-right shrink-0">
              <div className="border border-slate-400 p-0.5 sm:p-1 bg-slate-50 text-center rounded">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-900 text-white flex items-center justify-center text-[7px] sm:text-[8px] mx-auto font-mono">
                  [ QR SEAL ]
                </div>
                <span className="text-[7px] sm:text-[8px] font-mono font-bold text-slate-600 block mt-0.5">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-4 sm:py-6 relative z-10">
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-wider text-slate-900 underline decoration-slate-900 decoration-2 underline-offset-8">
              {request.document_type.toUpperCase()}
            </h2>
            <span className="text-[10px] sm:text-xs font-sans text-slate-500 tracking-widest uppercase block mt-2">
              Control Number: {request.tracking_number}
            </span>
          </div>

          {/* Salutation */}
          <div className="pt-2 pb-4 text-sm font-bold uppercase tracking-wider relative z-10">
            TO WHOM IT MAY CONCERN:
          </div>

          {/* Body Content according to document type */}
          <div className="text-justify text-sm sm:text-base leading-relaxed space-y-4 text-slate-800 relative z-10 font-serif">
            {request.document_type === "Barangay Indigency" ? (
              <>
                <p className="indent-8">
                  This is to certify that <strong>{request.full_name.toUpperCase()}</strong>, of legal age, {request.civil_status.toLowerCase()}, Filipino, is a bonafide resident of <strong>{request.purok_zone}</strong>, Barangay Tibay, Municipality of Santa Cruz, Province of Laguna.
                </p>
                <p className="indent-8">
                  It is further certified that the aforementioned individual belongs to an <strong>INDIGENT FAMILY</strong> in this community with no sufficient and regular source of monthly income to sustain livelihood and unforeseen emergencies.
                </p>
                <p className="indent-8">
                  This certification of indigency is hereby issued upon the request of the interested party as a requirement for <strong>{request.purpose.toUpperCase()}</strong> and for whatever legal intent it may serve.
                </p>
              </>
            ) : request.document_type === "First Time Jobseeker (RA 11261)" ? (
              <>
                <p className="indent-8">
                  This is to certify that <strong>{request.full_name.toUpperCase()}</strong>, residing at <strong>{request.purok_zone}</strong>, Barangay Tibay, is a qualified beneficiary under <strong>Republic Act No. 11261 (First Time Jobseekers Assistance Act)</strong>.
                </p>
                <p className="indent-8">
                  As such, the said individual is exempt from paying government fees for clearances, certifications, and credentials required in connection with their first employment application.
                </p>
                <p className="indent-8">
                  Issued this {day}th day of {monthName}, {year} for the purpose of <strong>{request.purpose.toUpperCase()}</strong>.
                </p>
              </>
            ) : (
              <>
                <p className="indent-8">
                  This is to certify that <strong>{request.full_name.toUpperCase()}</strong>, residing at <strong>{request.purok_zone}</strong>, Barangay Tibay, is a resident of good moral character with no derogatory record or pending blotter case filed in this office as of this date.
                </p>
                <p className="indent-8">
                  Issued upon the personal request of the subject for <strong>{request.purpose.toUpperCase()}</strong>.
                </p>
              </>
            )}

            <p className="indent-8">
              GIVEN this <strong>{day}th day of {monthName}, {year}</strong> at the Office of the Punong Barangay, Barangay Hall, Barangay Tibay, Santa Cruz, Laguna, Philippines.
            </p>
          </div>

          {/* Signatures & Seal Section */}
          <div className="pt-16 grid grid-cols-2 gap-8 items-end relative z-10 text-xs sm:text-sm font-sans">
            <div>
              <span className="text-[11px] text-slate-500 uppercase block">Prepared & Attested by:</span>
              <div className="mt-8 border-t border-slate-800 pt-1">
                <span className="font-black text-slate-900 block uppercase">HON. JOSEFA M. DEL ROSARIO</span>
                <span className="text-[11px] text-slate-600 block">Barangay Secretary</span>
              </div>

              {/* Dry Seal Stamp */}
              <div className="mt-4 inline-block px-3 py-1.5 border-2 border-dashed border-slate-400 text-slate-400 rounded-lg text-[10px] font-mono tracking-widest uppercase text-center">
                [ OFFICIAL BARANGAY DRY SEAL ]
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 uppercase block">Approved & Issued by:</span>
              <div className="mt-8 border-t border-slate-800 pt-1">
                <span className="font-black text-slate-900 block uppercase text-base">HON. EDUARDO C. RAMIREZ</span>
                <span className="text-[11px] font-bold text-red-900 uppercase block">PUNONG BARANGAY</span>
                <span className="text-[10px] text-slate-500 block">Barangay Tibay, Santa Cruz, Laguna</span>
              </div>
            </div>
          </div>

          {/* Official Document Footer Notice */}
          <div className="mt-12 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] font-sans text-slate-500 relative z-10">
            <span>Official E-Document • Valid with Dry Seal • O.R. Fee: {request.is_free ? "FREE / LIBRE" : `₱${request.fee_amount.toFixed(2)}`}</span>
            <span className="font-mono">BARANGAY TIBAY E-GOV PORTAL • {request.tracking_number}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
