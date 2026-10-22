"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GovHeader } from "@/components/barangay/GovHeader";
import { DocumentRequestModal } from "@/components/barangay/DocumentRequestModal";
import { RequestTrackerModal } from "@/components/barangay/RequestTrackerModal";
import { BlotterModal } from "@/components/barangay/BlotterModal";
import { PwaInstallPrompt } from "@/components/barangay/PwaInstallPrompt";
import type { BarangayDocumentType, DocumentRequest, BlotterReport } from "@/types/barangay";
import {
  Search,
  User,
  ShieldCheck,
  GraduationCap,
  Home,
  Briefcase,
  Users,
  Store,
  Building2,
  Award,
  ClipboardList,
  Coins,
  Sparkles,
  Scale,
  CheckCircle2,
} from "lucide-react";

export default function BarangayHomePage() {
  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<BarangayDocumentType>("Barangay Indigency");
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [trackingCodeToSearch, setTrackingCodeToSearch] = useState("");
  const [isBlotterModalOpen, setIsBlotterModalOpen] = useState(false);

  // Quick Hero Tracking input
  const [heroTrackingInput, setHeroTrackingInput] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleOpenRequest = (type: BarangayDocumentType = "Barangay Indigency") => {
    setSelectedDocType(type);
    setIsRequestModalOpen(true);
  };

  const handleHeroTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroTrackingInput.trim()) {
      setTrackingCodeToSearch(heroTrackingInput.trim());
      setIsTrackerModalOpen(true);
    }
  };

  const handleRequestCreated = (record: DocumentRequest) => {
    setSuccessToast(`Naisumite ang request para sa ${record.document_type} (Tracking Code: ${record.tracking_number})!`);
  };

  const handleBlotterCreated = (report: BlotterReport) => {
    setSuccessToast(`Naitala ang blotter case: ${report.case_number}.`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* 1. Official GovPH Header Bar */}
      <GovHeader activePage="home" />

      {/* Success Notification Banner */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="font-bold opacity-80 hover:opacity-100">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. Hero Section with Real Local Government Hall Background Image */}
      <section className="relative min-h-[540px] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        
        {/* Real Philippine Barangay Hall Facade Background */}
        <div className="absolute inset-0">
          <Image
            src="/images/brgy_hall_facade.jpg"
            alt="Pamahalaang Pambarangay ng Tibay Facade"
            fill
            className="object-cover object-center brightness-[0.42] scale-105 transition-transform duration-1000"
            priority
          />
          {/* Subtle gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-transparent to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2540]/90 via-[#0A2540]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 w-full flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Left Text Column */}
          <div className="max-w-2xl space-y-4 sm:space-y-5 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FDB415] text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Opisyal na E-Services Portal • 24/7 Bukas</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Mabilis at Serbisyong Tapat Para sa Mamamayan ng{" "}
                <span className="text-[#FDB415] underline decoration-[#FDB415] decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8">
                  Barangay Tibay
                </span>
              </h1>
              <p className="text-xs sm:text-base text-slate-200 leading-relaxed font-medium pt-1">
                Mag-request ng Indigency, Clearance, at iba pang opisyal na dokumento online gamit ang iyong cellphone nang hindi na pumipila.
              </p>
            </div>

            {/* Quick Tracking Search Box on Hero */}
            <form
              onSubmit={handleHeroTrackSubmit}
              className="bg-white/95 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl shadow-xl border border-white/40 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto lg:mx-0"
            >
              <div className="flex-1 flex items-center px-3 py-1.5 sm:py-0 gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={heroTrackingInput}
                  onChange={(e) => setHeroTrackingInput(e.target.value)}
                  placeholder="I-type ang Tracking Code..."
                  className="w-full py-1.5 sm:py-2 bg-transparent text-xs font-mono font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl bg-[#0A2540] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition cursor-pointer whitespace-nowrap text-center"
              >
                I-Track ➔
              </button>
            </form>

            {/* Quick Action Badges */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-2.5 pt-2 text-xs">
              <Link
                href="/resident"
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#FDB415] hover:bg-amber-400 text-[#0A2540] font-bold text-xs shadow-md transition flex items-center justify-center gap-2 text-center"
              >
                <User className="w-4 h-4 text-[#0A2540]" />
                <span>Citizen Portal</span>
              </Link>
              <button
                type="button"
                onClick={() => handleOpenRequest("Barangay Indigency")}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Indigency (Libre)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenRequest("Barangay Clearance")}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-600 transition cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <ShieldCheck className="w-4 h-4 text-blue-300" />
                <span>Barangay Clearance</span>
              </button>
            </div>

          </div>

          {/* Right Barangay Seal Card */}
          <div className="hidden lg:flex flex-col items-center justify-center p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-center space-y-3 max-w-sm">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#FDB415] shadow-2xl bg-white mx-auto">
              <Image src="/images/brgy_tibay_seal.jpg" alt="Barangay Tibay Official Seal" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FDB415] block">
                Sagisag ng Katatagan
              </span>
              <h2 className="text-xl font-black text-white">
                BARANGAY TIBAY
              </h2>
              <p className="text-xs text-slate-200 mt-0.5">
                Santa Cruz, Laguna
              </p>
            </div>
            <div className="pt-2 border-t border-white/20 text-[11px] text-slate-300 italic">
              &ldquo;Mabilis at Tapat na Paglilingkod&rdquo;
            </div>
          </div>

        </div>

      </section>

      {/* 2.5 Citizen Account Callout Banner (GovPH Standard) */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-20 w-full">
        <div className="bg-gradient-to-r from-[#0A2540] via-[#0E365E] to-blue-950 rounded-2xl p-5 md:p-6 shadow-xl border border-slate-700 text-white flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FDB415] text-[#0A2540] font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
              <User className="w-6 h-6 text-[#0A2540]" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FDB415] bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  Citizen Portal
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Aktibo 24/7
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-white">
                Subaybayan ang iyong mga kahilingan
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Tingnan ang live status at i-print ang iyong opisyal na sertipiko gamit ang iyong citizen account.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full md:w-auto">
            <Link
              href="/resident"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FDB415] hover:bg-amber-400 text-[#0A2540] font-black text-xs shadow-md transition-all text-center"
            >
              Buksan ang Portal →
            </Link>
            <Link
              href="/resident/login"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/30 backdrop-blur-sm transition-all text-center"
            >
              Demo Login
            </Link>
          </div>
        </div>
      </section>

      {/* PWA 1-Click Install App Banner for Mobile Visitors */}
      <section className="max-w-7xl mx-auto px-4 pt-4 w-full">
        <PwaInstallPrompt />
      </section>

      {/* 3. Core Online Services Grid */}
      <section id="services" className="max-w-7xl mx-auto px-4 py-12 w-full space-y-8 scroll-mt-24">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-blue-900 bg-blue-100 px-3 py-1 rounded-full border border-blue-200 inline-block">
            MGA ONLINE NA SERBISYO
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A2540]">
            Piliin ang Dokumento na Iyong Kinakailangan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Pumili sa ibaba at punan ang simpleng form. Matatanggap mo agad ang iyong opisyal na Tracking Code.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Barangay Indigency */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  LIBRE
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                Barangay Indigency
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Para sa Scholarship, Ospital, Malasakit Center, o DSWD Financial Assistance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRequest("Barangay Indigency")}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#0A2540] hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer text-center"
            >
              Mag-Apply (Libre) ➔
            </button>
          </div>

          {/* Card 2: Barangay Clearance */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  ₱50.00
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                Barangay Clearance
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Para sa pag-aaplay ng trabaho, Postal ID, Passport, at Bank Requirements.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRequest("Barangay Clearance")}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer text-center"
            >
              Kumuha ng Clearance ➔
            </button>
          </div>

          {/* Card 3: Certificate of Residency */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  ₱50.00
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                Certificate of Residency
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Patunay ng paninirahan para sa Meralco, Tubig connection, o School Enrollment.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRequest("Certificate of Residency")}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer text-center"
            >
              Hilingin ang Residency ➔
            </button>
          </div>

          {/* Card 4: First Time Jobseeker (RA 11261) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  LIBRE
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                First Time Jobseeker
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Libre alinsunod sa RA 11261 para sa mga bagong naghahanap ng trabaho.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRequest("First Time Jobseeker (RA 11261)")}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#0A2540] hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer text-center"
            >
              Mag-Request (Libre) ➔
            </button>
          </div>

          {/* Card 5: Low Income Certificate */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  LIBRE
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                Certificate of Low Income
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Katunayan ng limitadong kita ng pamilya para sa ayuda at social pension.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRequest("Certificate of Low Income")}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer text-center"
            >
              Mag-Apply ng Low Income ➔
            </button>
          </div>

          {/* Card 6: Business Clearance */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  ₱200.00
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                Barangay Business Clearance
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Permit para sa sari-sari store, carinderia, at maliliit na negosyo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRequest("Barangay Business Clearance")}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer text-center"
            >
              Kumuha ng Permit ➔
            </button>
          </div>

        </div>

      </section>

      {/* 4. Citizens Charter & Fee Transparency Table */}
      <section id="charter" className="bg-white py-12 border-y border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                CITIZEN&apos;S CHARTER TRANSPARENCY
              </span>
              <h3 className="text-xl font-black text-[#0A2540]">
                Talaan ng Bayarin at Kinakailangang Dokumento
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Alinsunod sa Local Government Code (RA 7160) at Ease of Doing Business Act (RA 11032)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A2540] text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Uri ng Dokumento</th>
                  <th className="py-3 px-4">Opisyal na Bayarin</th>
                  <th className="py-3 px-4">Oras ng Pagproseso</th>
                  <th className="py-3 px-4">Kinakailangan</th>
                  <th className="py-3 px-4">Batas / Batayan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">Barangay Indigency</td>
                  <td className="py-3 px-4 font-black text-emerald-600">LIBRE (₱0.00)</td>
                  <td className="py-3 px-4">Same Day (1-2 Oras)</td>
                  <td className="py-3 px-4">1 Valid ID, Patunay ng Pangangailangan</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">Brgy. Ordinance No. 2024-01</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">First Time Jobseeker</td>
                  <td className="py-3 px-4 font-black text-emerald-600">LIBRE (₱0.00)</td>
                  <td className="py-3 px-4">Same Day</td>
                  <td className="py-3 px-4">Oath of Undertaking, Valid ID</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">Republic Act 11261</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">Barangay Clearance</td>
                  <td className="py-3 px-4 font-bold text-blue-900">₱50.00</td>
                  <td className="py-3 px-4">Same Day</td>
                  <td className="py-3 px-4">1 Valid ID, Cedula (Community Tax)</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">RA 7160 Sec. 152</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">Certificate of Residency</td>
                  <td className="py-3 px-4 font-bold text-blue-900">₱50.00</td>
                  <td className="py-3 px-4">Same Day</td>
                  <td className="py-3 px-4">1 Valid ID, Purok Leader Endorsement</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">Municipal Tax Code</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">Barangay Business Clearance</td>
                  <td className="py-3 px-4 font-bold text-blue-900">₱200.00</td>
                  <td className="py-3 px-4">1-2 Araw ng Paggawa</td>
                  <td className="py-3 px-4">DTI Registration, Sketch of Location</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">RA 7160 Sec. 152(c)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Community Blotter & Peace and Order Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[#3D0A0E] via-[#5B1015] to-[#2B0508] text-white p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-[10px] font-black tracking-widest uppercase bg-amber-400 text-[#5B1015] px-3 py-1 rounded-full">
              KATARUNGANG PAMBARANGAY
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Kompidensyal na Reklamo at Ulat sa Lupon
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              May alitan ba sa kapitbahay, ingay ng videoke past curfew, o usaping pambarangay? Isumite ang iyong ulat online nang ligtas at kompidensyal upang maaksyunan ng Lupon Tagapamayapa.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsBlotterModalOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-[#FDB415] hover:bg-amber-400 text-[#0A2540] font-bold text-xs shadow-md transition cursor-pointer shrink-0 inline-flex items-center gap-2"
          >
            <Scale className="w-4 h-4" />
            <span>Mag-file ng Blotter Report ➔</span>
          </button>
        </div>
      </section>

      {/* 6. Barangay Officials Directory */}
      <section id="officials" className="bg-slate-50 py-12 border-t border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 space-y-6 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pamunuan ng Barangay
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Talaan ng mga Opisyal ng Barangay Tibay
            </h3>
            <p className="text-xs text-slate-500">
              Handang maglingkod sa mamamayan ng Santa Cruz, Laguna
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Award className="w-4 h-4 text-slate-700" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Hon. Eduardo C. Ramirez</h4>
              <span className="text-[10px] font-semibold text-rose-700 uppercase block">Punong Barangay</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-slate-700" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Hon. Josefa M. Del Rosario</h4>
              <span className="text-[10px] font-semibold text-blue-700 uppercase block">Barangay Secretary</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Coins className="w-4 h-4 text-slate-700" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Hon. Manuel T. Alcantara</h4>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase block">Barangay Treasurer</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-slate-700" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Hon. Patricia Mae Gomez</h4>
              <span className="text-[10px] font-semibold text-purple-700 uppercase block">SK Chairperson</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Official Footer */}
      <footer className="bg-[#07172C] text-white py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#FDB415] bg-white">
                <Image src="/images/brgy_tibay_seal.jpg" alt="Seal" fill className="object-cover" />
              </div>
              <span className="font-bold text-sm text-white">BARANGAY TIBAY</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Barangay Hall Complex, National Highway, Santa Cruz, Laguna, Philippines 4009.
            </p>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400">
            <span className="font-semibold text-white block text-xs mb-1">Mabilis na Ugnayan:</span>
            <p>Email: <strong className="text-slate-300">barangay.tibay.laguna@gmail.com</strong></p>
            <p>Telepono: <strong className="text-slate-300">(049) 501-8899</strong></p>
            <p>Desk ng Tanod: <strong className="text-slate-300">0917-888-TIBAY (84229)</strong></p>
          </div>

          <div className="space-y-2 text-[11px] text-slate-400">
            <span className="font-semibold text-white block text-xs mb-1">Tungkol sa Portal:</span>
            <p>
              Opisyal na E-Governance System alinsunod sa Republic Act 11032 (Ease of Doing Business and Efficient Government Service Delivery Act).
            </p>
            <div className="pt-1">
              <Link href="/admin" className="text-[#FDB415] font-semibold hover:underline inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Barangay Officials Login Portal ➔</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} Republika ng Pilipinas • Lalawigan ng Laguna • Barangay Tibay. All Rights Reserved.
        </div>
      </footer>

      {/* Modals */}
      <DocumentRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialDocType={selectedDocType}
        onSuccess={handleRequestCreated}
      />

      <RequestTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        initialTrackingCode={trackingCodeToSearch}
      />

      <BlotterModal
        isOpen={isBlotterModalOpen}
        onClose={() => setIsBlotterModalOpen(false)}
        onSuccess={handleBlotterCreated}
      />

    </div>
  );
}
