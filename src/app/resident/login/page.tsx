"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getAllResidents,
  setActiveResident,
  registerResident,
  findResidentByContactOrId,
} from "@/lib/barangayService";
import type { ResidentProfile } from "@/types/barangay";
import {
  Users,
  LogIn,
  UserPlus,
  MapPin,
  Phone,
  Building2,
  Info,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Check,
} from "lucide-react";

export default function ResidentLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "demo" | "register">("demo");

  // Login form state
  const [query, setQuery] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regBirthdate, setRegBirthdate] = useState("1995-05-15");
  const [regCivilStatus, setRegCivilStatus] = useState<"Single" | "Married" | "Widowed" | "Separated">("Single");
  const [regPurok, setRegPurok] = useState("Purok 1 Bayanihan");
  const [regAddress, setRegAddress] = useState("");
  const [regContact, setRegContact] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regYears, setRegYears] = useState(5);
  const [regVoter, setRegVoter] = useState<"Registered Voter" | "Non-Voter">("Registered Voter");
  const [regIdType, setRegIdType] = useState("Philippine National ID");
  const [regIdNum, setRegIdNum] = useState("");
  const [regIncome, setRegIncome] = useState(8000);
  const [regError, setRegError] = useState<string | null>(null);

  const residents = getAllResidents();

  const handleSelectResident = (resident: ResidentProfile) => {
    setActiveResident(resident);
    router.push("/resident/dashboard");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!query.trim()) {
      setLoginError("Mangyaring ilagay ang iyong Contact Number o Resident ID.");
      return;
    }

    const matched = findResidentByContactOrId(query);
    if (matched) {
      setActiveResident(matched);
      router.push("/resident/dashboard");
    } else {
      setLoginError(
        "Hindi natagpuan ang nasabing numero o Resident ID sa talaan ng Barangay Tibay. Maaari kang mag-rehistro sa tab sa itaas o gamitin ang Mabilisang Demo Access."
      );
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regContact.trim() || !regAddress.trim()) {
      setRegError("Mangyaring punan ang Buong Pangalan, Numero ng Telepono, at Tirahan.");
      return;
    }

    const newRes = registerResident({
      full_name: regName.trim(),
      birthdate: regBirthdate,
      civil_status: regCivilStatus,
      purok_zone: regPurok,
      address: regAddress.trim(),
      contact_number: regContact.trim(),
      email: regEmail.trim() || undefined,
      years_of_residency: Number(regYears),
      voter_status: regVoter,
      valid_id_type: regIdType,
      valid_id_number: regIdNum.trim() || "N/A",
      monthly_income: Number(regIncome),
    });

    setActiveResident(newRes);
    router.push("/resident/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative selection:bg-amber-400 selection:text-slate-950">
      
      {/* Background imagery with overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Image
          src="/images/brgy_hall_facade.jpg"
          alt="Barangay Tibay Community"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" />
      </div>

      {/* 1. Standard GovPH Top Bar */}
      <div className="relative z-10 bg-slate-950 text-slate-300 px-4 py-2 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#FDB415] tracking-wide uppercase text-[10px]">
              GOVPH
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">Republika ng Pilipinas</span>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Bumalik sa Homepage</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Login Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          
          {/* Header branding */}
          <div className="text-center space-y-2.5">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-300 shadow-sm mx-auto bg-white">
              <Image
                src="/images/brgy_tibay_seal.jpg"
                alt="Barangay Tibay Seal"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 inline-block">
                Portal ng Mamamayan (Citizen Access)
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
                Barangay Tibay E-Services
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                I-access ang iyong mga kahilingan sa dokumento, digital ID, e-sertipiko, at tulong pambarangay.
              </p>
            </div>
          </div>

          {/* Segmented Tab Navigation */}
          <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold text-slate-600 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("demo")}
              className={`py-2 rounded-lg transition cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                activeTab === "demo"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Demo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`py-2 rounded-lg transition cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                activeTab === "login"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`py-2 rounded-lg transition cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>Rehistro</span>
            </button>
          </div>

          {/* TAB 1: 1-Click Demo Profiles */}
          {activeTab === "demo" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-slate-900">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>Para sa Pagsusuri / Evaluator Access:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Pumili ng isa sa mga rehistradong mamamayan sa ibaba upang buksan ang totoong Resident Dashboard na may mga aktibong tala:
                </p>
              </div>

              <div className="space-y-2">
                {residents.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => handleSelectResident(res)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition shadow-xs group flex items-center justify-between cursor-pointer gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {res.avatar_initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-blue-950 truncate">
                            {res.full_name}
                          </span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {res.voter_status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal flex items-center gap-2 mt-0.5 truncate">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {res.purok_zone}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {res.contact_number}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 group-hover:text-slate-950 inline-flex items-center gap-1 shrink-0">
                      <span>Bumisita</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Mobile Number / ID Login */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Contact Number o Resident ID *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Hal. 0917-823-4561 o res-001"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Ilagay ang numero ng telepono o ang iyong Opisyal na Resident ID.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0A2540] hover:bg-blue-950 text-white font-semibold text-xs shadow-sm transition cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Pumasok sa Aking Dashboard</span>
              </button>
            </form>
          )}

          {/* TAB 3: Citizen Registration Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Bagong Residente ng Barangay Tibay:</strong> Punan ang impormasyon sa ibaba upang awtomatikong magkaroon ng opisyal na Citizen Account.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Buong Pangalan *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Hal. Juan D. Dela Cruz"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Araw ng Kapanganakan *</label>
                  <input
                    type="date"
                    required
                    value={regBirthdate}
                    onChange={(e) => setRegBirthdate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Purok / Zone *</label>
                  <select
                    value={regPurok}
                    onChange={(e) => setRegPurok(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 bg-white"
                  >
                    <option value="Purok 1 Bayanihan">Purok 1 Bayanihan</option>
                    <option value="Purok 2 Masipag">Purok 2 Masipag</option>
                    <option value="Purok 3 Pag-asa">Purok 3 Pag-asa</option>
                    <option value="Purok 4 Mapayapa">Purok 4 Mapayapa</option>
                    <option value="Purok 5 Kaunlaran">Purok 5 Kaunlaran</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Katayuang Sibil</label>
                  <select
                    value={regCivilStatus}
                    onChange={(e) => setRegCivilStatus(e.target.value as "Single" | "Married" | "Widowed" | "Separated")}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 bg-white"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">May-asawa (Married)</option>
                    <option value="Widowed">Balo (Widowed)</option>
                    <option value="Separated">Hiwalay (Separated)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Detalyadong Tirahan (House No. / Street) *</label>
                <input
                  type="text"
                  required
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Hal. Block 4 Lot 12, Mabini Street"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={regContact}
                    onChange={(e) => setRegContact(e.target.value)}
                    placeholder="0917-000-0000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Email Address (Opsyonal)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="juan@gmail.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Taon ng Paninirahan</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={regYears}
                    onChange={(e) => setRegYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Katayuan sa Halalan</label>
                  <select
                    value={regVoter}
                    onChange={(e) => setRegVoter(e.target.value as "Registered Voter" | "Non-Voter")}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 bg-white"
                  >
                    <option value="Registered Voter">Rehistradong Botante</option>
                    <option value="Non-Voter">Hindi Botante</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Kita Kada Buwan (₱)</label>
                  <input
                    type="number"
                    step="500"
                    value={regIncome}
                    onChange={(e) => setRegIncome(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Uri ng Valid ID</label>
                  <select
                    value={regIdType}
                    onChange={(e) => setRegIdType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 bg-white"
                  >
                    <option value="Philippine National ID">PhilSys National ID</option>
                    <option value="Driver's License">Driver&apos;s License</option>
                    <option value="UMID">UMID / SSS / GSIS</option>
                    <option value="Voter's ID">Voter&apos;s Certification</option>
                    <option value="Passport">Philippine Passport</option>
                    <option value="Student ID">School ID / Student ID</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">ID Number</label>
                  <input
                    type="text"
                    value={regIdNum}
                    onChange={(e) => setRegIdNum(e.target.value)}
                    placeholder="Hal. 1234-5678-9012"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {regError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer mt-2 inline-flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Rehistruhan at Magpatuloy</span>
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <Link
              href="/admin/login"
              className="text-slate-800 hover:text-blue-900 hover:underline font-semibold inline-flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Staff / Admin Portal</span>
            </Link>
            <span className="text-slate-400">Data Privacy Act (RA 10173)</span>
          </div>

        </div>
      </div>

      {/* 3. Footer */}
      <div className="relative z-10 text-center py-4 text-xs text-slate-400 border-t border-slate-800">
        © 2026 Pamahalaang Pambarangay ng Tibay • Bayan ng Santa Cruz, Lalawigan ng Laguna
      </div>
    </div>
  );
}
