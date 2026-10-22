export type BarangayDocumentType =
  | "Barangay Indigency"
  | "Barangay Clearance"
  | "Certificate of Residency"
  | "Certificate of Low Income"
  | "First Time Jobseeker (RA 11261)"
  | "Barangay Business Clearance";

export type RequestStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "ready_for_pickup"
  | "released"
  | "rejected";

export interface ResidentProfile {
  id: string; // e.g. "RES-2024-0142"
  full_name: string;
  birthdate: string;
  civil_status: "Single" | "Married" | "Widowed" | "Separated";
  purok_zone: string;
  contact_number: string;
  email?: string;
  address: string;
  years_of_residency: number;
  voter_status: "Registered Voter" | "Non-Voter";
  valid_id_type: string;
  valid_id_number: string;
  monthly_income?: number;
  avatar_initials: string;
}

export interface DocumentRequest {
  id: string;
  tracking_number: string;
  resident_id?: string;
  document_type: BarangayDocumentType;
  full_name: string;
  birthdate: string;
  civil_status: "Single" | "Married" | "Widowed" | "Separated";
  purok_zone: string;
  contact_number: string;
  email?: string;
  purpose: string;
  valid_id_type: string;
  valid_id_number?: string;
  monthly_income?: number;
  fee_amount: number;
  is_free: boolean;
  status: RequestStatus;
  admin_notes?: string;
  issued_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlotterReport {
  id: string;
  case_number: string;
  complainant_name: string;
  complainant_contact: string;
  respondent_name?: string;
  incident_type: string;
  incident_location: string;
  incident_date: string;
  narrative: string;
  status: "filed" | "mediation_scheduled" | "resolved" | "referred_to_police";
  created_at: string;
}

export interface BarangayAnnouncement {
  id: string;
  title: string;
  category: "Health & Medical" | "Ayuda / Social Welfare" | "Clean-Up & Ecology" | "Security Advisory";
  content: string;
  is_urgent: boolean;
  published_by: string;
  created_at: string;
}

export type EmergencyType = "Medical" | "Fire" | "Tanod / Police" | "Flood / Rescue";

export interface EmergencyAlert {
  id: string;
  tracking_code: string;
  resident_id?: string;
  resident_name: string;
  contact_number: string;
  purok_zone: string;
  emergency_type: EmergencyType;
  details?: string;
  status: "active" | "dispatched" | "resolved";
  dispatched_at?: string;
  resolved_at?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Ayuda & Relief Goods Distribution Types
// ---------------------------------------------------------------------------
export interface AyudaProgram {
  id: string;
  title: string;
  description: string;
  item_details: string;
  distribution_date: string;
  distribution_venue: string;
  target_beneficiaries: string;
  status: "upcoming" | "ongoing" | "completed";
}

export interface AyudaClaim {
  id: string;
  program_id: string;
  program_title: string;
  resident_id: string;
  resident_name: string;
  contact_number: string;
  purok_zone: string;
  claim_stub_number: string; // e.g. "STUB-2026-RICE-001"
  qr_claim_code?: string; // backwards compatibility
  status: "eligible" | "claimed";
  claimed_at?: string;
  claimed_by_representative?: string;
  notified_at?: string;
  remarks?: string;
}

// ---------------------------------------------------------------------------
// Facility & Equipment Booking Types
// ---------------------------------------------------------------------------
export type FacilityCategory = "facility" | "equipment" | "vehicle";

export interface FacilityItem {
  id: string;
  name: string;
  category: FacilityCategory;
  icon: string;
  fee_rate: string;
  guidelines: string;
  available_units?: number;
}

export type BookingStatus = "pending" | "approved" | "rejected" | "completed";

export interface FacilityBooking {
  id: string;
  booking_code: string;
  facility_id: string;
  facility_name: string;
  resident_id?: string;
  resident_name: string;
  contact_number: string;
  purok_zone: string;
  purpose: string;
  booking_date: string;
  time_slot: string;
  status: BookingStatus;
  staff_notes?: string;
  created_at: string;
}
