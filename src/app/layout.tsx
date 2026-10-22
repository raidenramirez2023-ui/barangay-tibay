import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/barangay/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0A2540",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Barangay Tibay — Opisyal na Community E-Services at Document Portal",
  description:
    "Mag-apply ng Barangay Indigency, Barangay Clearance, Certificate of Residency, at First Time Jobseeker (RA 11261) online sa Pamahalaang Pambarangay ng Tibay.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Barangay Tibay",
  },
  icons: {
    icon: "/images/brgy_tibay_seal.jpg",
    apple: "/images/brgy_tibay_seal.jpg",
  },
  keywords: [
    "Barangay Tibay",
    "Barangay Indigency",
    "Barangay Clearance",
    "Certificate of Residency",
    "E-Serbisyo",
    "Local Government",
    "Laguna",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fil"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
