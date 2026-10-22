"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getActiveResident,
  setActiveResident,
  getResidentRequests,
} from "@/lib/barangayService";
import type { ResidentProfile, DocumentRequest, BarangayDocumentType } from "@/types/barangay";
import { GovHeader } from "@/components/barangay/GovHeader";
import { DocumentRequestModal } from "@/components/barangay/DocumentRequestModal";
import { RequestTrackerModal } from "@/components/barangay/RequestTrackerModal";
import { OfficialCertificateModal } from "@/components/barangay/OfficialCertificateModal";
import { BlotterModal } from "@/components/barangay/BlotterModal";
import { DigitalBarangayIdModal } from "@/components/barangay/DigitalBarangayIdModal";
import { EmergencySosModal } from "@/components/barangay/EmergencySosModal";
import { AyudaTrackerModal } from "@/components/barangay/AyudaTrackerModal";
import { FacilityBookingModal } from "@/components/barangay/FacilityBookingModal";
import { PwaInstallPrompt } from "@/components/barangay/PwaInstallPrompt";
import {
  Plus,
  CreditCard,
  Gift,
  Calendar,
  AlertTriangle,
  Scale,
  FileText,
  Clock,
  CheckCircle2,
  Package,
  Search,
  ArrowRight,
  MapPin,
  Phone,
  Building2,
  Printer,
  ShieldCheck,
  GraduationCap,
  Home,
  Inbox,
  Hash,
} from "lucide-react";

export default function ResidentDashboardPage() {
  const router = useRouter();
  const [resident, setResident] = useState<ResidentProfile | null>(() => getActiveResident());
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<BarangayDocumentType>("Barangay Indigency");
  const [trackingModalNumber, setTrackingModalNumber] = useState<string | null>(null);
  const [certificateRecord, setCertificateRecord] = useState<DocumentRequest | null>(null);
  const [isBlotterOpen, setIsBlotterOpen] = useState(false);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isAyudaModalOpen, setIsAyudaModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "ready" | "released">("all");

  const refreshData = useCallback(async () => {
    const active = getActiveResident();
    if (!active) {
      router.push("/resident/login");
      return;
    }
    setResident(active);
    const resRequests = await getResidentRequests(active.id || active.contact_number);
    setRequests(resRequests);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    async function syncData() {
      const active = getActiveResident();
      if (!active) {
        router.push("/resident/login");
        return;
      }
      const resRequests = await getResidentRequests(active.id || active.contact_number);
      if (isMounted) {
        setRequests(resRequests);
        setLoading(false);
      }
    }

    syncData();

    const handleSync = () => {
      syncData();
    };

    window.addEventListener("brgy_tibay_data_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener("brgy_tibay_data_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [router]);

  const handleLogout = () => {
    setActiveResident(null);
    router.push("/resident/login");
  };

  const handleOpenDocRequest = (type: BarangayDocumentType = "Barangay Indigency") => {
    setSelectedDocType(type);
    setIsRequestModalOpen(true);
  };

  // Filter & Search
  const filteredRequests = requests.filter((r) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (r.status === "pending" || r.status === "under_review")) ||
      (statusFilter === "ready" && (r.status === "approved" || r.status === "ready_for_pickup")) ||
      (statusFilter === "released" && r.status === "released");

    const matchesSearch =
      searchTerm === "" ||
      r.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading || !resident) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-sm w-full mx-4">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Ikinakarga ang iyong Citizen Dashboard...</p>
        </div>
      </div>
    );
  }

  // Count stats
  const totalCount = requests.length;
  const inProgressCount = requests.filter((r) => r.status === "pending" || r.status === "under_review").length;
  const readyCount = requests.filter((r) => r.status === "approved" || r.status === "ready_for_pickup").length;
  const releasedCount = requests.filter((r) => r.status === "released").length;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8FAFC] text-slate-900">
      
      {/* 1. Official Gov Header */}
      <GovHeader
        activePage="resident"
        resident={resident}
        onLogout={handleLogout}
      />

      {/* ============================================================== */}
      {/* 2. ENTERPRISE CIVIC HERO BANNER                                */}
      {/* ============================================================== */}
      <section className="relative bg-[#0A2540] text-white border-b border-slate-800 overflow-hidden">
        {/* Civic backdrop with dark overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <Image
            src="/images/resident_portal_bg.jpg"
            alt="Civic Center"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2540] via-[#0A2540]/95 to-[#0A2540]/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">
          
          {/* User Profile Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5">
            
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 w-full lg:w-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-amber-400 font-black text-lg sm:text-xl flex items-center justify-center border border-slate-700/80 shadow-md shrink-0 ring-2 ring-amber-400/20">
                {resident.avatar_initials}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/80">
                    Residente
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified Citizen
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
                  Mabuhay, {resident.full_name}
                </h1>

                {/* Mobile-Friendly Metadata Badges (No dangling bullet points) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-slate-300">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-200">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[120px] xs:max-w-none">{resident.purok_zone}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-slate-300">
                    <Hash className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>{resident.id.toUpperCase()}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{resident.contact_number}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile App Quick Action Dock / Desktop Action Bar */}
            <div className="w-full lg:w-auto space-y-2">
              {/* Mobile Highlight CTA: Mag-request */}
              <div className="block lg:hidden">
                <button
                  type="button"
                  onClick={() => handleOpenDocRequest("Barangay Indigency")}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FDB415] to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#0A2540] font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Mag-request ng Dokumento</span>
                </button>
              </div>

              {/* Action Grid: 2-col or 3-col on mobile, flex on desktop */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 lg:flex lg:flex-wrap items-stretch lg:items-center gap-2">
                {/* Desktop-only Mag-request button */}
                <button
                  type="button"
                  onClick={() => handleOpenDocRequest("Barangay Indigency")}
                  className="hidden lg:inline-flex px-3.5 py-2 rounded-xl bg-[#FDB415] hover:bg-amber-400 text-[#0A2540] font-bold text-xs shadow-sm transition cursor-pointer items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mag-request</span>
                </button>

                {/* Aking ID */}
                <button
                  type="button"
                  onClick={() => setIsIdModalOpen(true)}
                  className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 transition-all cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 active:scale-[0.98]"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">Aking ID</span>
                </button>

                {/* Ayuda Ticket */}
                <button
                  type="button"
                  onClick={() => setIsAyudaModalOpen(true)}
                  className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 transition-all cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 active:scale-[0.98]"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Ayuda Ticket</span>
                </button>

                {/* Booking */}
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 transition-all cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 active:scale-[0.98]"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Booking</span>
                </button>

                {/* Blotter */}
                <button
                  type="button"
                  onClick={() => setIsBlotterOpen(true)}
                  className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 transition-all cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 active:scale-[0.98]"
                >
                  <Scale className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                  <span className="truncate">Blotter</span>
                </button>

                {/* SOS Alert */}
                <button
                  type="button"
                  onClick={() => setIsSosModalOpen(true)}
                  className="col-span-2 xs:col-span-1 p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs border border-rose-600 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-200 shrink-0" />
                  <span className="truncate">SOS Alert</span>
                </button>
              </div>
            </div>

          </div>

          {/* Clean Enterprise Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/60 backdrop-blur-xs border border-slate-700/60 transition-all hover:bg-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Kabuuan</span>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white block">{totalCount}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5 truncate">Naitalang Kahilingan</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/60 backdrop-blur-xs border border-slate-700/60 transition-all hover:bg-slate-800/80">
              <div className="flex items-center justify-between text-amber-300/90 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Sinusuri</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-amber-400 block">{inProgressCount}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5 truncate">Nasa Opisina</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/60 backdrop-blur-xs border border-slate-700/60 transition-all hover:bg-slate-800/80">
              <div className="flex items-center justify-between text-blue-300/90 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Handa Na</span>
                <Package className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-blue-300 block">{readyCount}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5 truncate">Sa Window 1</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/60 backdrop-blur-xs border border-slate-700/60 transition-all hover:bg-slate-800/80">
              <div className="flex items-center justify-between text-emerald-300/90 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Nai-release</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block">{releasedCount}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5 truncate">Matagumpay Naibigay</span>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. MAIN DASHBOARD WORKSPACE CONTAINER                          */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full flex-1 space-y-6">
        
        {/* PWA 1-Click Install App Banner */}
        <PwaInstallPrompt />

        {/* Quick Services 3-Card Strip */}
        <div>
          <div className="mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Madalas Hingin na mga Dokumento
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            <button
              type="button"
              onClick={() => handleOpenDocRequest("Barangay Indigency")}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm transition text-left flex items-start justify-between cursor-pointer group"
            >
              <div className="space-y-1.5 pr-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-950">
                    Barangay Indigency
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Libre
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Para sa Scholarship, Ospital, o DSWD Financial Assistance
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenDocRequest("Barangay Clearance")}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm transition text-left flex items-start justify-between cursor-pointer group"
            >
              <div className="space-y-1.5 pr-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-950">
                    Barangay Clearance
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    ₱50.00
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Para sa Trabaho, Postal ID, o Transaksyon sa Bangko
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenDocRequest("Certificate of Residency")}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm transition text-left flex items-start justify-between cursor-pointer group"
            >
              <div className="space-y-1.5 pr-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-950">
                    Cert. of Residency
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    ₱50.00
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Katibayan ng Tirahan para sa Kuryente, Tubig, o Paaralan
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
            </button>

          </div>
        </div>

        {/* ============================================================== */}
        {/* DOCUMENT REQUESTS RECORDS WORKSPACE                            */}
        {/* ============================================================== */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header & Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Aking mga Dokumento
              </h2>
              <p className="text-xs text-slate-500">
                Subaybayan ang estado, buksan ang opisyal na e-sertipiko, o i-track sa barangay.
              </p>
            </div>

            {/* Enterprise Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Maghanap ng Code o Dokumento..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 whitespace-nowrap text-xs ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white font-semibold shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Lahat ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 whitespace-nowrap text-xs ${
                statusFilter === "pending"
                  ? "bg-slate-900 text-white font-semibold shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Sinusuri ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ready")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 whitespace-nowrap text-xs ${
                statusFilter === "ready"
                  ? "bg-slate-900 text-white font-semibold shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Handa ({readyCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("released")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 whitespace-nowrap text-xs ${
                statusFilter === "released"
                  ? "bg-slate-900 text-white font-semibold shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Nai-release ({releasedCount})
            </button>
          </div>

          {/* Requests Content List */}
          {filteredRequests.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                Walang nakitang kahilingan sa talaan.
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Pindutin ang button sa ibaba upang mag-sumite ng iyong unang kahilingan sa Barangay Hall.
              </p>
              <button
                type="button"
                onClick={() => handleOpenDocRequest("Barangay Indigency")}
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-[#0A2540] hover:bg-blue-950 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mag-request ng Dokumento</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const isReadyOrApproved =
                  req.status === "approved" || req.status === "ready_for_pickup" || req.status === "released";

                return (
                  <div
                    key={req.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="space-y-1.5 max-w-2xl w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 select-all">
                          {req.tracking_number}
                        </span>

                        <span className="font-bold text-sm text-slate-900">
                          {req.document_type}
                        </span>

                        {req.is_free ? (
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Libre (₱0)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            ₱{req.fee_amount.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600">
                        <strong className="text-slate-800 font-semibold">Layunin:</strong> {req.purpose}
                      </div>

                      {req.admin_notes && (
                        <div className="text-[11px] text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-start gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-semibold text-slate-900">Tala mula sa Hall:</strong> {req.admin_notes}
                          </div>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-0.5">
                        <span>Pagsusumite: {new Date(req.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</span>
                        {req.issued_at && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Inisyu: {new Date(req.issued_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t border-slate-100 lg:border-t-0">
                      
                      {/* Status Badges */}
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-[10px] text-slate-400 font-medium sm:hidden">Estado:</span>
                        {req.status === "pending" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 text-center">
                            Natanggap
                          </span>
                        )}

                        {req.status === "under_review" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 text-center">
                            Sinusuri
                          </span>
                        )}

                        {req.status === "approved" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 text-center">
                            Inaprubahan
                          </span>
                        )}

                        {req.status === "ready_for_pickup" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200 text-center">
                            Handa sa Window 1
                          </span>
                        )}

                        {req.status === "released" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 text-center">
                            Nai-release
                          </span>
                        )}
                      </div>

                      {/* Action buttons (full width 2-col on mobile, flex on desktop) */}
                      <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                        {/* Action 1: Printable Certificate Modal */}
                        {isReadyOrApproved && (
                          <button
                            type="button"
                            onClick={() => setCertificateRecord(req)}
                            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-[0.98]"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-400" />
                            <span>E-Sertipiko</span>
                          </button>
                        )}

                        {/* Action 2: Milestone Tracker */}
                        <button
                          type="button"
                          onClick={() => setTrackingModalNumber(req.tracking_number)}
                          className={`px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                            !isReadyOrApproved ? "col-span-2 sm:col-span-1" : ""
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Subaybayan</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </section>

      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <p className="font-semibold text-slate-700">
          Barangay Tibay • Citizen E-Services Portal
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Santa Cruz, Laguna • Republika ng Pilipinas
        </p>
      </footer>

      {/* MODALS */}
      {/* 1. Request Wizard */}
      <DocumentRequestModal
        isOpen={isRequestModalOpen}
        initialDocType={selectedDocType}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          setIsRequestModalOpen(false);
          refreshData();
        }}
      />

      {/* 2. Timeline Tracker Modal */}
      <RequestTrackerModal
        isOpen={Boolean(trackingModalNumber)}
        onClose={() => setTrackingModalNumber(null)}
        initialTrackingNumber={trackingModalNumber || ""}
      />

      {/* 3. Official Printable Certificate Modal */}
      <OfficialCertificateModal
        isOpen={Boolean(certificateRecord)}
        onClose={() => setCertificateRecord(null)}
        record={certificateRecord}
      />

      {/* 4. Blotter / Complaint Modal */}
      <BlotterModal
        isOpen={isBlotterOpen}
        onClose={() => setIsBlotterOpen(false)}
        onSuccess={() => setIsBlotterOpen(false)}
      />

      {/* 5. Digital Barangay ID Modal */}
      <DigitalBarangayIdModal
        isOpen={isIdModalOpen}
        onClose={() => setIsIdModalOpen(false)}
        resident={resident}
      />

      {/* 6. Emergency SOS Alert Modal */}
      <EmergencySosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        resident={resident}
      />

      {/* 7. Ayuda & Relief Ticket Modal */}
      <AyudaTrackerModal
        isOpen={isAyudaModalOpen}
        onClose={() => setIsAyudaModalOpen(false)}
        resident={resident}
      />

      {/* 8. Facility & Equipment Booking Modal */}
      <FacilityBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        resident={resident}
      />

    </div>
  );
}
