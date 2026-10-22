"use client";

import React, { useState } from "react";
import type { ResidentProfile, EmergencyType, EmergencyAlert } from "@/types/barangay";
import { createEmergencyAlert } from "@/lib/barangayService";

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: ResidentProfile | null;
  onSuccess?: (alert: EmergencyAlert) => void;
}

export function EmergencySosModal({
  isOpen,
  onClose,
  resident,
  onSuccess,
}: EmergencySosModalProps) {
  const [selectedType, setSelectedType] = useState<EmergencyType>("Medical");
  const [purokZone, setPurokZone] = useState(() => resident?.purok_zone || "Purok 1 Bayanihan");
  const [contactNumber, setContactNumber] = useState(() => resident?.contact_number || "");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentAlert, setSentAlert] = useState<EmergencyAlert | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactNumber.trim()) {
      alert("Pakilagay ang contact number para ma-contact ka agad ng Tanod o Rescue.");
      return;
    }

    setIsSubmitting(true);
    const res = await createEmergencyAlert({
      resident_id: resident?.id,
      resident_name: resident?.full_name || "Residente ng Barangay",
      contact_number: contactNumber.trim(),
      purok_zone: purokZone,
      emergency_type: selectedType,
      details: details.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setSentAlert(res.data);
      onSuccess?.(res.data);
    }
  };

  const emergencyOptions: {
    type: EmergencyType;
    icon: string;
    title: string;
    desc: string;
    color: string;
  }[] = [
    {
      type: "Medical",
      icon: "🚑",
      title: "Medikal / Ambulansya",
      desc: "Inatake, aksidente, hirap huminga, o panganganak",
      color: "border-red-500 bg-red-50 text-red-950",
    },
    {
      type: "Fire",
      icon: "🚒",
      title: "Sunog / BFP Alert",
      desc: "Usok, sunog sa bahay o kawad ng kuryente",
      color: "border-amber-500 bg-amber-50 text-amber-950",
    },
    {
      type: "Tanod / Police",
      icon: "👮",
      title: "Tanod / Pulisya",
      desc: "Gulo, panloloob, ingay, o banta sa kaligtasan",
      color: "border-blue-500 bg-blue-50 text-blue-950",
    },
    {
      type: "Flood / Rescue",
      icon: "🌊",
      title: "Baha / Calamity Rescue",
      desc: "Tumaas na tubig baha o kailangang i-evacuate",
      color: "border-cyan-500 bg-cyan-50 text-cyan-950",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-red-500/50 overflow-hidden my-auto">
        
        {/* Red Header Bar */}
        <div className="bg-gradient-to-r from-red-700 via-rose-800 to-red-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-red-700 font-black flex items-center justify-center text-xl shadow-lg shrink-0 animate-pulse">
              🚨
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                Barangay Tibay Emergency Action
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                1-Tap Emergency SOS Dispatch
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

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {!sentAlert ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  1. Piliin ang Uri ng Emergency:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {emergencyOptions.map((opt) => {
                    const isSelected = selectedType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setSelectedType(opt.type)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${opt.color} ring-2 ring-red-500 shadow-md font-black`
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{opt.icon}</span>
                          <span className="text-xs font-black">{opt.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    2. Lokasyon / Purok:
                  </label>
                  <select
                    value={purokZone}
                    onChange={(e) => setPurokZone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {[
                      "Purok 1 Bayanihan",
                      "Purok 2 Pag-asa",
                      "Purok 3 Kaunlaran",
                      "Purok 4 Masagana",
                      "Purok 5 Tagumpay",
                      "Purok 6 Maligaya",
                      "Purok 7 Mapayapa",
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    3. Contact Number:
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Hal. 0917-123-4567"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Short Note / Landmark */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  4. Karagdagang Landmark o Detalye (Optional):
                </label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Hal. Katapat ng Basketball Court / Dilaw na gate"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Big Red SOS Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:brightness-110 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="text-xl animate-bounce">🚨</span>
                  <span>{isSubmitting ? "Ipinapadala sa Barangay Hall..." : "IPADALA ANG EMERGENCY SAKLOLO NGAYON"}</span>
                </button>
                <span className="text-[10px] text-slate-500 block text-center mt-1.5">
                  Ipadadala agad ang live alert sa monitor ng Tanod Desk sa Barangay Hall.
                </span>
              </div>
            </form>
          ) : (
            /* SOS Confirmation Screen */
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-4xl mx-auto border-4 border-red-500 animate-pulse shadow-lg">
                🚨
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-300 inline-block">
                  LIVE SOS ALERT DISPATCHED
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Naisumite ang Emergency Alert!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Natanggap na ng Barangay Tibay Command Center ang ulat para sa <strong>{sentAlert.emergency_type}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Alert Reference:</span>
                  <span className="font-mono font-black text-red-700">{sentAlert.tracking_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purok / Lokasyon:</span>
                  <span className="font-bold text-slate-900">{sentAlert.purok_zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-bold text-slate-900">{sentAlert.contact_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado:</span>
                  <span className="font-black text-amber-600 uppercase text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                    ● AKTIBO / PAPUNTA NA ANG RESCUE
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#0A2540] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Naiintindihan, Isara Ito
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
