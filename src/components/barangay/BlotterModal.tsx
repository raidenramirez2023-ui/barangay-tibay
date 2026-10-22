"use client";

import React, { useState } from "react";
import { createBlotterReport } from "@/lib/barangayService";
import type { BlotterReport } from "@/types/barangay";

interface BlotterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (report: BlotterReport) => void;
}

export function BlotterModal({ isOpen, onClose, onSuccess }: BlotterModalProps) {
  const [complainantName, setComplainantName] = useState("");
  const [complainantContact, setComplainantContact] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [incidentType, setIncidentType] = useState("Noise Disturbance (Loud Videoke / Party)");
  const [incidentLocation, setIncidentLocation] = useState("Purok 1 Bayanihan");
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);
  const [narrative, setNarrative] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReport, setCreatedReport] = useState<BlotterReport | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complainantName.trim() || !complainantContact.trim() || !narrative.trim()) {
      alert("Pakisagutan ang lahat ng kinakailangang impormasyon.");
      return;
    }

    setIsSubmitting(true);
    const res = await createBlotterReport({
      complainant_name: complainantName.trim(),
      complainant_contact: complainantContact.trim(),
      respondent_name: respondentName.trim() || undefined,
      incident_type: incidentType,
      incident_location: incidentLocation,
      incident_date: incidentDate,
      narrative: narrative.trim(),
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setCreatedReport(res.data);
      onSuccess(res.data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#5B1015] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#5B1015] font-black flex items-center justify-center text-lg shadow-md shrink-0">
              ⚖️
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                Lupon Tagapamayapa Desk
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                Kompidensyal na Reklamo / Blotter Report
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {createdReport ? (
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 font-black flex items-center justify-center text-3xl mx-auto border-2 border-emerald-400">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Naitala na ang Iyong Sumite sa Barangay Blotter
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Opisyal na Case Reference Number:
                </p>
                <div className="font-mono font-black text-2xl text-blue-900 mt-1">
                  {createdReport.case_number}
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Makikipag-ugnayan ang Lupon Tagapamayapa at Barangay Tanod Desk sa iyong contact number ({createdReport.complainant_contact}) para sa pag-areglo o imbestigasyon.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#0A2540] text-white font-bold text-xs"
              >
                Isara
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Paalala:</strong> Ang lahat ng isusumiteng detalye rito ay ituturing na kumpidensyal alinsunod sa Data Privacy Act of 2012 at Katarungang Pambarangay Law.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Pangalan ng Nagrereklamo (Complainant) *</label>
                  <input
                    type="text"
                    required
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    placeholder="Hal. Juan Dela Cruz"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={complainantContact}
                    onChange={(e) => setComplainantContact(e.target.value)}
                    placeholder="0917-123-4567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">Pangalan ng Inirereklamo (Respondent, kung batid)</label>
                  <input
                    type="text"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="Hal. Pedro Santos / Kapitbahay sa tapat"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Uri ng Insidente (Incident Type) *</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 font-bold text-slate-900"
                  >
                    <option value="Noise Disturbance (Loud Videoke / Party)">Noise Disturbance (Malakas na Videoke)</option>
                    <option value="Boundary / Land Dispute">Boundary / Land Dispute (Alitan sa Bakod)</option>
                    <option value="Neighborhood Altercation">Neighborhood Conflict (Alitan ng Kapitbahay)</option>
                    <option value="Pet / Dog Bite or Stray Concern">Pet / Dog Bite (Alagang Aso/Hayop)</option>
                    <option value="Unpaid Debt / Financial Dispute">Unpaid Debt (Pautang / Pinansyal)</option>
                    <option value="Others">Iba pang Usapin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Purok / Lokasyon ng Insidente *</label>
                  <select
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 font-bold text-slate-900"
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

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">Petsa ng Pangyayari *</label>
                  <input
                    type="date"
                    required
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">Maikling Salaysay ng Pangyayari (Narrative) *</label>
                  <textarea
                    required
                    rows={4}
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    placeholder="Isalaysay nang malinaw ang naganap na insidente..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#5B1015] hover:bg-[#7A151C] text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? "Isinusumite..." : "I-file sa Barangay Blotter ➔"}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
