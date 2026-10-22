"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { BarangayDocumentType, DocumentRequest, ResidentProfile } from "@/types/barangay";
import { createDocumentRequest, getActiveResident, registerResident } from "@/lib/barangayService";

interface DocumentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (record: DocumentRequest) => void;
  initialDocType?: BarangayDocumentType;
}

export function DocumentRequestModal({
  isOpen,
  onClose,
  onSuccess,
  initialDocType = "Barangay Indigency",
}: DocumentRequestModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [docType, setDocType] = useState<BarangayDocumentType>(initialDocType);
  const [activeResident] = useState<ResidentProfile | null>(() => getActiveResident());
  
  // Citizen Form State
  const [fullName, setFullName] = useState(() => getActiveResident()?.full_name || "");
  const [birthdate, setBirthdate] = useState(() => getActiveResident()?.birthdate || "2000-01-01");
  const [civilStatus, setCivilStatus] = useState<"Single" | "Married" | "Widowed" | "Separated">(
    () => getActiveResident()?.civil_status || "Single"
  );
  const [purokZone, setPurokZone] = useState(() => getActiveResident()?.purok_zone || "Purok 1 Bayanihan");
  const [contactNumber, setContactNumber] = useState(() => getActiveResident()?.contact_number || "");
  const [email, setEmail] = useState(() => getActiveResident()?.email || "");
  const [purpose, setPurpose] = useState("CHED / DepEd Scholarship Application");
  const [validIdType, setValidIdType] = useState(() => getActiveResident()?.valid_id_type || "Philippine National ID");
  const [validIdNumber, setValidIdNumber] = useState(() => getActiveResident()?.valid_id_number || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<DocumentRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Document pricing & descriptions
  const documentCatalog: Record<BarangayDocumentType, { fee: number; isFree: boolean; desc: string; commonPurposes: string[] }> = {
    "Barangay Indigency": {
      fee: 0,
      isFree: true,
      desc: "Katunayan ng kawalan ng sapat na kita. Kinakailangan para sa libreng scholarship, medical assistance, o ayuda.",
      commonPurposes: [
        "CHED / DepEd Scholarship Application",
        "Malasakit Center Hospital Medical Assistance",
        "DSWD AICS Financial Assistance",
        "Public Attorney's Office (PAO) Free Legal Aid",
        "Medical & Laboratory Discount",
      ],
    },
    "Barangay Clearance": {
      fee: 50,
      isFree: false,
      desc: "Katunayan ng mabuting pag-uugali sa komunidad na walang nakabinbing kaso.",
      commonPurposes: [
        "Local Job Employment / Requirement",
        "Postal ID / Passport Application",
        "Bank Account Opening",
        "Police Clearance Requirement",
      ],
    },
    "Certificate of Residency": {
      fee: 50,
      isFree: false,
      desc: "Katunayan ng lehitimong paninirahan sa nasasakupan ng Barangay Tibay.",
      commonPurposes: [
        "Proof of Billing / Address",
        "Meralco / Water Connection",
        "School Enrollment Proof of Residence",
        "COMELEC Voter Registration",
      ],
    },
    "First Time Jobseeker (RA 11261)": {
      fee: 0,
      isFree: true,
      desc: "Alinsunod sa Republic Act 11261, LIBRE ang dokumentong ito para sa mga unang beses maghahanap ng trabaho.",
      commonPurposes: [
        "First Time Job Employment (RA 11261 Libre)",
        "NBI & Police Clearance Requirements",
        "PhilHealth / SSS / Pag-IBIG Application",
      ],
    },
    "Certificate of Low Income": {
      fee: 0,
      isFree: true,
      desc: "Katunayan ng limitadong buwanang sahod ng pamilya para sa mga social welfare programs.",
      commonPurposes: [
        "4Ps / Pantawid Pamilya Verification",
        "Senior Citizen / PWD Social Pension",
        "Community Livelihood Program",
      ],
    },
    "Barangay Business Clearance": {
      fee: 200,
      isFree: false,
      desc: "Permit para sa mga sari-sari store, carinderia, water station, at maliliit na negosyo.",
      commonPurposes: [
        "Sari-sari Store / Micro Business Permit",
        "DTI Registration Requirement",
        "Mayor's Permit Renewal",
      ],
    },
  };

  const selectedCatalog = documentCatalog[docType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contactNumber.trim() || !purpose.trim()) {
      setErrorMsg("Pakisagutan ang lahat ng mandatory fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    let residentId = activeResident?.id;
    if (!residentId) {
      const newResident = registerResident({
        full_name: fullName.trim(),
        birthdate,
        civil_status: civilStatus,
        purok_zone: purokZone,
        address: `${purokZone}, Barangay Tibay`,
        contact_number: contactNumber.trim(),
        email: email.trim() || undefined,
        years_of_residency: 5,
        voter_status: "Registered Voter",
        valid_id_type: validIdType,
        valid_id_number: validIdNumber.trim() || "N/A",
        monthly_income: 0,
      });
      residentId = newResident.id;
    }

    const res = await createDocumentRequest({
      resident_id: residentId,
      document_type: docType,
      full_name: fullName.trim(),
      birthdate,
      civil_status: civilStatus,
      purok_zone: purokZone,
      contact_number: contactNumber.trim(),
      email: email.trim() || undefined,
      purpose: purpose.trim(),
      valid_id_type: validIdType,
      valid_id_number: validIdNumber.trim() || undefined,
      fee_amount: selectedCatalog.fee,
      is_free: selectedCatalog.isFree,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setCreatedRecord(res.data);
      setStep(4);
      onSuccess(res.data);
    } else {
      setErrorMsg(res.error || "Nagka-problema sa pagsusumite. Subukan muli.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fadeIn">
        
        {/* Modal Top Header */}
        <div className="bg-[#0A2540] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDB415] text-[#0A2540] font-black flex items-center justify-center text-lg shadow-md shrink-0">
              🏛️
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FDB415] block">
                Barangay Tibay
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                Mag-Request ng Dokumento
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Indicator (Steps 1 to 4) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          {[
            { num: 1, label: "Dokumento" },
            { num: 2, label: "Impormasyon" },
            { num: 3, label: "Layunin at ID" },
            { num: 4, label: "Kumpirmasyon" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === s.num
                    ? "bg-[#0A2540] text-white ring-2 ring-blue-400"
                    : step > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span
                className={`hidden sm:inline font-bold ${
                  step === s.num ? "text-[#0A2540]" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 1: CHOOSE DOCUMENT TYPE                                   */}
          {/* ============================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Pumili ng Opisyal na Dokumento na Iyong Hinihiling:
                </h3>
                <p className="text-xs text-slate-500">
                  Libre ang Indigency at First Time Jobseekers alinsunod sa batas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {(Object.keys(documentCatalog) as BarangayDocumentType[]).map((type) => {
                  const item = documentCatalog[type];
                  const isSelected = docType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setDocType(type);
                        setPurpose(item.commonPurposes[0]);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/80 border-[#0A2540] shadow-md ring-2 ring-[#0A2540]/30"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-slate-900 block">
                          {type}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            item.isFree
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {item.isFree ? "LIBRE (FREE)" : `₱${item.fee}.00`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-[#0A2540] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Magpatuloy sa Impormasyon ➔
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: PERSONAL CITIZEN INFORMATION                           */}
          {/* ============================================================== */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Impormasyon ng Residente
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dokumento: <strong className="text-blue-900">{docType}</strong>
                  </p>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                  {selectedCatalog.isFree ? "LIBRE" : `₱${selectedCatalog.fee}.00`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Buong Pangalan ng Residente (Apelyido, Pangalan, Gitna) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Hal. Dela Cruz, Juan Santos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-sm font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Araw ng Kapanganakan (Birthdate) *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Katayuang Sibil (Civil Status) *
                  </label>
                  <select
                    value={civilStatus}
                    onChange={(e) => setCivilStatus(e.target.value as "Single" | "Married" | "Widowed" | "Separated")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs font-bold text-slate-900"
                  >
                    <option value="Single">Single (Walang Asawa)</option>
                    <option value="Married">Married (May Asawa)</option>
                    <option value="Widowed">Widowed (Biyudo/Biyuda)</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Purok / Sona sa Barangay Tibay *
                  </label>
                  <select
                    value={purokZone}
                    onChange={(e) => setPurokZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs font-bold text-slate-900"
                  >
                    <option value="Purok 1 Bayanihan">Purok 1 Bayanihan</option>
                    <option value="Purok 2 Pag-asa">Purok 2 Pag-asa</option>
                    <option value="Purok 3 Kaunlaran">Purok 3 Kaunlaran</option>
                    <option value="Purok 4 Masagana">Purok 4 Masagana</option>
                    <option value="Purok 5 Tagumpay">Purok 5 Tagumpay</option>
                    <option value="Purok 6 Mabuhay">Purok 6 Mabuhay</option>
                    <option value="Purok 7 Maligaya">Purok 7 Maligaya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Contact Number (Cellphone) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Hal. 0917-123-4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Email Address (Opsyonal para sa digital update)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Hal. resident@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  ← Bumalik
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!fullName.trim() || !contactNumber.trim()) {
                      setErrorMsg("Pakisagutan ang Pangalan at Contact Number.");
                      return;
                    }
                    setErrorMsg(null);
                    setStep(3);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#0A2540] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Sunod: Layunin at Valid ID ➔
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: PURPOSE & VALID ID VERIFICATION                        */}
          {/* ============================================================== */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-900">
                  Layunin ng Pagkuha at Pagkakakilanlan
                </h3>
                <p className="text-xs text-slate-500">
                  Pagtitiyak ng lehitimong pangangailangan alinsunod sa batas ng Barangay.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Purpose Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Saan Gagamitin ang Dokumento? (Purpose) *
                  </label>
                  
                  {/* Preset quick purpose chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedCatalog.commonPurposes.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPurpose(p)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          purpose === p
                            ? "bg-blue-900 text-white border-blue-900"
                            : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Ilagay ang partikular na opisina o rason ng pagkuha"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Uri ng Iprisentang Valid ID *
                    </label>
                    <select
                      value={validIdType}
                      onChange={(e) => setValidIdType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs font-bold text-slate-900"
                    >
                      <option value="Philippine National ID">Philippine National ID (PhilID)</option>
                      <option value="Voter ID / Certificate">Voter ID / Certification</option>
                      <option value="Driver License">Driver&apos;s License (LTO)</option>
                      <option value="Student ID">Student ID (School/College)</option>
                      <option value="Postal ID">Postal ID</option>
                      <option value="Barangay Resident ID">Barangay Resident ID</option>
                      <option value="Senior Citizen / PWD ID">Senior Citizen / PWD ID</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      ID Number (Opsyonal)
                    </label>
                    <input
                      type="text"
                      value={validIdNumber}
                      onChange={(e) => setValidIdNumber(e.target.value)}
                      placeholder="Hal. 1234-5678-9012"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>

                {/* Legal Certification checkbox */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <input type="checkbox" required defaultChecked className="mt-0.5 accent-blue-900 cursor-pointer" />
                  <span className="text-[11px] leading-relaxed">
                    Pinatutunayan ko sa ilalim ng parusa ng batas na ang lahat ng impormasyong aking ibinigay ay totoo at tumpak bilang residente ng Barangay Tibay.
                  </span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  ← Bumalik
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs shadow-lg shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <span>{isSubmitting ? "Isinusumite sa Barangay..." : "ISUMITE ANG ONLINE REQUEST ✓"}</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* STEP 4: SUCCESS ACKNOWLEDGMENT & TRACKING SLIP                 */}
          {/* ============================================================== */}
          {step === 4 && createdRecord && (
            <div className="space-y-5 text-center py-2 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 font-black flex items-center justify-center text-3xl mx-auto shadow-md border-2 border-emerald-400">
                ✓
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 inline-block mb-1">
                  Matagumpay na Naisumite
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Salamat, {createdRecord.full_name.split(" ")[0]}!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nasa talaan na ng Barangay Hall ang iyong kahilingan para sa <strong>{createdRecord.document_type}</strong>.
                </p>
              </div>

              {/* Official Tracking Number Box */}
              <div className="p-5 rounded-3xl bg-slate-950 text-white space-y-2 border-2 border-[#FDB415] shadow-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FDB415] block">
                  OPISYAL NA TRACKING CODE
                </span>
                <div className="font-mono font-black text-2xl tracking-wider text-emerald-400 select-all">
                  {createdRecord.tracking_number}
                </div>
                <p className="text-[11px] text-slate-300">
                  I-screenshot o itala ang tracking code na ito upang masubaybayan ang estado ng dokumento.
                </p>
              </div>

              {/* Summary Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Residente:</span>
                  <span className="font-bold text-slate-900">{createdRecord.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lokasyon:</span>
                  <span className="font-bold text-slate-900">{createdRecord.purok_zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Layunin:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[240px]">{createdRecord.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bayarin:</span>
                  <span className="font-black text-emerald-700">
                    {createdRecord.is_free ? "LIBRE (FREE)" : `₱${createdRecord.fee_amount.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kasalukuyang Estado:</span>
                  <span className="font-bold text-amber-600 uppercase text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                    PENDING (Sinusuri ng Lupon)
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdRecord.tracking_number);
                    alert("Nakopya na ang Tracking Code sa iyong clipboard!");
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
                >
                  📋 Kopyahin ang Code
                </button>

                <Link
                  href="/resident/dashboard"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all text-center"
                >
                  👤 Pumunta sa Aking Citizen Portal →
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0A2540] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Tapusin at Isara ✓
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
