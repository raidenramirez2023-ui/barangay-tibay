"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function BarangayAdminLoginPage() {
  const router = useRouter();
  const [passkey, setPasskey] = useState("1234");
  const [officialRole, setOfficialRole] = useState("Hon. Punong Barangay");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passkey === "1234" || passkey.trim().length >= 4) {
      localStorage.setItem(
        "brgy_admin_session",
        JSON.stringify({ role: officialRole, loggedInAt: new Date().toISOString() })
      );
      router.push("/admin/dashboard");
    } else {
      setErrorMsg("Maling Passkey. Subukan ang default demo pin: 1234");
    }
  };

  return (
    <div className="min-h-screen bg-[#07172C] flex flex-col justify-center items-center p-4 text-slate-100 selection:bg-blue-500 font-sans relative">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#FDB415_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-6 text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#FDB415] shadow-lg mx-auto bg-white">
            <Image src="/images/brgy_tibay_seal.jpg" alt="Barangay Seal" fill className="object-cover" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FDB415] block">
              Tanggapan ng Pamahalaang Pambarangay
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">
              Barangay Tibay Hall Portal
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Official Administration & Document Approval Console
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs text-center font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider">
                Posisyon / Tanggapan ng Opisyal *
              </label>
              <select
                value={officialRole}
                onChange={(e) => setOfficialRole(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
              >
                <option value="Hon. Punong Barangay">Hon. Punong Barangay (Barangay Captain)</option>
                <option value="Barangay Secretary">Barangay Secretary (Records Officer)</option>
                <option value="Barangay Treasurer">Barangay Treasurer (Collections Desk)</option>
                <option value="Lupon Tagapamayapa">Lupon Tagapamayapa (Blotter Desk)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider">
                Barangay Hall Security Passkey / PIN *
              </label>
              <input
                type="password"
                required
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Ipasok ang 4-digit Passkey (Default: 1234)"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 font-mono font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
              />
              <span className="text-[10px] text-slate-500 block">Default Demo Passkey: <strong>1234</strong></span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#0A2540] hover:bg-blue-900 text-[#FDB415] font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>BUKSAN ANG BARANGAY ADMIN CONSOLE ➔</span>
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => handleLogin()}
              className="text-xs font-bold text-blue-800 hover:underline"
            >
              ⚡ 1-Click Quick Demo Login (Skip PIN)
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 text-center text-xs">
            <Link href="/" className="text-slate-500 hover:text-slate-800 font-bold">
              ← Bumalik sa Citizen Public Portal
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
