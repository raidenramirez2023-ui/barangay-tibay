"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Smartphone, X, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari standalone check
      window.navigator.standalone === true
    );
  });
  const [isIos] = useState(() => {
    if (typeof window === "undefined") return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem("brgy_pwa_prompt_dismissed"));
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    const media = window.matchMedia("(display-mode: standalone)");
    const handleDisplayChange = (evt: MediaQueryListEvent) => {
      setIsStandalone(evt.matches);
    };
    media.addEventListener("change", handleDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      media.removeEventListener("change", handleDisplayChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      alert(
        "Upang i-install sa iyong Android phone o Chrome Browser, pindutin ang tatlong tuldok (⋮) sa browser menu at piliin ang 'Install app' o 'Add to Home screen'."
      );
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn("PWA install error:", err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("brgy_pwa_prompt_dismissed", "true");
    }
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Enterprise Installation Banner */}
      <div className="w-full bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-md relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-700 shadow-xs shrink-0 bg-white">
              <Image
                src="/images/brgy_tibay_seal.jpg"
                alt="Barangay App Icon"
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  PWA Mobile App
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold hidden xs:inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Libre & Walang Download sa App Store
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">
                I-install ang Barangay Tibay Portal sa Cellphone
              </h3>
              <p className="text-[11px] text-slate-300 leading-snug">
                Magkaroon ng shortcut icon sa iyong Home Screen para sa mabilisang e-services at live tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#FDB415] hover:bg-amber-400 text-[#0A2540] font-bold text-xs shadow-sm transition cursor-pointer inline-flex items-center justify-center gap-1.5 text-center"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>I-Install ang App</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer text-center"
              title="Isara sa ngayon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-slate-900 space-y-4 shadow-xl border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                <Smartphone className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Pag-install sa Apple iPhone / iPad
              </h3>
              <p className="text-xs text-slate-500">
                Sundin ang 2 madaling hakbang sa iyong Safari browser:
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="text-slate-700 leading-snug">
                  Pindutin ang <strong>Share button</strong> sa ilalim ng Safari (icon na may parisukat at pataas na arrow).
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="text-slate-700 leading-snug">
                  I-scroll pababa at piliin ang <strong>&quot;Add to Home Screen&quot;</strong> (+ icon), pagkatapos ay pindutin ang <strong>Add</strong> sa kanang itaas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
            >
              Naiintindihan Ko
            </button>
          </div>
        </div>
      )}
    </>
  );
}
