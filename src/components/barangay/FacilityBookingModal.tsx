"use client";

import React, { useState, useEffect } from "react";
import type { ResidentProfile, FacilityItem, FacilityBooking } from "@/types/barangay";
import {
  getFacilityItems,
  getFacilityBookings,
  createFacilityBooking,
} from "@/lib/barangayService";

interface FacilityBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: ResidentProfile | null;
}

export function FacilityBookingModal({
  isOpen,
  onClose,
  resident,
}: FacilityBookingModalProps) {
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("fac-court");
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>("1:00 PM - 5:00 PM");
  const [purpose, setPurpose] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"book" | "my_bookings">("book");

  useEffect(() => {
    if (!isOpen || !resident) return;

    let isMounted = true;
    async function load() {
      const [facs, allBookings] = await Promise.all([
        getFacilityItems(),
        getFacilityBookings(),
      ]);

      if (isMounted) {
        setFacilities(facs);
        setBookings(allBookings);
      }
    }

    load();

    const handleSync = () => {
      load();
    };

    window.addEventListener("brgy_tibay_data_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener("brgy_tibay_data_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [isOpen, resident]);

  if (!isOpen || !resident) return null;

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  const residentBookings = bookings.filter(
    (b) =>
      b.resident_id === resident.id ||
      b.contact_number.replace(/\D/g, "") === resident.contact_number.replace(/\D/g, "")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) {
      alert("Pakilagay po ang layunin o detalye ng inyong paggamit.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const res = await createFacilityBooking({
      facility_id: selectedFacility.id,
      facility_name: selectedFacility.name,
      resident_id: resident.id,
      resident_name: resident.full_name,
      contact_number: resident.contact_number,
      purok_zone: resident.purok_zone,
      booking_date: bookingDate,
      time_slot: timeSlot,
      purpose: purpose.trim(),
    });

    setIsSubmitting(false);
    setFeedback({ success: res.success, message: res.message });

    if (res.success) {
      setPurpose("");
      const updated = await getFacilityBookings();
      setBookings(updated);
      setTimeout(() => {
        setActiveTab("my_bookings");
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDB415] text-[#0A2540] flex items-center justify-center text-xl font-black shrink-0 shadow-sm">
              🏀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#FDB415] uppercase tracking-wider">
                  Barangay Asset Management
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Online Booking
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Pasilidad at Kagamitan Reservation
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("book");
              setFeedback(null);
            }}
            className={`px-4 py-2 font-black text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === "book"
                ? "border-[#0A2540] text-[#0A2540] bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            📝 Mag-reserve ng Gamit / Court
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("my_bookings")}
            className={`px-4 py-2 font-black text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "my_bookings"
                ? "border-[#0A2540] text-[#0A2540] bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📋 Aking mga Na-book</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {residentBookings.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold border ${
                feedback.success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-rose-50 text-rose-800 border-rose-300"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {activeTab === "book" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. Facility / Equipment Cards */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 block">
                  1. Piliin ang Pasilidad o Kagamitan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {facilities.map((fac) => {
                    const isSelected = fac.id === selectedFacilityId;
                    return (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => setSelectedFacilityId(fac.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-2xl shrink-0 p-1 bg-white rounded-xl shadow-xs">
                          {fac.icon}
                        </span>
                        <div className="space-y-0.5">
                          <span className="font-black text-xs text-slate-900 block">
                            {fac.name}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 block">
                            {fac.fee_rate}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guidelines of selected item */}
              {selectedFacility && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block text-xs">
                    📌 Patakaran sa Paggamit ({selectedFacility.name}):
                  </span>
                  <p>{selectedFacility.guidelines}</p>
                </div>
              )}

              {/* 2. Date and Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    2. Petsa ng Paggamit:
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    3. Oras / Time Slot:
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="8:00 AM - 12:00 PM">8:00 AM - 12:00 PM (Umaga)</option>
                    <option value="1:00 PM - 5:00 PM">1:00 PM - 5:00 PM (Hapon)</option>
                    <option value="6:00 PM - 10:00 PM">6:00 PM - 10:00 PM (Gabi)</option>
                    <option value="Buong Araw">Buong Araw (Full Day Event)</option>
                  </select>
                </div>
              </div>

              {/* 3. Purpose */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">
                  4. Layunin o Event Details:
                </label>
                <textarea
                  required
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Halimbawa: Youth Basketball Game, Padasal ng pamilya, Birthday gathering, o Transport ng pasyente..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Resident Contact Info */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex flex-wrap justify-between gap-2">
                <span>Mag-rereserve: <strong>{resident.full_name}</strong></span>
                <span>Purok: <strong>{resident.purok_zone}</strong></span>
                <span>Contact: <strong>{resident.contact_number}</strong></span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#0A2540] hover:bg-[#07192c] text-[#FDB415] font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Ipinapasa..." : "✓ Isumite ang Reservation Request"}
              </button>
            </form>
          ) : (
            /* My Bookings Tab */
            <div className="space-y-3">
              {residentBookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Wala ka pang naisusumiteng reservation para sa court o kagamitan.
                </div>
              ) : (
                residentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                          {b.booking_code}
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          {b.facility_name}
                        </span>
                      </div>
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
                          ? "✓ INAPRUBAHAN"
                          : b.status === "rejected"
                          ? "✕ TINANGGIHAN"
                          : "⏳ PENDING REVIEW"}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                      <strong>Layunin:</strong> {b.purpose}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Petsa: <strong>{b.booking_date}</strong></span>
                      <span>Oras: <strong>{b.time_slot}</strong></span>
                      {b.staff_notes && (
                        <span className="text-blue-800 font-medium">
                          Note ng Staff: {b.staff_notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Isara
          </button>
        </div>

      </div>
    </div>
  );
}
