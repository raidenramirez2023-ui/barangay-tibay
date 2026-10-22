import { createClient } from "./supabase/client";
import type {
  DocumentRequest,
  RequestStatus,
  BlotterReport,
  BarangayAnnouncement,
  ResidentProfile,
  EmergencyAlert,
  AyudaProgram,
  AyudaClaim,
  FacilityItem,
  FacilityBooking,
  BookingStatus,
} from "@/types/barangay";

const STORAGE_KEY_REQUESTS = "brgy_tibay_requests_v1";
const STORAGE_KEY_BLOTTERS = "brgy_tibay_blotters_v1";
const STORAGE_KEY_ANNOUNCEMENTS = "brgy_tibay_announcements_v1";
const STORAGE_KEY_RESIDENTS = "brgy_tibay_residents_v1";
const STORAGE_KEY_ACTIVE_RESIDENT = "brgy_tibay_active_resident_v1";
const STORAGE_KEY_EMERGENCIES = "brgy_tibay_emergencies_v1";
const STORAGE_KEY_AYUDA_PROGRAMS = "brgy_tibay_ayuda_programs_v1";
const STORAGE_KEY_AYUDA_CLAIMS = "brgy_tibay_ayuda_claims_v1";
const STORAGE_KEY_BOOKINGS = "brgy_tibay_facility_bookings_v1";

// Helper for real-time cross-component / cross-tab broadcast
function notifyDataUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("brgy_tibay_data_updated"));
  }
}

// -----------------------------------------------------------------------------
// Realistic Barangay Residents Seed Data
// -----------------------------------------------------------------------------
export const DEFAULT_RESIDENTS: ResidentProfile[] = [
  {
    id: "res-001",
    full_name: "Rochelle Santos Dela Cruz",
    birthdate: "2004-03-15",
    civil_status: "Single",
    purok_zone: "Purok 1 Bayanihan",
    address: "Block 4, Lot 12, Bayanihan St., Purok 1",
    contact_number: "09178234561",
    email: "rochelle.delacruz@gmail.com",
    years_of_residency: 6,
    voter_status: "Registered Voter",
    valid_id_type: "Philippine National ID",
    valid_id_number: "PH-ID-2024-88419",
    monthly_income: 8500,
    avatar_initials: "RC",
  },
  {
    id: "res-002",
    full_name: "Danilo Ramos Fernandez",
    birthdate: "1982-11-04",
    civil_status: "Married",
    purok_zone: "Purok 3 Kaunlaran",
    address: "House 89, Kaunlaran Blvd., Purok 3",
    contact_number: "09281149923",
    email: "danilo.fernandez@yahoo.com",
    years_of_residency: 15,
    voter_status: "Registered Voter",
    valid_id_type: "Voter ID / Certificate",
    valid_id_number: "VOT-4001-923",
    monthly_income: 6000,
    avatar_initials: "DF",
  },
  {
    id: "res-003",
    full_name: "Kenneth John Alcantara",
    birthdate: "1998-07-22",
    civil_status: "Single",
    purok_zone: "Purok 2 Pag-asa",
    address: "Unit 3B, Pag-asa Compound, Purok 2",
    contact_number: "09456671234",
    email: "kenneth.alcantara@outlook.com",
    years_of_residency: 4,
    voter_status: "Registered Voter",
    valid_id_type: "Driver License",
    valid_id_number: "D02-14-554129",
    monthly_income: 18000,
    avatar_initials: "KA",
  },
  {
    id: "res-004",
    full_name: "Angelica Joy Morales",
    birthdate: "2005-01-30",
    civil_status: "Single",
    purok_zone: "Purok 5 Tagumpay",
    address: "14 Tagumpay Alley, Purok 5",
    contact_number: "09085523312",
    email: "angelica.morales@gmail.com",
    years_of_residency: 3,
    voter_status: "Non-Voter",
    valid_id_type: "Student ID",
    valid_id_number: "STU-2024-9912",
    monthly_income: 0,
    avatar_initials: "AM",
  },
];

// Initial Seed Data for realistic Barangay Operations
const DEFAULT_REQUESTS: DocumentRequest[] = [
  {
    id: "req-001",
    tracking_number: "BT-2026-IND-0142",
    resident_id: "res-001",
    document_type: "Barangay Indigency",
    full_name: "Rochelle Santos Dela Cruz",
    birthdate: "2004-03-15",
    civil_status: "Single",
    purok_zone: "Purok 1 Bayanihan",
    contact_number: "09178234561",
    email: "rochelle.delacruz@gmail.com",
    purpose: "CHED Tulong Dunong College Scholarship Application",
    valid_id_type: "Philippine National ID",
    valid_id_number: "PH-ID-2024-88419",
    monthly_income: 8500,
    fee_amount: 0.0,
    is_free: true,
    status: "approved",
    admin_notes: "Kumpirmadong residenteng kapos-palad ayon sa Lupon at Purok Leader. Libre alinsunod sa batas.",
    issued_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "req-002",
    tracking_number: "BT-2026-IND-0143",
    resident_id: "res-002",
    document_type: "Barangay Indigency",
    full_name: "Danilo Ramos Fernandez",
    birthdate: "1982-11-04",
    civil_status: "Married",
    purok_zone: "Purok 3 Kaunlaran",
    contact_number: "09281149923",
    email: "danilo.fernandez@yahoo.com",
    purpose: "Malasakit Center Medical & Hospitalization Assistance",
    valid_id_type: "Voter ID / Certificate",
    valid_id_number: "VOT-4001-923",
    monthly_income: 6000,
    fee_amount: 0.0,
    is_free: true,
    status: "ready_for_pickup",
    admin_notes: "Naka-print na ang Certificate of Indigency. Handa nang i-release sa Barangay Hall window 1.",
    issued_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "req-003",
    tracking_number: "BT-2026-CLR-0089",
    resident_id: "res-003",
    document_type: "Barangay Clearance",
    full_name: "Kenneth John Alcantara",
    birthdate: "1998-07-22",
    civil_status: "Single",
    purok_zone: "Purok 2 Pag-asa",
    contact_number: "09456671234",
    email: "kenneth.alcantara@outlook.com",
    purpose: "Local Job Employment (BPO / Call Center)",
    valid_id_type: "Driver License",
    valid_id_number: "D02-14-554129",
    monthly_income: 18000,
    fee_amount: 50.0,
    is_free: false,
    status: "under_review",
    admin_notes: "Biniberipika sa Barangay Blotter kung may nakabinbing kaso.",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "req-004",
    tracking_number: "BT-2026-JOB-0012",
    resident_id: "res-004",
    document_type: "First Time Jobseeker (RA 11261)",
    full_name: "Angelica Joy Morales",
    birthdate: "2005-01-30",
    civil_status: "Single",
    purok_zone: "Purok 5 Tagumpay",
    contact_number: "09085523312",
    email: "angelica.morales@gmail.com",
    purpose: "NBI & Police Clearance Requirements (RA 11261 First Time Worker)",
    valid_id_type: "Student ID",
    valid_id_number: "STU-2024-9912",
    monthly_income: 0,
    fee_amount: 0.0,
    is_free: true,
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "req-005",
    tracking_number: "BT-2026-RES-0051",
    resident_id: "res-002",
    document_type: "Certificate of Residency",
    full_name: "Danilo Ramos Fernandez",
    birthdate: "1982-11-04",
    civil_status: "Married",
    purok_zone: "Purok 3 Kaunlaran",
    contact_number: "09281149923",
    email: "danilo.fernandez@yahoo.com",
    purpose: "Meralco Electric Meter Connection Proof of Billing",
    valid_id_type: "Voter ID / Certificate",
    valid_id_number: "VOT-4001-923",
    monthly_income: 6000,
    fee_amount: 50.0,
    is_free: false,
    status: "released",
    admin_notes: "Nakuha na ng may-ari sa Barangay Hall noong kaninang umaga.",
    issued_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_BLOTTERS: BlotterReport[] = [
  {
    id: "blotter-001",
    case_number: "BLT-2026-004",
    complainant_name: "Maria Cristina Lopez",
    complainant_contact: "0917-555-1234",
    respondent_name: "Sari-sari Store Videoke / Purok 2",
    incident_type: "Noise Disturbance (Loud Videoke Past Curfew)",
    incident_location: "Purok 2 Pag-asa Main Road",
    incident_date: "2026-10-21",
    narrative: "Labis na lakas ng tugtog ng videoke alas-onse ng gabi na nakakagising sa mga nag-aaral na bata.",
    status: "mediation_scheduled",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_ANNOUNCEMENTS: BarangayAnnouncement[] = [
  {
    id: "ann-001",
    title: "Libreng Anti-Rabies Bakuna para sa mga Aso at Pusa",
    category: "Health & Medical",
    content: "Magsasagawa ang Municipal Agriculture Office at Barangay Tibay Health Center ng libreng pagbabakuna ngayong Sabado, 8:00 AM sa Barangay Covered Court.",
    is_urgent: false,
    published_by: "Barangay Health Center",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "ann-002",
    title: "Pamamahagi ng Educational Assistance para sa mga College Students",
    category: "Ayuda / Social Welfare",
    content: "Maghanda ng Certificate of Indigency at Enrollment Form para sa payout sa darating na Lunes sa Barangay Hall Session Room.",
    is_urgent: true,
    published_by: "Sangguniang Barangay",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyDataUpdated();
  } catch (err) {
    console.warn("localStorage error:", err);
  }
}

// -----------------------------------------------------------------------------
// Resident Management Functions
// -----------------------------------------------------------------------------
export function getAllResidents(): ResidentProfile[] {
  return getLocal<ResidentProfile[]>(STORAGE_KEY_RESIDENTS, DEFAULT_RESIDENTS);
}

export function getActiveResident(): ResidentProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_RESIDENT);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ResidentProfile;
  } catch {
    return null;
  }
}

export function setActiveResident(resident: ResidentProfile | null): void {
  if (typeof window === "undefined") return;
  if (!resident) {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_RESIDENT);
  } else {
    localStorage.setItem(STORAGE_KEY_ACTIVE_RESIDENT, JSON.stringify(resident));
  }
  notifyDataUpdated();
}

export function registerResident(
  data: Omit<ResidentProfile, "id" | "avatar_initials">
): ResidentProfile {
  const all = getAllResidents();
  const initials = data.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const newResident: ResidentProfile = {
    ...data,
    id: `res-${Date.now()}`,
    avatar_initials: initials || "BR",
  };

  const updated = [newResident, ...all];
  setLocal(STORAGE_KEY_RESIDENTS, updated);
  setActiveResident(newResident);
  return newResident;
}

export function findResidentByContactOrId(query: string): ResidentProfile | null {
  const all = getAllResidents();
  const clean = query.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    all.find(
      (r) =>
        r.id.toLowerCase() === query.trim().toLowerCase() ||
        r.contact_number.replace(/[^0-9]/g, "").includes(clean) ||
        r.full_name.toLowerCase().includes(query.trim().toLowerCase())
    ) || null
  );
}

// -----------------------------------------------------------------------------
// Document Requests Functions
// -----------------------------------------------------------------------------

/**
 * 1. Get All Requests (Admin View)
 */
export async function getDocumentRequests(): Promise<DocumentRequest[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("document_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEY_REQUESTS, data);
      return data as DocumentRequest[];
    }
  } catch {
    // fallback to local
  }

  return getLocal<DocumentRequest[]>(STORAGE_KEY_REQUESTS, DEFAULT_REQUESTS);
}

/**
 * 2. Get Requests by Resident ID or Contact Number (Citizen Dashboard)
 */
export async function getResidentRequests(
  residentIdOrContact: string
): Promise<DocumentRequest[]> {
  const all = await getDocumentRequests();
  const cleanQuery = residentIdOrContact.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  return all.filter((r) => {
    if (r.resident_id && r.resident_id.toLowerCase() === residentIdOrContact.trim().toLowerCase()) {
      return true;
    }
    const cleanContact = r.contact_number.replace(/[^0-9]/g, "");
    if (cleanContact.length >= 7 && cleanContact.includes(cleanQuery)) {
      return true;
    }
    return false;
  });
}

/**
 * 3. Track a Single Request by Tracking Number
 */
export async function trackDocumentRequest(
  trackingNumber: string
): Promise<DocumentRequest | null> {
  const clean = trackingNumber.trim().toUpperCase();
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("document_requests")
      .select("*")
      .eq("tracking_number", clean)
      .maybeSingle();

    if (!error && data) {
      return data as DocumentRequest;
    }
  } catch {
    // Fallback to local
  }

  const all = getLocal<DocumentRequest[]>(STORAGE_KEY_REQUESTS, DEFAULT_REQUESTS);
  return all.find((r) => r.tracking_number.toUpperCase() === clean) || null;
}

export const getRequestByTracking = trackDocumentRequest;

/**
 * 4. Create New Request (Citizen Submission)
 */
export async function createDocumentRequest(
  payload: Omit<DocumentRequest, "id" | "tracking_number" | "status" | "created_at" | "updated_at">
): Promise<{ success: boolean; data?: DocumentRequest; error?: string }> {
  // Generate GovPH standard tracking code: BT-2026-[TYPE]-[RANDOM4]
  const typeCode =
    payload.document_type === "Barangay Indigency"
      ? "IND"
      : payload.document_type === "Barangay Clearance"
      ? "CLR"
      : payload.document_type === "Certificate of Residency"
      ? "RES"
      : payload.document_type === "First Time Jobseeker (RA 11261)"
      ? "JOB"
      : payload.document_type === "Certificate of Low Income"
      ? "LOW"
      : "BIZ";

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const trackingNumber = `BT-2026-${typeCode}-${randomDigits}`;
  const now = new Date().toISOString();

  const newRecord: DocumentRequest = {
    ...payload,
    id: `req-${Date.now()}`,
    tracking_number: trackingNumber,
    status: "pending",
    created_at: now,
    updated_at: now,
  };

  // 1. Try Supabase
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("document_requests")
      .insert({
        tracking_number: trackingNumber,
        resident_id: payload.resident_id || null,
        document_type: payload.document_type,
        full_name: payload.full_name,
        birthdate: payload.birthdate,
        civil_status: payload.civil_status,
        purok_zone: payload.purok_zone,
        contact_number: payload.contact_number,
        email: payload.email || null,
        purpose: payload.purpose,
        valid_id_type: payload.valid_id_type,
        valid_id_number: payload.valid_id_number || null,
        monthly_income: payload.monthly_income || null,
        fee_amount: payload.fee_amount,
        is_free: payload.is_free,
        status: "pending",
      })
      .select()
      .single();

    if (!error && data) {
      const current = getLocal<DocumentRequest[]>(STORAGE_KEY_REQUESTS, DEFAULT_REQUESTS);
      setLocal(STORAGE_KEY_REQUESTS, [data as DocumentRequest, ...current]);
      return { success: true, data: data as DocumentRequest };
    }
  } catch {}

  // 2. Local fallback
  const current = getLocal<DocumentRequest[]>(STORAGE_KEY_REQUESTS, DEFAULT_REQUESTS);
  const updated = [newRecord, ...current];
  setLocal(STORAGE_KEY_REQUESTS, updated);

  return { success: true, data: newRecord };
}

/**
 * 5. Update Request Status (Barangay Staff / Official Action)
 */
export async function updateRequestStatus(
  id: string,
  newStatus: RequestStatus,
  adminNotes?: string
): Promise<{ success: boolean; data?: DocumentRequest; error?: string }> {
  const now = new Date().toISOString();
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("document_requests")
      .update({
        status: newStatus,
        admin_notes: adminNotes || null,
        issued_at:
          newStatus === "approved" || newStatus === "ready_for_pickup" || newStatus === "released"
            ? now
            : null,
        updated_at: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      const all = getLocal<DocumentRequest[]>(STORAGE_KEY_REQUESTS, DEFAULT_REQUESTS);
      const replaced = all.map((r) => (r.id === id ? (data as DocumentRequest) : r));
      setLocal(STORAGE_KEY_REQUESTS, replaced);
      return { success: true, data: data as DocumentRequest };
    }
  } catch {}

  // Local fallback
  const all = getLocal<DocumentRequest[]>(STORAGE_KEY_REQUESTS, DEFAULT_REQUESTS);
  let updatedRecord: DocumentRequest | undefined;
  const replaced = all.map((r) => {
    if (r.id === id) {
      updatedRecord = {
        ...r,
        status: newStatus,
        admin_notes: adminNotes !== undefined ? adminNotes : r.admin_notes,
        issued_at:
          newStatus === "approved" || newStatus === "ready_for_pickup" || newStatus === "released"
            ? (r.issued_at || now)
            : r.issued_at,
        updated_at: now,
      };
      return updatedRecord;
    }
    return r;
  });

  setLocal(STORAGE_KEY_REQUESTS, replaced);
  return { success: true, data: updatedRecord };
}

/**
 * 6. Blotter & Incident Reports
 */
export async function getBlotterReports(): Promise<BlotterReport[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("barangay_blotters")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEY_BLOTTERS, data);
      return data as BlotterReport[];
    }
  } catch {}

  return getLocal<BlotterReport[]>(STORAGE_KEY_BLOTTERS, DEFAULT_BLOTTERS);
}

export async function createBlotterReport(
  payload: Omit<BlotterReport, "id" | "case_number" | "status" | "created_at">
): Promise<{ success: boolean; data?: BlotterReport }> {
  const caseNumber = `BLT-2026-${String(Math.floor(100 + Math.random() * 900))}`;
  const now = new Date().toISOString();
  const newReport: BlotterReport = {
    ...payload,
    id: `blt-${Date.now()}`,
    case_number: caseNumber,
    status: "filed",
    created_at: now,
  };

  const current = getLocal<BlotterReport[]>(STORAGE_KEY_BLOTTERS, DEFAULT_BLOTTERS);
  setLocal(STORAGE_KEY_BLOTTERS, [newReport, ...current]);
  return { success: true, data: newReport };
}

/**
 * 7. Announcements
 */
export async function getAnnouncements(): Promise<BarangayAnnouncement[]> {
  return getLocal<BarangayAnnouncement[]>(STORAGE_KEY_ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
}

// -----------------------------------------------------------------------------
// 8. Emergency SOS Alert System
// -----------------------------------------------------------------------------
const DEFAULT_EMERGENCIES: EmergencyAlert[] = [
  {
    id: "sos-demo-1",
    tracking_code: "SOS-2026-MED-091",
    resident_id: "res-002",
    resident_name: "Danilo Ramos Fernandez",
    contact_number: "09281149923",
    purok_zone: "Purok 3 Kaunlaran",
    emergency_type: "Medical",
    details: "Mataas na lagnat at paninikip ng dibdib, kailangan ng agarang sasakyan papuntang ospital.",
    status: "dispatched",
    dispatched_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
];

export async function getEmergencyAlerts(): Promise<EmergencyAlert[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("emergency_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as EmergencyAlert[];
    }
  } catch {
    // fallback to local
  }
  return getLocal<EmergencyAlert[]>(STORAGE_KEY_EMERGENCIES, DEFAULT_EMERGENCIES);
}

export async function createEmergencyAlert(
  payload: Omit<EmergencyAlert, "id" | "tracking_code" | "status" | "created_at">
): Promise<{ success: boolean; data?: EmergencyAlert }> {
  const codePrefix =
    payload.emergency_type === "Medical"
      ? "MED"
      : payload.emergency_type === "Fire"
      ? "FIRE"
      : payload.emergency_type === "Tanod / Police"
      ? "SEC"
      : "FLOD";
  const randomDigits = Math.floor(100 + Math.random() * 900);
  const trackingCode = `SOS-2026-${codePrefix}-${randomDigits}`;
  const now = new Date().toISOString();

  let newAlert: EmergencyAlert = {
    ...payload,
    id: `sos-${Date.now()}`,
    tracking_code: trackingCode,
    status: "active",
    created_at: now,
  };

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("emergency_alerts")
      .insert({
        tracking_code: trackingCode,
        resident_id: payload.resident_id,
        resident_name: payload.resident_name,
        contact_number: payload.contact_number,
        purok_zone: payload.purok_zone,
        emergency_type: payload.emergency_type,
        details: payload.details,
        status: "active",
        created_at: now,
      })
      .select()
      .single();

    if (!error && data) {
      newAlert = data as EmergencyAlert;
    }
  } catch {
    // ignore
  }

  const current = getLocal<EmergencyAlert[]>(STORAGE_KEY_EMERGENCIES, DEFAULT_EMERGENCIES);
  setLocal(STORAGE_KEY_EMERGENCIES, [newAlert, ...current.filter((c) => c.id !== newAlert.id)]);
  notifyDataUpdated();
  return { success: true, data: newAlert };
}

export async function updateEmergencyAlertStatus(
  id: string,
  newStatus: "dispatched" | "resolved"
): Promise<{ success: boolean; data?: EmergencyAlert }> {
  const now = new Date().toISOString();

  try {
    const supabase = createClient();
    await supabase
      .from("emergency_alerts")
      .update({
        status: newStatus,
        dispatched_at: newStatus === "dispatched" ? now : undefined,
        resolved_at: newStatus === "resolved" ? now : undefined,
      })
      .eq("id", id);
  } catch {
    // ignore
  }

  const all = getLocal<EmergencyAlert[]>(STORAGE_KEY_EMERGENCIES, DEFAULT_EMERGENCIES);
  let target: EmergencyAlert | undefined;
  const updated = all.map((item) => {
    if (item.id === id) {
      target = {
        ...item,
        status: newStatus,
        dispatched_at: newStatus === "dispatched" ? now : item.dispatched_at,
        resolved_at: newStatus === "resolved" ? now : item.resolved_at,
      };
      return target;
    }
    return item;
  });

  setLocal(STORAGE_KEY_EMERGENCIES, updated);
  notifyDataUpdated();
  return { success: true, data: target };
}

// -----------------------------------------------------------------------------
// 9. Staff Resident QR Verification Helper
// -----------------------------------------------------------------------------
export async function verifyResidentRecord(query: string): Promise<{
  verified: boolean;
  resident?: ResidentProfile;
  activeRequestsCount: number;
  hasBlotterCase: boolean;
  blotterCaseDetails?: string;
}> {
  const resident = findResidentByContactOrId(query);
  if (!resident) {
    return { verified: false, activeRequestsCount: 0, hasBlotterCase: false };
  }

  const allReqs = await getDocumentRequests();
  const residentReqs = allReqs.filter(
    (r) =>
      r.resident_id === resident.id ||
      r.contact_number.replace(/\D/g, "") === resident.contact_number.replace(/\D/g, "")
  );

  const blotters = await getBlotterReports();
  const blotterMatch = blotters.find(
    (b) =>
      b.respondent_name &&
      b.respondent_name.toLowerCase().includes(resident.full_name.toLowerCase()) &&
      b.status !== "resolved"
  );

  return {
    verified: true,
    resident,
    activeRequestsCount: residentReqs.length,
    hasBlotterCase: Boolean(blotterMatch),
    blotterCaseDetails: blotterMatch ? `${blotterMatch.case_number} - ${blotterMatch.incident_type}` : undefined,
  };
}

// -----------------------------------------------------------------------------
// 10. Ayuda & Relief Goods Distribution Service (Anti-Doble Claim)
// -----------------------------------------------------------------------------
const DEFAULT_AYUDA_PROGRAMS: AyudaProgram[] = [
  {
    id: "ayuda-prog-001",
    title: "Bayanihan Rice Subsidy (Batch 3 - 10kg Premium Jasmine)",
    description: "Pamamahagi ng 10kg sako ng de-kalidad na bigas sa bawat rehistradong sambahayan sa Barangay Tibay.",
    item_details: "1x 10kg Premium Rice Sack + 4 Canned Goods + 4 Instant Noodles",
    distribution_date: "Oktubre 24 - 26, 2026 • 8:00 AM - 5:00 PM",
    distribution_venue: "Barangay Tibay Covered Court (Talahanayan 1 hanggang 4)",
    target_beneficiaries: "Lahat ng Rehistradong Residente / Sambahayan",
    status: "ongoing",
  },
  {
    id: "ayuda-prog-002",
    title: "Senior Citizen & PWD Calamity & Inflation Cash Aid (₱1,500)",
    description: "Ayudang pinansyal mula sa LGU para sa mga nakatatanda at may kapansanan.",
    item_details: "₱1,500 Cash Assistance + Maintenance Multivitamins (1 Box)",
    distribution_date: "Nobyembre 5, 2026 • 9:00 AM - 3:00 PM",
    distribution_venue: "Barangay Health Center Desk",
    target_beneficiaries: "Senior Citizens at PWD ID Holders",
    status: "upcoming",
  },
];

const DEFAULT_AYUDA_CLAIMS: AyudaClaim[] = [
  {
    id: "claim-001",
    program_id: "ayuda-prog-001",
    program_title: "Bayanihan Rice Subsidy (Batch 3 - 10kg Premium Jasmine)",
    resident_id: "res-001",
    resident_name: "Juan Dela Cruz",
    contact_number: "09171234567",
    purok_zone: "Purok 1 Bayanihan",
    claim_stub_number: "STUB-2026-RICE-001",
    qr_claim_code: "STUB-2026-RICE-001",
    status: "eligible",
    notified_at: "2026-10-22T08:00:00.000Z",
    remarks: "Kasama sa Opisyal na Sensus Masterlist (Pamilya Dela Cruz)",
  },
  {
    id: "claim-002",
    program_id: "ayuda-prog-001",
    program_title: "Bayanihan Rice Subsidy (Batch 3 - 10kg Premium Jasmine)",
    resident_id: "res-002",
    resident_name: "Maria Clara Santos",
    contact_number: "09189876543",
    purok_zone: "Purok 2 Pag-asa",
    claim_stub_number: "STUB-2026-RICE-002",
    qr_claim_code: "STUB-2026-RICE-002",
    status: "claimed",
    claimed_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    claimed_by_representative: "Maria Clara Santos (Mismong Benepisyaryo)",
    notified_at: "2026-10-22T08:00:00.000Z",
    remarks: "Naipagkaloob na sa Talahanayan 2",
  },
  {
    id: "claim-003",
    program_id: "ayuda-prog-001",
    program_title: "Bayanihan Rice Subsidy (Batch 3 - 10kg Premium Jasmine)",
    resident_id: "res-003",
    resident_name: "Rochelle Ramos",
    contact_number: "09205554321",
    purok_zone: "Purok 3 Bayanihan",
    claim_stub_number: "STUB-2026-RICE-003",
    qr_claim_code: "STUB-2026-RICE-003",
    status: "eligible",
    notified_at: "2026-10-22T08:30:00.000Z",
    remarks: "Kasama sa Opisyal na Sensus Masterlist",
  },
];

export async function getAyudaPrograms(): Promise<AyudaProgram[]> {
  return getLocal<AyudaProgram[]>(STORAGE_KEY_AYUDA_PROGRAMS, DEFAULT_AYUDA_PROGRAMS);
}

export async function getAyudaClaims(): Promise<AyudaClaim[]> {
  return getLocal<AyudaClaim[]>(STORAGE_KEY_AYUDA_CLAIMS, DEFAULT_AYUDA_CLAIMS);
}

export async function getResidentAyudaClaims(residentIdOrContact: string): Promise<AyudaClaim[]> {
  const all = await getAyudaClaims();
  const cleanQuery = residentIdOrContact.trim().toLowerCase();
  const cleanDigits = residentIdOrContact.replace(/\D/g, "");

  return all.filter(
    (c) =>
      c.resident_id.toLowerCase() === cleanQuery ||
      c.contact_number.replace(/\D/g, "") === cleanDigits ||
      c.resident_name.toLowerCase().includes(cleanQuery)
  );
}

export async function enrollResidentsToAyudaProgram(
  programId: string,
  residentIds: string[]
): Promise<{ addedCount: number; updatedClaims: AyudaClaim[] }> {
  const [allProgs, allClaims] = await Promise.all([
    getAyudaPrograms(),
    getAyudaClaims(),
  ]);
  const allResidents = getAllResidents();

  const prog = allProgs.find((p) => p.id === programId) || allProgs[0];
  const updated = [...allClaims];
  let addedCount = 0;

  for (const resId of residentIds) {
    const res = allResidents.find((r) => r.id === resId);
    if (!res) continue;

    // Check if resident already enrolled in this program
    const existing = updated.find((c) => c.program_id === prog.id && c.resident_id === res.id);
    if (!existing) {
      const stubSeq = String(updated.filter((c) => c.program_id === prog.id).length + 1).padStart(3, "0");
      const stubCode = prog.title.toLowerCase().includes("rice") ? "RICE" : "AID";
      const stubNo = `STUB-2026-${stubCode}-${stubSeq}`;

      const newClaim: AyudaClaim = {
        id: `claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        program_id: prog.id,
        program_title: prog.title,
        resident_id: res.id,
        resident_name: res.full_name,
        contact_number: res.contact_number,
        purok_zone: res.purok_zone,
        claim_stub_number: stubNo,
        qr_claim_code: stubNo,
        status: "eligible",
        notified_at: new Date().toISOString(),
        remarks: "Kabilang sa Opisyal na Sensus Masterlist ng Barangay",
      };
      updated.push(newClaim);
      addedCount++;
    }
  }

  setLocal(STORAGE_KEY_AYUDA_CLAIMS, updated);
  return { addedCount, updatedClaims: updated };
}

export async function processAyudaClaim(
  stubOrQuery: string,
  representativeName?: string
): Promise<{
  success: boolean;
  message: string;
  claim?: AyudaClaim;
  alreadyClaimed?: boolean;
}> {
  const all = await getAyudaClaims();
  const clean = stubOrQuery.trim().toLowerCase();
  const cleanDigits = stubOrQuery.replace(/\D/g, "");

  const foundIndex = all.findIndex((c) => {
    const matchStub = c.claim_stub_number && c.claim_stub_number.toLowerCase() === clean;
    const matchQr = c.qr_claim_code && c.qr_claim_code.toLowerCase() === clean;
    const matchId = c.resident_id.toLowerCase() === clean;
    const matchName = c.resident_name.toLowerCase().includes(clean);
    const matchContact = cleanDigits.length >= 7 && c.contact_number.replace(/\D/g, "") === cleanDigits;
    return matchStub || matchQr || matchId || matchName || matchContact;
  });

  if (foundIndex === -1) {
    return {
      success: false,
      message: "Walang nahanap na tala ng Ayuda Claim para sa Claim Stub, Pangalan, o ID na ito.",
    };
  }

  const existingClaim = all[foundIndex];

  if (existingClaim.status === "claimed") {
    const claimDate = existingClaim.claimed_at
      ? new Date(existingClaim.claimed_at).toLocaleString("fil-PH", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "kanina";

    return {
      success: false,
      alreadyClaimed: true,
      message: `BAWAL ANG DOBLE CLAIM! Nakuha na ito noong ${claimDate} ni: ${
        existingClaim.claimed_by_representative || existingClaim.resident_name
      }.`,
      claim: existingClaim,
    };
  }

  const updatedClaim: AyudaClaim = {
    ...existingClaim,
    status: "claimed",
    claimed_at: new Date().toISOString(),
    claimed_by_representative: representativeName?.trim() || `${existingClaim.resident_name} (Mismong Residente)`,
  };

  const updatedAll = [...all];
  updatedAll[foundIndex] = updatedClaim;
  setLocal(STORAGE_KEY_AYUDA_CLAIMS, updatedAll);

  return {
    success: true,
    message: `Matagumpay na na-release ang Ayuda para kay ${updatedClaim.resident_name} (Stub #${updatedClaim.claim_stub_number})!`,
    claim: updatedClaim,
  };
}

// -----------------------------------------------------------------------------
// 11. Facility & Equipment Booking Service
// -----------------------------------------------------------------------------
export const DEFAULT_FACILITY_ITEMS: FacilityItem[] = [
  {
    id: "fac-court",
    name: "Barangay Tibay Covered Court",
    category: "facility",
    icon: "🏀",
    fee_rate: "Libre para sa Residente (₱100/oras sa gabi para sa kuryente)",
    guidelines: "Magsuot ng tamang sapatos (rubber shoes). Bawal ang alak at paninigarilyo sa loob ng court.",
  },
  {
    id: "eq-tent",
    name: "Heavy-Duty Canopy Tolda / Tent (Set ng 2)",
    category: "equipment",
    icon: "⛺",
    fee_rate: "Libre para sa Residente",
    guidelines: "Gamitin nang may pag-iingat para sa lamay, padasal, o anibersaryo. Ingatan ang mga dugtungan ng bakal.",
    available_units: 5,
  },
  {
    id: "eq-chairs",
    name: "Monoblock Chairs & Folding Tables (50 Chairs + 5 Tables)",
    category: "equipment",
    icon: "🪑",
    fee_rate: "Libre para sa Residente",
    guidelines: "Kailangang ibalik sa barangay hall nang buo at malinis sa loob ng 24 oras matapos ang okasyon.",
    available_units: 4,
  },
  {
    id: "veh-ambulance",
    name: "Barangay Ambulance / Patient Transport Van",
    category: "vehicle",
    icon: "🚐",
    fee_rate: "Libre / Priority sa May Sakit at Emergency",
    guidelines: "Ihatid ang pasyente sa ospital sa Santa Cruz o katabing bayan. May kasamang opisyal na Barangay Tanod driver.",
    available_units: 1,
  },
];

const DEFAULT_BOOKINGS: FacilityBooking[] = [
  {
    id: "bk-001",
    booking_code: "BK-2026-001",
    facility_id: "fac-court",
    facility_name: "Barangay Tibay Covered Court",
    resident_id: "res-001",
    resident_name: "Juan Dela Cruz",
    contact_number: "09171234567",
    purok_zone: "Purok 1 Bayanihan",
    purpose: "Purok 1 Youth Friendship Basketball Game",
    booking_date: "2026-10-24",
    time_slot: "6:00 PM - 8:00 PM",
    status: "approved",
    staff_notes: "Inaprubahan ng Tanggapan ng Barangay Secretary.",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "bk-002",
    booking_code: "BK-2026-002",
    facility_id: "eq-tent",
    facility_name: "Heavy-Duty Canopy Tolda / Tent (Set ng 2)",
    resident_id: "res-002",
    resident_name: "Maria Clara Santos",
    contact_number: "09189876543",
    purok_zone: "Purok 2 Pag-asa",
    purpose: "Padasal at Babang-Luksa sa Purok 2",
    booking_date: "2026-10-27",
    time_slot: "Buong Araw",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export async function getFacilityItems(): Promise<FacilityItem[]> {
  return DEFAULT_FACILITY_ITEMS;
}

export async function getFacilityBookings(): Promise<FacilityBooking[]> {
  return getLocal<FacilityBooking[]>(STORAGE_KEY_BOOKINGS, DEFAULT_BOOKINGS);
}

export async function createFacilityBooking(
  payload: Omit<FacilityBooking, "id" | "booking_code" | "status" | "created_at">
): Promise<{ success: boolean; message: string; data?: FacilityBooking }> {
  const current = await getFacilityBookings();

  // Conflict detection: same facility, same date, and overlapping slot (or "Buong Araw")
  const conflict = current.find(
    (b) =>
      b.facility_id === payload.facility_id &&
      b.booking_date === payload.booking_date &&
      b.status === "approved" &&
      (b.time_slot === payload.time_slot || b.time_slot === "Buong Araw" || payload.time_slot === "Buong Araw")
  );

  if (conflict) {
    return {
      success: false,
      message: `May na-aprubahan nang reservation para sa ${payload.facility_name} sa petsang ${payload.booking_date} (${conflict.time_slot}) ni ${conflict.resident_name}. Pumili po ng ibang oras o petsa.`,
    };
  }

  const randomNum = Math.floor(100 + Math.random() * 900);
  const newBooking: FacilityBooking = {
    ...payload,
    id: `bk-${Date.now()}`,
    booking_code: `BK-2026-${randomNum}`,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  setLocal(STORAGE_KEY_BOOKINGS, [newBooking, ...current]);
  return {
    success: true,
    message: "Matagumpay na naisumite ang inyong reservation request para sa pagsusuri ng Barangay!",
    data: newBooking,
  };
}

export async function updateFacilityBookingStatus(
  id: string,
  newStatus: BookingStatus,
  staffNotes?: string
): Promise<{ success: boolean; data?: FacilityBooking }> {
  const all = await getFacilityBookings();
  let updatedItem: FacilityBooking | undefined;

  const updated = all.map((b) => {
    if (b.id === id) {
      updatedItem = {
        ...b,
        status: newStatus,
        staff_notes: staffNotes !== undefined ? staffNotes : b.staff_notes,
      };
      return updatedItem;
    }
    return b;
  });

  setLocal(STORAGE_KEY_BOOKINGS, updated);
  return { success: true, data: updatedItem };
}

