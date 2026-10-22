"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GovHeader } from "@/components/barangay/GovHeader";
import { OfficialCertificateModal } from "@/components/barangay/OfficialCertificateModal";
import { ResidentQrVerifierModal } from "@/components/barangay/ResidentQrVerifierModal";
import {
  getDocumentRequests,
  updateRequestStatus,
  getBlotterReports,
  getAnnouncements,
  getEmergencyAlerts,
  updateEmergencyAlertStatus,
  getAyudaPrograms,
  getAyudaClaims,
  processAyudaClaim,
  enrollResidentsToAyudaProgram,
  getAllResidents,
  getFacilityBookings,
  updateFacilityBookingStatus,
} from "@/lib/barangayService";
import type {
  DocumentRequest,
  RequestStatus,
  BlotterReport,
  BarangayAnnouncement,
  EmergencyAlert,
  AyudaProgram,
  AyudaClaim,
  FacilityBooking,
  BookingStatus,
  ResidentProfile,
} from "@/types/barangay";
import {
  FileText,
  AlertTriangle,
  Scale,
  Megaphone,
  Gift,
  Calendar,
  Building2,
  Volume2,
  VolumeX,
  ScanLine,
  LogOut,
  Bell,
  BellOff,
  Users,
  CheckCircle2,
  Send,
  Search,
  CheckSquare,
} from "lucide-react";

export default function BarangayAdminDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [blotters, setBlotters] = useState<BlotterReport[]>([]);
  const [announcements, setAnnouncements] = useState<BarangayAnnouncement[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>([]);
  const [ayudaPrograms, setAyudaPrograms] = useState<AyudaProgram[]>([]);
  const [ayudaClaims, setAyudaClaims] = useState<AyudaClaim[]>([]);
  const [facilityBookings, setFacilityBookings] = useState<FacilityBooking[]>([]);
  
  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useState<
    "requests" | "blotters" | "announcements" | "emergencies" | "ayuda" | "bookings"
  >("requests");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);

  // Ayuda Scanner & Releasing state
  const [ayudaScanQuery, setAyudaScanQuery] = useState("");
  const [ayudaRepresentative, setAyudaRepresentative] = useState("");
  const [ayudaScanResult, setAyudaScanResult] = useState<{
    success: boolean;
    message: string;
    claim?: AyudaClaim;
    alreadyClaimed?: boolean;
  } | null>(null);

  // Ayuda Census Masterlist Enrollment State
  const [censusResidents, setCensusResidents] = useState<ResidentProfile[]>(() => getAllResidents());
  const [selectedAyudaProgramId, setSelectedAyudaProgramId] = useState<string>("ayuda-prog-001");
  const [selectedResidentIds, setSelectedResidentIds] = useState<string[]>([]);
  const [ayudaSubTab, setAyudaSubTab] = useState<"masterlist" | "releasing">("masterlist");
  const [ayudaPurokFilter, setAyudaPurokFilter] = useState<string>("all");
  const [enrollFeedback, setEnrollFeedback] = useState<string | null>(null);
  const [censusSearch, setCensusSearch] = useState<string>("");

  // Audio Sound Siren System for Emergency SOS
  const sirenCleanupRef = useRef<(() => void) | null>(null);
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const [isTestingSiren, setIsTestingSiren] = useState(false);

  const hasActiveEmergencies = emergencies.some((e) => e.status === "active");
  const isAlarmPlaying = (hasActiveEmergencies && !isAlarmMuted) || isTestingSiren;

  const stopSiren = useCallback(() => {
    if (sirenCleanupRef.current) {
      sirenCleanupRef.current();
      sirenCleanupRef.current = null;
    }
  }, []);

  const startSiren = useCallback(() => {
    if (typeof window === "undefined") return;
    stopSiren();

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Master output gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, ctx.currentTime);

      // Acoustic megaphone / siren horn speaker filter
      const hornFilter = ctx.createBiquadFilter();
      hornFilter.type = "lowpass";
      hornFilter.frequency.setValueAtTime(2800, ctx.currentTime);
      hornFilter.Q.setValueAtTime(2.6, ctx.currentTime);

      // Primary horn oscillator (Sawtooth - piercing emergency vehicle bite)
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";

      // Secondary layered oscillator (Square with detune - adds thick presence)
      const osc2 = ctx.createOscillator();
      osc2.type = "square";
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.35, ctx.currentTime);

      // Sub-harmonic oscillator (Triangle - low rumble body punch)
      const oscSub = ctx.createOscillator();
      oscSub.type = "triangle";
      const oscSubGain = ctx.createGain();
      oscSubGain.gain.setValueAtTime(0.25, ctx.currentTime);

      // Connect audio routing
      osc1.connect(hornFilter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(hornFilter);
      oscSub.connect(oscSubGain);
      oscSubGain.connect(hornFilter);

      hornFilter.connect(masterGain);
      masterGain.connect(ctx.destination);

      const startTime = ctx.currentTime;
      osc1.start(startTime);
      osc2.start(startTime);
      oscSub.start(startTime);

      // =========================================================================
      // UNIFIED PHILIPPINE AMBULANCE EMERGENCY SIREN (3-IN-1 AUTOMATIC SEQUENCE)
      // Phase 1 (0.0s - 2.4s): Classic Long Wail (Paakyat-pababang hiyaw)
      // Phase 2 (2.4s - 4.8s): Philippine Two-Tone Wang-Wang (DOH/Red Cross Hi-Lo)
      // Phase 3 (4.8s - 7.2s): Rapid Piercer Yelp (Mabilisang pag-clear sa trapiko)
      // Automatically loops seamlessly every 7.2 seconds!
      // =========================================================================
      const loopDuration = 7.2;

      const scheduleCombinedSequence = (baseTime: number) => {
        // --- PHASE 1: Long Wail Siren (2 cycles: 0.0s - 2.4s) ---
        // Wail 1: 0.0s - 1.2s
        osc1.frequency.setValueAtTime(620, baseTime);
        osc1.frequency.exponentialRampToValueAtTime(1380, baseTime + 0.6);
        osc1.frequency.exponentialRampToValueAtTime(620, baseTime + 1.2);
        osc2.frequency.setValueAtTime(624, baseTime);
        osc2.frequency.exponentialRampToValueAtTime(1385, baseTime + 0.6);
        osc2.frequency.exponentialRampToValueAtTime(624, baseTime + 1.2);
        oscSub.frequency.setValueAtTime(310, baseTime);
        oscSub.frequency.exponentialRampToValueAtTime(690, baseTime + 0.6);
        oscSub.frequency.exponentialRampToValueAtTime(310, baseTime + 1.2);

        // Wail 2: 1.2s - 2.4s
        osc1.frequency.setValueAtTime(620, baseTime + 1.2);
        osc1.frequency.exponentialRampToValueAtTime(1380, baseTime + 1.8);
        osc1.frequency.exponentialRampToValueAtTime(620, baseTime + 2.4);
        osc2.frequency.setValueAtTime(624, baseTime + 1.2);
        osc2.frequency.exponentialRampToValueAtTime(1385, baseTime + 1.8);
        osc2.frequency.exponentialRampToValueAtTime(624, baseTime + 2.4);
        oscSub.frequency.setValueAtTime(310, baseTime + 1.2);
        oscSub.frequency.exponentialRampToValueAtTime(690, baseTime + 1.8);
        oscSub.frequency.exponentialRampToValueAtTime(310, baseTime + 2.4);

        // --- PHASE 2: Philippine Wang-Wang Two-Tone (2.4s - 4.8s) ---
        // 6 alternating beats of 0.40s each (Hi 920Hz / Lo 690Hz) with 35ms portamento
        for (let i = 0; i < 6; i++) {
          const beatStart = baseTime + 2.4 + i * 0.4;
          const isHigh = i % 2 === 0;
          const target = isHigh ? 920 : 690;
          const target2 = isHigh ? 925 : 695;
          const targetSub = isHigh ? 460 : 345;

          osc1.frequency.setValueAtTime(target, beatStart);
          osc1.frequency.exponentialRampToValueAtTime(target, beatStart + 0.035);
          osc2.frequency.setValueAtTime(target2, beatStart);
          osc2.frequency.exponentialRampToValueAtTime(target2, beatStart + 0.035);
          oscSub.frequency.setValueAtTime(targetSub, beatStart);
          oscSub.frequency.exponentialRampToValueAtTime(targetSub, beatStart + 0.035);
        }

        // --- PHASE 3: Rapid Yelp Siren (4.8s - 7.2s) ---
        // 8 rapid bursts of 0.30s each (720Hz -> 1450Hz -> 720Hz)
        for (let j = 0; j < 8; j++) {
          const yelpStart = baseTime + 4.8 + j * 0.3;
          const yelpPeak = yelpStart + 0.15;
          const yelpEnd = yelpStart + 0.3;

          osc1.frequency.setValueAtTime(720, yelpStart);
          osc1.frequency.exponentialRampToValueAtTime(1450, yelpPeak);
          osc1.frequency.exponentialRampToValueAtTime(720, yelpEnd);
          osc2.frequency.setValueAtTime(725, yelpStart);
          osc2.frequency.exponentialRampToValueAtTime(1455, yelpPeak);
          osc2.frequency.exponentialRampToValueAtTime(725, yelpEnd);
          oscSub.frequency.setValueAtTime(360, yelpStart);
          oscSub.frequency.exponentialRampToValueAtTime(725, yelpPeak);
          oscSub.frequency.exponentialRampToValueAtTime(360, yelpEnd);
        }
      };

      // Initial schedule
      scheduleCombinedSequence(ctx.currentTime);

      // Loop scheduling: re-schedule right before the loop ends
      let nextLoopTime = ctx.currentTime + loopDuration;
      const interval = setInterval(() => {
        if (ctx.state === "running") {
          scheduleCombinedSequence(nextLoopTime);
          nextLoopTime += loopDuration;
        }
      }, (loopDuration - 0.6) * 1000);

      sirenCleanupRef.current = () => {
        clearInterval(interval);
        try {
          const fadeOutTime = ctx.currentTime + 0.12;
          masterGain.gain.exponentialRampToValueAtTime(0.001, fadeOutTime);
          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
              oscSub.stop();
              osc1.disconnect();
              osc2.disconnect();
              oscSub.disconnect();
              hornFilter.disconnect();
              masterGain.disconnect();
              ctx.close();
            } catch {
              // ignore
            }
          }, 180);
        } catch {
          // ignore
        }
      };
    } catch (err) {
      console.warn("Could not start siren audio:", err);
    }
  }, [stopSiren]);

  // Synchronize audio state with Web Audio API without triggering setState in effect
  useEffect(() => {
    if (isAlarmPlaying) {
      startSiren();
    } else {
      stopSiren();
    }

    return () => {
      stopSiren();
    };
  }, [isAlarmPlaying, startSiren, stopSiren]);
  
  // Printing Certificate
  const [selectedForPrint, setSelectedForPrint] = useState<DocumentRequest | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Load data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [reqs, blts, anns, emgs, progs, clms, bks] = await Promise.all([
        getDocumentRequests(),
        getBlotterReports(),
        getAnnouncements(),
        getEmergencyAlerts(),
        getAyudaPrograms(),
        getAyudaClaims(),
        getFacilityBookings(),
      ]);
      if (isMounted) {
        setRequests(reqs);
        setBlotters(blts);
        setAnnouncements(anns);
        setEmergencies(emgs);
        setAyudaPrograms(progs);
        setAyudaClaims(clms);
        setFacilityBookings(bks);
        setCensusResidents(getAllResidents());
      }
    }
    loadData();

    // 1. Cross-device real-time sync poll (Phone -> Admin PC)
    const pollTimer = setInterval(async () => {
      try {
        const [latestEmgs, latestReqs] = await Promise.all([
          getEmergencyAlerts(),
          getDocumentRequests(),
        ]);
        if (isMounted) {
          setEmergencies(latestEmgs);
          setRequests(latestReqs);
        }
      } catch {
        // ignore
      }
    }, 3500);

    const handleSync = () => {
      loadData();
    };

    window.addEventListener("brgy_tibay_data_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      window.removeEventListener("brgy_tibay_data_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Status transition handler
  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    let note = "";
    if (newStatus === "approved") {
      note = "Inaprubahan ng Tanggapan ng Punong Barangay. Isinasagawa na ang pag-imprenta.";
    } else if (newStatus === "ready_for_pickup") {
      note = "Handa nang kunin sa Barangay Hall Window 1. Magdala ng 1 valid ID at bayad kung may kaukulang fee.";
    } else if (newStatus === "released") {
      note = "Matagumpay na naibigay ang orihinal na dokumento sa humihiling.";
    }

    const res = await updateRequestStatus(id, newStatus, note);
    if (res.success && res.data) {
      setRequests((prev) => prev.map((r) => (r.id === id ? res.data! : r)));
    }
  };

  // Emergency SOS dispatch and resolve handler
  const handleEmergencyStatus = async (id: string, newStatus: "dispatched" | "resolved") => {
    const res = await updateEmergencyAlertStatus(id, newStatus);
    if (res.success && res.data) {
      setEmergencies((prev) => prev.map((e) => (e.id === id ? res.data! : e)));
    }
  };

  // Ayuda Stub & claim processing handler (Anti-Doble Claim)
  const handleAyudaScan = async (queryToUse?: string) => {
    const q = (queryToUse || ayudaScanQuery).trim();
    if (!q) return;
    const res = await processAyudaClaim(q, ayudaRepresentative);
    setAyudaScanResult(res);
    if (res.success && res.claim) {
      setAyudaClaims((prev) => prev.map((c) => (c.id === res.claim!.id ? res.claim! : c)));
      setAyudaRepresentative("");
    }
  };

  // Census Masterlist Ayuda Enrollment
  const handleEnrollResidents = async () => {
    if (selectedResidentIds.length === 0) return;
    const currentProgId = selectedAyudaProgramId || ayudaPrograms[0]?.id || "ayuda-prog-001";
    const res = await enrollResidentsToAyudaProgram(currentProgId, selectedResidentIds);
    setEnrollFeedback(`Matagumpay na naipadala ang Opisyal na Claim Stub sa ${res.addedCount} residente!`);
    setSelectedResidentIds([]);
    setAyudaClaims(res.updatedClaims);
    setTimeout(() => setEnrollFeedback(null), 5000);
  };

  const handleToggleSelectResident = (id: string) => {
    setSelectedResidentIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleSelectAllInPurok = (purok: string) => {
    const matching = censusResidents
      .filter((r) => purok === "all" || r.purok_zone === purok)
      .map((r) => r.id);
    setSelectedResidentIds((prev) => {
      const allSelected = matching.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !matching.includes(id));
      } else {
        return Array.from(new Set([...prev, ...matching]));
      }
    });
  };

  // Facility Booking status change handler
  const handleBookingStatusChange = async (id: string, newStatus: BookingStatus, notes?: string) => {
    const res = await updateFacilityBookingStatus(id, newStatus, notes);
    if (res.success && res.data) {
      setFacilityBookings((prev) => prev.map((b) => (b.id === id ? res.data! : b)));
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (r.status === "pending" || r.status === "under_review")) ||
      (statusFilter === "ready" && (r.status === "approved" || r.status === "ready_for_pickup")) ||
      (statusFilter === "released" && r.status === "released");
    const matchesSearch =
      searchTerm === "" ||
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purok_zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Summary Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "pending" || r.status === "under_review").length;
  const readyCount = requests.filter((r) => r.status === "approved" || r.status === "ready_for_pickup").length;
  const releasedCount = requests.filter((r) => r.status === "released").length;
  const activeEmergencies = emergencies.filter((e) => e.status === "active");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* GovPH Header */}
      <GovHeader activePage="admin" />

      {/* Real-time Emergency SOS Alert Banner with Siren Controls */}
      {activeEmergencies.length > 0 && (
        <div className="bg-rose-700 text-white px-4 py-3 shadow-md border-b border-rose-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-xs sm:text-sm tracking-wide uppercase">
                  URGENT: May {activeEmergencies.length} Aktibong Barangay Emergency SOS Alert!
                </p>
                {isAlarmPlaying && !isAlarmMuted && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-rose-800 font-bold text-[10px] flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    <Volume2 className="w-3 h-3 text-rose-600" />
                    SIREN ALARM RINGING
                  </span>
                )}
                {isAlarmMuted && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-900/80 text-rose-200 font-semibold text-[10px] border border-rose-700 inline-flex items-center gap-1">
                    <VolumeX className="w-3 h-3 text-rose-300" />
                    ALARM MUTED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-rose-100 hidden sm:block">
                Kailangan ng agarang pag-aksyon at pag-dispatch ng Tanod, BFP, o Medical responders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsAlarmMuted((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900/80 border border-rose-600/80 text-white font-semibold text-xs transition cursor-pointer inline-flex items-center gap-1.5"
            >
              {isAlarmMuted ? (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>I-Unmute ang Siren</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5" />
                  <span>I-Mute ang Tunog</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("emergencies")}
              className="px-3.5 py-1.5 rounded-lg bg-white text-rose-800 hover:bg-rose-50 font-bold text-xs shadow-xs transition cursor-pointer whitespace-nowrap"
            >
              Tingnan at I-Dispatch →
            </button>
          </div>
        </div>
      )}

      {/* Admin Title Bar - Responsive */}
      <div className="bg-[#0A2540] text-white py-4 sm:py-5 px-3 sm:px-4 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch sm:items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-lg sm:text-xl border border-slate-700 shrink-0">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Pamahalaang Barangay
                </span>
                <span className="text-[8px] sm:text-[9px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Staff Console
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Barangay Tibay Staff Portal
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Pagsusuri, pag-apruba, at pamamahala ng mga serbisyo pambarangay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsAlarmMuted((prev) => !prev)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center justify-center gap-1.5 border ${
                isAlarmMuted
                  ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
              }`}
              title="I-toggle ang Emergency Siren Audio Alarm"
            >
              {isAlarmMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>Siren: Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Siren: Aktibo</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsVerifierOpen(true)}
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-lg bg-[#FDB415] hover:bg-amber-400 text-[#0A2540] font-bold text-xs shadow-xs transition cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <ScanLine className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>QR Verifier</span>
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("brgy_admin_session");
                router.push("/admin/login");
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 transition cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 w-full space-y-5">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Kabuuan
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 block">{totalCount}</span>
            <span className="text-[11px] text-slate-500 font-medium block">Lahat ng Request</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              Sinusuri
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-600 block">{pendingCount}</span>
            <span className="text-[11px] text-slate-500 font-medium block">Pending Review</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
              Handa sa Window 1
            </span>
            <span className="text-xl sm:text-2xl font-bold text-blue-700 block">{readyCount}</span>
            <span className="text-[11px] text-slate-500 font-medium block">For Pickup</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Nai-release
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 block">{releasedCount}</span>
            <span className="text-[11px] text-slate-500 font-medium block">Naibigay Na</span>
          </div>

          <div
            onClick={() => setActiveTab("emergencies")}
            className={`p-3.5 sm:p-4 rounded-xl bg-white border shadow-xs space-y-0.5 cursor-pointer transition col-span-2 sm:col-span-1 ${
              activeEmergencies.length > 0
                ? "border-rose-400 bg-rose-50/60 hover:bg-rose-50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              SOS Alerts
            </span>
            <span className={`text-xl sm:text-2xl font-bold block ${activeEmergencies.length > 0 ? "text-rose-600" : "text-slate-800"}`}>
              {activeEmergencies.length}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block">
              {activeEmergencies.length > 0 ? "Nangangailangan ng Tugon" : "Walang Aktibong SOS"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Requests vs Blotters vs Announcements vs Emergencies) */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none flex-nowrap w-full">
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition cursor-pointer inline-flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === "requests"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Mga Kahilingan</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white">
              {requests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("emergencies")}
            className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition cursor-pointer inline-flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === "emergencies"
                ? "bg-rose-700 text-white shadow-xs"
                : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Emergency SOS</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeEmergencies.length > 0 ? "bg-rose-900 text-white font-bold" : "bg-slate-200 text-slate-700"
            }`}>
              {emergencies.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("blotters")}
            className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition cursor-pointer inline-flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === "blotters"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            <span>Blotter & Reklamo</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white">
              {blotters.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("announcements")}
            className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition cursor-pointer inline-flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === "announcements"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Mga Anunsyo</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white">
              {announcements.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ayuda")}
            className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition cursor-pointer inline-flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === "ayuda"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-slate-400" />
            <span>Ayuda Distribution</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white">
              {ayudaClaims.filter((c) => c.status === "claimed").length}/{ayudaClaims.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition cursor-pointer inline-flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === "bookings"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Court & Gamit Bookings</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white">
              {facilityBookings.length}
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: DOCUMENT REQUESTS APPROVAL QUEUE                        */}
        {/* ============================================================== */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-4 p-4 sm:p-5">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search box */}
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Maghanap ng pangalan, code, o purok..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-nowrap w-full sm:w-auto scrollbar-none text-[11px] sm:text-xs">
                {[
                  { key: "all", label: "Lahat" },
                  { key: "pending", label: "Sinusuri" },
                  { key: "ready", label: "Handa" },
                  { key: "released", label: "Nai-release" },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatusFilter(s.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                      statusFilter === s.key
                        ? "bg-[#0A2540] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* VIEW A: MOBILE CARDS LIST (VISIBLE ON SMALL SCREENS < 768px) */}
            <div className="block md:hidden space-y-3">
              {filteredRequests.map((req) => (
                <div
                  key={`mobile-${req.id}`}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                      {req.tracking_number}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border inline-block ${
                        req.status === "released" || req.status === "ready_for_pickup"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : req.status === "approved"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : req.status === "under_review"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-slate-200 text-slate-700 border-slate-300"
                      }`}
                    >
                      {req.status.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{req.full_name}</h4>
                    <p className="text-[10px] text-slate-500">📍 {req.purok_zone} • 📞 {req.contact_number}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{req.document_type}</span>
                      <span className="font-black text-emerald-700">
                        {req.is_free ? "LIBRE" : `₱${req.fee_amount.toFixed(2)}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{req.purpose}</p>
                    <span className="text-[9px] text-slate-400 block pt-0.5">
                      Petsa: {new Date(req.created_at).toLocaleDateString("en-PH")}
                    </span>
                  </div>

                  {/* Mobile Touch Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {(req.status === "pending" || req.status === "under_review") && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(req.id, "approved")}
                        className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer text-center"
                      >
                        ✓ Aprubahan
                      </button>
                    )}

                    {req.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(req.id, "ready_for_pickup")}
                        className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer text-center"
                      >
                        📦 Handa nang Kunin
                      </button>
                    )}

                    {req.status === "ready_for_pickup" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(req.id, "released")}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer text-center"
                      >
                        🤝 I-release
                      </button>
                    )}

                    {(req.status === "approved" || req.status === "ready_for_pickup" || req.status === "released") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedForPrint(req);
                          setIsPrintModalOpen(true);
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#0A2540] text-[#FDB415] font-black text-xs shadow-sm transition-all cursor-pointer text-center shrink-0"
                      >
                        🖨️ I-Print
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredRequests.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Walang nahanap na dokumentong tumutugma sa filter o search.
                </div>
              )}
            </div>

            {/* VIEW B: DESKTOP TABLE VIEW (VISIBLE ON >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Tracking Code</th>
                    <th className="py-3 px-3">Residente</th>
                    <th className="py-3 px-3">Dokumento</th>
                    <th className="py-3 px-3">Bayarin</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right">Aksyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Tracking Code */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-black text-blue-900 block">
                          {req.tracking_number}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(req.created_at).toLocaleDateString("en-PH")}
                        </span>
                      </td>

                      {/* Resident Info */}
                      <td className="py-3.5 px-3">
                        <span className="font-black text-slate-900 block text-xs">
                          {req.full_name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {req.purok_zone} • {req.contact_number}
                        </span>
                      </td>

                      {/* Document Type & Purpose */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-800 block">
                          {req.document_type}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[200px]" title={req.purpose}>
                          {req.purpose}
                        </span>
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-3">
                        <span className="font-black text-emerald-700">
                          {req.is_free ? "LIBRE" : `₱${req.fee_amount.toFixed(2)}`}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border inline-block ${
                            req.status === "released" || req.status === "ready_for_pickup"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : req.status === "approved"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : req.status === "under_review"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-slate-200 text-slate-700 border-slate-300"
                          }`}
                        >
                          {req.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Action Buttons - Streamlined & Non-Redundant */}
                      <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        
                        {/* 1. Direct Approval Button for pending/under review */}
                        {(req.status === "pending" || req.status === "under_review") && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(req.id, "approved")}
                            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            ✓ Aprubahan
                          </button>
                        )}

                        {/* 2. Ready for pickup button */}
                        {req.status === "approved" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(req.id, "ready_for_pickup")}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            📦 Handa nang Kunin
                          </button>
                        )}

                        {/* 3. Mark as officially released button */}
                        {req.status === "ready_for_pickup" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(req.id, "released")}
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            🤝 I-release
                          </button>
                        )}

                        {/* 4. Print Official Certificate - only available once approved or released */}
                        {(req.status === "approved" || req.status === "ready_for_pickup" || req.status === "released") && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedForPrint(req);
                              setIsPrintModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#0A2540] text-[#FDB415] font-black text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            🖨️ I-Print
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Walang nahanap na dokumentong tumutugma sa filter o search.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BLOTTERS & COMMUNITY COMPLAINTS                         */}
        {/* ============================================================== */}
        {activeTab === "blotters" && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Talaan ng Lupon Tagapamayapa (Barangay Blotter Cases)
                </h3>
                <p className="text-xs text-slate-500">
                  Katarungang Pambarangay mediation cases and neighborhood complaints
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {blotters.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-red-900 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                        {b.case_number}
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        {b.incident_type}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase border border-amber-300">
                      {b.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-serif text-[13px] bg-white p-3 rounded-xl border border-slate-200">
                    &ldquo;{b.narrative}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Nagreklamo: <strong>{b.complainant_name}</strong> ({b.complainant_contact})</span>
                    <span>Inirereklamo: <strong>{b.respondent_name || "Hindi batid"}</strong></span>
                    <span>Lokasyon: <strong>{b.incident_location}</strong></span>
                    <span>Petsa: <strong>{b.incident_date}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ANNOUNCEMENTS MANAGEMENT                                */}
        {/* ============================================================== */}
        {activeTab === "announcements" && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h3 className="text-base font-black text-slate-900 pb-2 border-b border-slate-200">
              Opisyal na Anunsyo sa Komunidad
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-900 text-[10px] bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                      {a.category}
                    </span>
                    {a.is_urgent && (
                      <span className="text-[10px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300 animate-pulse">
                        ⚠️ URGENT
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{a.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{a.content}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    Inilathala ni: {a.published_by}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: EMERGENCY SOS ALERTS DISPATCH QUEUE                     */}
        {/* ============================================================== */}
        {activeTab === "emergencies" && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-base font-black text-red-900 flex items-center gap-2">
                  <span>🚨 Barangay Emergency SOS Monitoring & Dispatch</span>
                  {activeEmergencies.length > 0 && (
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                      {activeEmergencies.length} ACTIVE
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time distress signals mula sa mga residente ng Barangay Tibay
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">
                  Hotlines: <strong>Tanod (049) 501-8891</strong> • <strong>MDRRMO 911</strong>
                </span>
              </div>
            </div>

            {/* Siren Sound Alarm System Control Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs shrink-0 ${
                  isAlarmPlaying ? "bg-red-600 text-white animate-bounce" : "bg-white text-slate-700 border border-slate-200"
                }`}>
                  {isAlarmPlaying ? "🚨" : isAlarmMuted ? "🔕" : "🚑"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      Philippine Emergency Ambulance Siren (3-in-1 Auto Sequence)
                    </span>
                    {isAlarmPlaying && !isAlarmMuted && (
                      <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                        TUMUTUNOG ANG SIREN
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {isAlarmPlaying
                      ? "Awtomatikong tumutunog ang pinagsamang Long Wail ➔ Two-Tone Wang-Wang ➔ Rapid Yelp dahil may aktibong SOS alert."
                      : isAlarmMuted
                      ? "Naka-mute ang audio alarm. Maaaring i-unmute anumang oras."
                      : "Awtomatikong umiikot ang 3 tunog (Long Wail ➔ Philippine Wang-Wang ➔ Rapid Yelp) kapag may pumasok na SOS alert."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTestingSiren((prev) => !prev)}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 border border-slate-300 font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>{isTestingSiren ? "⏹️ Ihinto ang Siren" : "🚑 Subukan ang Siren"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAlarmMuted((prev) => !prev)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap ${
                    isAlarmMuted
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-slate-800 hover:bg-slate-900 text-white"
                  }`}
                >
                  {isAlarmMuted ? "🔔 I-Unmute" : "🔕 I-Mute"}
                </button>
              </div>
            </div>

            {emergencies.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Ligtas ang barangay! Walang naitalang emergency alert sa ngayon.
              </div>
            ) : (
              <div className="space-y-3">
                {emergencies.map((emg) => {
                  const isEmgActive = emg.status === "active";
                  const isDispatched = emg.status === "dispatched";

                  return (
                    <div
                      key={emg.id}
                      className={`p-4 rounded-2xl border text-xs space-y-3 transition-all ${
                        isEmgActive
                          ? "bg-red-50/60 border-red-300 shadow-sm"
                          : isDispatched
                          ? "bg-amber-50/50 border-amber-300"
                          : "bg-slate-50 border-slate-200 opacity-90"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl shrink-0">
                            {emg.emergency_type === "Medical"
                              ? "🚑"
                              : emg.emergency_type === "Fire"
                              ? "🚒"
                              : emg.emergency_type === "Tanod / Police"
                              ? "👮"
                              : "🚤"}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">
                                {emg.emergency_type} Alert
                              </span>
                              <span
                                className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                  isEmgActive
                                    ? "bg-red-600 text-white border-red-700 animate-pulse"
                                    : isDispatched
                                    ? "bg-amber-500 text-slate-900 border-amber-600 font-black"
                                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                                }`}
                              >
                                {isEmgActive
                                  ? "🚨 ACTIVE SOS"
                                  : isDispatched
                                  ? "🚓 NA-DISPATCH NA"
                                  : "✓ RESOLVED"}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Residente: <strong>{emg.resident_name}</strong> • Purok: <strong>{emg.purok_zone}</strong> • Tel: <strong>{emg.contact_number}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Dispatch Action Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {isEmgActive && (
                            <button
                              type="button"
                              onClick={() => handleEmergencyStatus(emg.id, "dispatched")}
                              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>🚓 I-dispatch ang Tanod</span>
                            </button>
                          )}

                          {isDispatched && (
                            <button
                              type="button"
                              onClick={() => handleEmergencyStatus(emg.id, "resolved")}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>✓ Markahan bilang Resolved</span>
                            </button>
                          )}

                          {emg.status === "resolved" && (
                            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                              Ligtas na Naresolba
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location notes */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 font-medium">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                          Eksaktong Lokasyon at Palatandaan (Landmark):
                        </span>
                        <p className="text-xs text-slate-800">
                          {emg.details || "Walang ibinigay na partikular na landmark."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>ID ng Alerto: <strong className="font-mono text-slate-600">{emg.id}</strong></span>
                        <span>
                          Oras ng Alerto: {new Date(emg.created_at).toLocaleString("fil-PH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: AYUDA DISTRIBUTION & CENSUS MASTERLIST DESK             */}
        {/* ============================================================== */}
        {activeTab === "ayuda" && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-5">
            
            {/* Header & Program Selector */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Ayuda & Relief Goods Distribution System</span>
                  </h3>
                  <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-semibold uppercase">
                    Census Masterlist System
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pumili ng mga benepisyaryo mula sa sensus upang padalhan ng Claim Stub at pamahalaan ang pag-release sa Barangay Hall nang walang pandaraya.
                </p>
              </div>

              {/* Active Program Selector */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Programa:</span>
                <select
                  value={selectedAyudaProgramId}
                  onChange={(e) => setSelectedAyudaProgramId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {ayudaPrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nasa Sensus</span>
                <span className="text-xl font-bold text-slate-900">{censusResidents.length}</span>
                <span className="text-[11px] text-slate-500 block">Kabuuang Rehistrado</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Napadalhan ng Stub</span>
                <span className="text-xl font-bold text-blue-700">
                  {ayudaClaims.filter((c) => c.program_id === (selectedAyudaProgramId || ayudaPrograms[0]?.id)).length}
                </span>
                <span className="text-[11px] text-slate-500 block">May Opisyal na Claim Stub</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Na-release Na</span>
                <span className="text-xl font-bold text-emerald-800">
                  {ayudaClaims.filter((c) => c.status === "claimed" && c.program_id === (selectedAyudaProgramId || ayudaPrograms[0]?.id)).length}
                </span>
                <span className="text-[11px] text-emerald-700 block">Nakuha na sa Barangay Hall</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Naghihintay</span>
                <span className="text-xl font-bold text-amber-800">
                  {ayudaClaims.filter((c) => c.status === "eligible" && c.program_id === (selectedAyudaProgramId || ayudaPrograms[0]?.id)).length}
                </span>
                <span className="text-[11px] text-amber-700 block">Nasa Pila / May Stub Na</span>
              </div>
            </div>

            {/* Sub-Tabs: Sensus Masterlist vs Releasing Terminal */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setAyudaSubTab("masterlist")}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5 ${
                  ayudaSubTab === "masterlist"
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>1. Sensus Masterlist (Pumili at Mag-send ng Claim Stub)</span>
              </button>

              <button
                type="button"
                onClick={() => setAyudaSubTab("releasing")}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5 ${
                  ayudaSubTab === "releasing"
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>2. Pamamahagi sa Barangay Hall (Releasing & Stub Verification)</span>
              </button>
            </div>

            {/* Notification Feedback Toast */}
            {enrollFeedback && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{enrollFeedback}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* SUBTAB 1: CENSUS MASTERLIST & SELECTION                        */}
            {/* ============================================================== */}
            {ayudaSubTab === "masterlist" && (
              <div className="space-y-4">
                
                {/* Filter and Quick Selection Controls */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-600 mr-1 text-[11px]">Purok Filter:</span>
                    {[
                      "all",
                      "Purok 1 Bayanihan",
                      "Purok 2 Masipag",
                      "Purok 2 Pag-asa",
                      "Purok 3 Bayanihan",
                      "Purok 3 Pag-asa",
                    ].map((purok) => (
                      <button
                        key={purok}
                        type="button"
                        onClick={() => setAyudaPurokFilter(purok)}
                        className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                          ayudaPurokFilter === purok
                            ? "bg-slate-900 text-white font-semibold"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {purok === "all" ? "Lahat ng Purok" : purok.replace("Purok ", "P-")}
                      </button>
                    ))}
                  </div>

                  {/* Search box for resident census */}
                  <div className="relative w-full md:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={censusSearch}
                      onChange={(e) => setCensusSearch(e.target.value)}
                      placeholder="Hanapin sa sensus..."
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* Bulk Selection Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllInPurok(ayudaPurokFilter)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>I-toggle Lahat ({ayudaPurokFilter === "all" ? "Buong Sensus" : ayudaPurokFilter})</span>
                    </button>
                    <span className="text-slate-500 text-[11px]">
                      Naka-select: <strong className="text-slate-900">{selectedResidentIds.length}</strong> residente
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={selectedResidentIds.length === 0}
                    onClick={handleEnrollResidents}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ipadala ang Claim Stub sa {selectedResidentIds.length} Napiling Residente ➔</span>
                  </button>
                </div>

                {/* Census Masterlist Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">Piliin</th>
                        <th className="py-2.5 px-3">Residente (Sensus)</th>
                        <th className="py-2.5 px-3">Purok / Contact</th>
                        <th className="py-2.5 px-3">Voter / Buwanang Kita</th>
                        <th className="py-2.5 px-3">Status sa Programang Ito</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {censusResidents
                        .filter((r) => {
                          const matchesPurok = ayudaPurokFilter === "all" || r.purok_zone === ayudaPurokFilter;
                          const matchesSearch =
                            censusSearch === "" ||
                            r.full_name.toLowerCase().includes(censusSearch.toLowerCase()) ||
                            r.id.toLowerCase().includes(censusSearch.toLowerCase());
                          return matchesPurok && matchesSearch;
                        })
                        .map((res) => {
                          const isSelected = selectedResidentIds.includes(res.id);
                          const activeProgId = selectedAyudaProgramId || ayudaPrograms[0]?.id || "ayuda-prog-001";
                          const existingClaim = ayudaClaims.find(
                            (c) => c.resident_id === res.id && c.program_id === activeProgId
                          );

                          return (
                            <tr
                              key={res.id}
                              onClick={() => handleToggleSelectResident(res.id)}
                              className={`hover:bg-slate-50/80 transition cursor-pointer ${
                                isSelected ? "bg-blue-50/40" : ""
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectResident(res.id)}
                                  className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-md bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {res.avatar_initials}
                                  </div>
                                  <div>
                                    <span className="font-bold block text-slate-900">{res.full_name}</span>
                                    <span className="font-mono text-[10px] text-slate-400 uppercase">{res.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                <div>{res.purok_zone}</div>
                                <div className="font-mono text-[11px] text-slate-400">{res.contact_number}</div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                <div>{res.voter_status}</div>
                                <div className="text-[10px] text-slate-400">₱{res.monthly_income?.toLocaleString() || "8,000"} / buwan</div>
                              </td>
                              <td className="py-2.5 px-3">
                                {existingClaim ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                      May Stub Na: {existingClaim.claim_stub_number}
                                    </span>
                                    {existingClaim.status === "claimed" && (
                                      <span className="block text-[9px] text-emerald-700 font-bold">
                                        ● Na-claim na noong {new Date(existingClaim.claimed_at || "").toLocaleDateString("en-PH")}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">
                                    Hindi pa napadalhan ng Claim Stub
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ============================================================== */}
            {/* SUBTAB 2: DISTRIBUTION & RELEASING DESK (WALANG QR CODE)       */}
            {/* ============================================================== */}
            {ayudaSubTab === "releasing" && (
              <div className="space-y-4">
                
                {/* Search & Claim Terminal (Wag nang QR, Claim Stub / Pangalan) */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Barangay Hall Ayuda Releasing Terminal:
                    </span>
                    <p className="text-[11px] text-slate-500">
                      I-type ang Claim Stub Number (hal. STUB-2026-RICE-001) o Pangalan ng Residente upang i-verify at i-release.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={ayudaScanQuery}
                        onChange={(e) => setAyudaScanQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAyudaScan();
                        }}
                        placeholder="I-type ang Claim Stub No. o Pangalan (hal. STUB-2026-RICE-001 o Juan)"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <input
                      type="text"
                      value={ayudaRepresentative}
                      onChange={(e) => setAyudaRepresentative(e.target.value)}
                      placeholder="Pangalan ng Kumuha (kung kinatawan)"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400 text-[10px] font-bold">Mabilisang Pagsusuri:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAyudaScanQuery("STUB-2026-RICE-001");
                          handleAyudaScan("STUB-2026-RICE-001");
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] border border-slate-200 cursor-pointer"
                      >
                        STUB-2026-RICE-001 (Juan)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAyudaScanQuery("STUB-2026-RICE-002");
                          handleAyudaScan("STUB-2026-RICE-002");
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] border border-slate-200 cursor-pointer"
                      >
                        STUB-2026-RICE-002 (Maria)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAyudaScan()}
                      className="px-4 py-2 rounded-lg bg-[#0A2540] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>I-Release ang Ayuda</span>
                    </button>
                  </div>

                  {/* Result Banner */}
                  {ayudaScanResult && (
                    <div
                      className={`p-3.5 rounded-lg text-xs font-semibold border transition-all mt-2 ${
                        ayudaScanResult.alreadyClaimed
                          ? "bg-rose-50 text-rose-900 border-rose-300"
                          : ayudaScanResult.success
                          ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {ayudaScanResult.alreadyClaimed ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold text-xs">{ayudaScanResult.message}</p>
                          {ayudaScanResult.claim && (
                            <p className="text-[11px] font-normal text-slate-700 mt-0.5">
                              Benepisyaryo: <strong>{ayudaScanResult.claim.resident_name}</strong> • Purok:{" "}
                              <strong>{ayudaScanResult.claim.purok_zone}</strong> • Stub:{" "}
                              <strong className="font-mono">{ayudaScanResult.claim.claim_stub_number}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Master Beneficiary List Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 block">
                      Talaan ng mga Naipamahaging Claim Stub:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Anti-Doble Claim Verification Desk
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Claim Stub No.</th>
                          <th className="py-2.5 px-3">Benepisyaryo</th>
                          <th className="py-2.5 px-3">Purok / Contact</th>
                          <th className="py-2.5 px-3">Katayuan</th>
                          <th className="py-2.5 px-3">Kumuha / Petsa</th>
                          <th className="py-2.5 px-3 text-right">Aksyon</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ayudaClaims
                          .filter((c) => c.program_id === (selectedAyudaProgramId || ayudaPrograms[0]?.id))
                          .map((claim) => {
                            const isClaimed = claim.status === "claimed";
                            const stubNumber = claim.claim_stub_number || claim.qr_claim_code || "STUB-2026-AID-001";
                            return (
                              <tr key={claim.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                                  {stubNumber}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                  {claim.resident_name}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600">
                                  {claim.purok_zone} • {claim.contact_number}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                                      isClaimed
                                        ? "bg-slate-100 text-slate-600 border-slate-300"
                                        : "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    }`}
                                  >
                                    {isClaimed ? "✓ CLAIMED" : "● READY / ELIGIBLE"}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-500">
                                  {isClaimed ? (
                                    <div>
                                      <span className="font-semibold text-slate-800 block">
                                        {claim.claimed_by_representative || claim.resident_name}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {claim.claimed_at ? new Date(claim.claimed_at).toLocaleTimeString("fil-PH", { hour: "2-digit", minute: "2-digit" }) : ""}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic">Hindi pa kinukuha sa Hall</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  {!isClaimed ? (
                                    <button
                                      type="button"
                                      onClick={() => handleAyudaScan(stubNumber)}
                                      className="px-3 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-xs cursor-pointer transition"
                                    >
                                      I-Release
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-semibold">Na-release Na</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: FACILITY & EQUIPMENT BOOKINGS QUEUE                     */}
        {/* ============================================================== */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 space-y-4">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>🏀 Pamamahala ng Pasilidad at Kagamitan</span>
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                    RESERVATIONS
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Aprubahan o tanggihan ang mga kahilingan sa Covered Court, Tents, Chairs, at Ambulance
                </p>
              </div>

              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                Kabuuan: {facilityBookings.length} Requests
              </span>
            </div>

            {/* Bookings Queue Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Booking Code</th>
                    <th className="py-3 px-3">Pasilidad / Gamit</th>
                    <th className="py-3 px-3">Residente</th>
                    <th className="py-3 px-3">Petsa at Oras</th>
                    <th className="py-3 px-3">Layunin</th>
                    <th className="py-3 px-3">Katayuan</th>
                    <th className="py-3 px-3 text-right">Aksyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facilityBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                        {b.booking_code}
                      </td>
                      <td className="py-3.5 px-3 font-black text-slate-900">
                        {b.facility_name}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-800 block">{b.resident_name}</span>
                        <span className="text-[10px] text-slate-500">{b.purok_zone} • {b.contact_number}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">
                        <span className="font-bold block">{b.booking_date}</span>
                        <span className="text-[10px] text-blue-700 font-bold">{b.time_slot}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-[200px] truncate" title={b.purpose}>
                        {b.purpose}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            b.status === "approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : b.status === "rejected"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-amber-100 text-amber-900 border-amber-300"
                          }`}
                        >
                          {b.status === "approved"
                            ? "✓ APPROVED"
                            : b.status === "rejected"
                            ? "✕ REJECTED"
                            : "⏳ PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        {b.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleBookingStatusChange(b.id, "approved", "Inaprubahan ng Tanggapan ng Punong Barangay.")}
                              className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-all"
                            >
                              ✓ Aprubahan
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBookingStatusChange(b.id, "rejected", "May nauna nang naka-schedule sa pasilidad.")}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] cursor-pointer transition-all"
                            >
                              ✕ Tanggihan
                            </button>
                          </>
                        )}
                        {b.status === "approved" && (
                          <span className="text-[11px] text-emerald-700 font-bold">Naka-schedule na</span>
                        )}
                        {b.status === "rejected" && (
                          <span className="text-[11px] text-slate-400">Tinanggihan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {facilityBookings.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Walang nakabinbing reservation request sa ngayon.
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Official Printable Certificate Modal */}
      <OfficialCertificateModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        request={selectedForPrint}
      />

      {/* QR Resident ID Verifier Modal for Staff */}
      <ResidentQrVerifierModal
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
      />

    </div>
  );
}
